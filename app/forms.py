from flask_wtf import FlaskForm
from flask_uploads import UploadSet, IMAGES, configure_uploads
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms import StringField, TextAreaField
from wtforms.validators import DataRequired
from app import app

images = UploadSet('images', IMAGES)
configure_uploads(app, images)


class RegisterForm(FlaskForm):
    username = StringField('username', validators=[DataRequired()])
    password = StringField('password', validators=[DataRequired()])
    firstname = StringField('firstname', validators=[DataRequired()])
    lastname = StringField('lastname', validators=[DataRequired()])
    email = StringField('email', validators=[DataRequired()])
    location = StringField('location', validators=[DataRequired()])
    biography = TextAreaField('biography', validators=[DataRequired()])
    photo = FileField('photo', validators=[FileRequired(), FileAllowed(images, 'Images only!')])


class PostForm(FlaskForm):
    photo = FileField('photo', validators=[FileRequired(), FileAllowed(images, 'Images only!')])
    caption = StringField('caption', validators=[DataRequired()])

