from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgres://bmzybqpmbavnjp:f7bc8f9a726f228661cefd2ed0f043215292634c3ca538ccfa424339dacc222b@ec2-50-17-246-114.compute-1.amazonaws.com:5432/d6qf635ao702ru'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOADED_IMAGES_DEST'] = 'app/static/uploads/'
app.config['SECRET_KEY'] = "this is a secret"
db = SQLAlchemy(app)

from app.models import *
from app.urls import *
