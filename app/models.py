from app import db
import datetime


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer)
    photo = db.Column(db.String(3000))
    caption = db.Column(db.String(300))
    created_on = db.Column(db.DateTime)


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(20), unique=True)
    password = db.Column(db.Binary)
    firstname = db.Column(db.String(80))
    lastname = db.Column(db.String(80))
    email = db.Column(db.String(100), unique=True)
    location = db.Column(db.String(100))
    biography = db.Column(db.String(300))
    profile_photo = db.Column(db.String(3000))
    joined_on = db.Column(db.DateTime, default=datetime.datetime.utcnow)


class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer)
    post_id = db.Column(db.Integer)


class Follow(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer)
    follower_id = db.Column(db.Integer)


class TokenBlackList(db.Model):
    token = db.Column(db.Binary, primary_key=True)
