from flask.views import MethodView
from flask import request, Response, abort, send_file, render_template, redirect, url_for
from .forms import *
from werkzeug.exceptions import BadRequest
from werkzeug.utils import secure_filename
from .models import *
import json
import jwt
from app import db, app
from sqlalchemy.exc import IntegrityError
from hashlib import sha256
from datetime import datetime
from os import path
import io


def validate_user(func):
    def validator(*args, **kwargs):
        try:
            _type, token = request.headers.get("Authorization").split()

            if _type == 'Bearer' and token:
                try:
                    user = jwt.decode(token, app.config['SECRET_KEY'], 'HS256')

                    if TokenBlackList.query.filter_by(token=token.encode('utf-8')).first():
                        return Response(response=json.dumps({'error': 'token is no longer valid'}), status=400,
                                                            mimetype='application/json')

                    return func(user=user, *args, **kwargs)

                except jwt.ExpiredSignatureError:
                    return Response(response=json.dumps({'error': 'token has expired'}), status=400,
                                                        mimetype='application/json')
                except jwt.InvalidTokenError:
                    return Response(response=json.dumps({'error': 'invalid user'}), status=400, mimetype='application/json')
            else:
                return Response(response=json.dumps({'error': 'invalid token'}), status=400, mimetype='application/json')
        except KeyError:
            return Response(response=json.dumps({'error': 'token required'}), status=400, mimetype='application/json')

    return validator


class RegisterAPI(MethodView):
    def post(self):
        form = RegisterForm(csrf_enabled=False)

        if form.validate_on_submit():
            email = form.email.data
            
            if ('@' not in email):
                return Response(response=json.dumps({'error': 'Invalid email address'}), status=400,
                                                mimetype='application/json')
            else:
                email = email.lower()
            username = form.username.data
            password = form.password.data
            firstname = form.firstname.data
            lastname = form.lastname.data
            location = form.location.data
            biography = form.biography.data
            photo = form.photo.data
            filename = secure_filename(photo.filename)

            photo.save(path.join(app.config['UPLOADED_IMAGES_DEST'], filename))
            user = Users()
            m = sha256()
            m.update(password)

            user.email = email
            user.username = username
            user.firstname = firstname
            user.lastname = lastname
            user.location = location
            user.biography = biography
            user.password = m.digest()
            user.profile_photo = filename
            db.session.add(user)
            db.session.commit()

            return Response(response=json.dumps({'status': 'success'}), status=200, mimetype='application/json')
        return Response(response=json.dumps({'error': 'all registration information is required'}), status=400,
                                                mimetype='application/json')


class LoginAPI(MethodView):
    def post(self):
        try:

            data = request.get_json()
            m = sha256()
            m.update(data['password'])

            username = data['username']
            password = m.digest()
            user = Users.query.filter_by(username=username, password=password).first()
            if user:
                curr_date = datetime.now()
                exp = datetime(curr_date.year+1, curr_date.month, curr_date.day, curr_date.hour, curr_date.minute)
                token = jwt.encode({"username": username, "exp": exp, "user_id": user.id}, app.config['SECRET_KEY'], algorithm='HS256')

                return Response(response=json.dumps({'token': token, "user_id": user.id}), status=200, mimetype='application/json')
            else:
                return Response(response=json.dumps({'error': 'invalid username or password'}), status=400,
                                                    mimetype='application/json')
        except BadRequest or KeyError:
            return Response(response=json.dumps({'error': 'username and password required'}), status=400,
                                                mimetype='application/json')
        except TypeError:
            return Response(response=json.dumps({'error': 'username and password required'}), status=400,
                                                mimetype='application/json')

class LogoutAPI(MethodView):
    def get(self):
        try:
            _type, token = request.headers.get("Authorization").split()

            if _type == 'Bearer' and token and jwt.decode(token, app.config['SECRET_KEY'], 'HS256'):
                tokenBlackList = TokenBlackList(token=token.encode('utf-8'))
                db.session.add(tokenBlackList)
                db.session.commit()
            return Response(response=json.dumps({'status': 'successful'}), status=200, mimetype='application/json')

        except KeyError:
            return Response(response=json.dumps({'status': 'failed. No token provided'}), status=400, mimetype='application/json')
        except IntegrityError:
            return Response(response=json.dumps({'status': 'successful'}), status=200, mimetype='application/json')


class UserPostAPI(MethodView):

    @validate_user
    def post(self, user_id, user):
        form = PostForm(csrf_enabled=False)

        if user_id == user['user_id']:
            if form.validate_on_submit():
                post = Post()
                post.user_id = user_id
                post.caption = form.caption.data
                photo = form.photo.data
                filename = secure_filename(photo.filename)
                photo.save(path.join(app.config['UPLOADED_IMAGES_DEST'], filename))
                post.photo = filename
                post.created_on = datetime.utcnow()

                db.session.add(post)
                db.session.commit()
                return Response(response=json.dumps({'post_id': post.id}), status=200, mimetype='application/json')

            else:
                return Response(response=json.dumps({'error': 'caption and photo required'}),
                                status=400, mimetype='application/json')

        return Response(response=json.dumps({'error': 'user is not authorized to make such actions'}), status=403, mimetype='application/json')

    @validate_user
    def get(self, user_id, user):
        usr = Users.query.filter_by(id=user_id).first()

        if usr:
            posts = []
            for post in Post.query.filter_by(user_id=user_id):
                likes = Like.query.filter_by(post_id=post.id).count()
                temp = {"photo":'/api/users/uploads/' +  post.photo}
                posts.append(temp)
                
            return Response(response=json.dumps({'posts': posts, "user": usr.firstname + " " + usr.lastname,
                "bio": usr.biography, "joined": usr.joined_on.strftime("%B %d, %Y"), "addr": usr.location, "total_post": len(posts),
                "usr_photo": '/api/users/uploads/' + usr.profile_photo, "followers": Follow.query.filter_by(user_id=user_id).count(),
                "following": True if Follow.query.filter_by(user_id=user_id, follower_id=user['user_id']).first() else False
            }), status=200, mimetype='application/json')
        else:
            return Response(response=json.dumps({'error': 'user does not exist'}), status=400, mimetype='application/json')


class FollowAPI(MethodView):

    @validate_user
    def post(self, user_id, user):
        usr = Users.query.filter_by(id=user_id).first()

        if usr and user_id != user['user_id']:
            if not Follow.query.filter_by(user_id=user_id, follower_id=user['user_id']).first():
                follower = Follow(user_id=user_id, follower_id=user['user_id'])
                db.session.add(follower)
                db.session.commit()

            return Response(response=json.dumps({"status": 'successful'}), status=200, mimetype='application/json')
        elif not usr:
            return Response(response=json.dumps({"error": "user does not exist"}), status=400, mimetype='application/json')
        else:
            return Response(status=400, mimetype='application/json')


class PostAPI(MethodView):

    @validate_user
    def get(self, user):
        posts = []
        for post in Post.query.all():
            usr = Users.query.filter_by(id=post.user_id).first()
            if usr:
                posts.append({"post_id": post.id, "user_id":post.user_id, "details": {"caption": post.caption, "photo": '/api/users/uploads/' + post.photo, 
            "user": usr.username, "img": '/api/users/uploads/' + usr.profile_photo, "posted": (post.created_on.strftime("%B %d, %Y") if post.created_on else None)
        , "likes": Like.query.filter_by(post_id=post.id).count(), "liked":True if Like.query.filter_by(post_id=post.id, user_id=user['user_id']).first() else False }})
        return Response(response=json.dumps({'posts': posts}), status=200, mimetype='application/json')


class PostLikeAPI(MethodView):

    @validate_user
    def post(self, post_id, user):
        post = Post.query.filter_by(id=post_id).first()

        if post:
            if not Like.query.filter_by(user_id=user['user_id'], post_id=post_id).first():
                like = Like(user_id=user['user_id'], post_id=post_id)
                db.session.add(like)
                db.session.commit()

            return Response(response=json.dumps({'likes': Like.query.filter_by(post_id=post_id).count()}), status=200, mimetype='application/json')
        else:
            return Response(response=json.dumps({'error': "post does not exist"}), status=400, mimetype='application/json')


class ViewUploadAPI(MethodView):

    def get(self, filename):
        file_path = path.join(app.config['UPLOADED_IMAGES_DEST'], filename)
        if path.exists(file_path):
            filename = file_path.strip("/app/")
            return send_file(filename, mimetype='image')
        else:
            abort(404)

class Index(MethodView):
    def get(self):
        return render_template("index.html")