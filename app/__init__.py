from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgres://eakcswhxwjievn:4e62a4f246b4e0c6f262c36c17e30547d1e2032ed45b6dec2102d726021b85dd@ec2-54-204-39-46.compute-1.amazonaws.com:5432/d2v2r6lg61uncb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOADED_IMAGES_DEST'] = 'app/static/uploads/'
app.config['SECRET_KEY'] = "this is a secret"
db = SQLAlchemy(app)

from app.models import *
from app.urls import *
