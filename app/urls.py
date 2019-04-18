from app import app
from app.views import *

app.add_url_rule('/api/users/register', view_func=RegisterAPI.as_view('register'))
app.add_url_rule('/api/auth/login', view_func=LoginAPI.as_view('login'))
app.add_url_rule('/api/auth/logout', view_func=LogoutAPI.as_view('logout'))
app.add_url_rule('/api/posts/<int:post_id>/like', view_func=PostLikeAPI.as_view('like'))
app.add_url_rule('/api/users/<int:user_id>/follow', view_func=FollowAPI.as_view('follow'))
app.add_url_rule('/api/posts', view_func=PostAPI.as_view('all_post'))
app.add_url_rule('/api/users/<int:user_id>/posts', view_func=UserPostAPI.as_view('post'))
app.add_url_rule('/api/users/uploads/<filename>', view_func=ViewUploadAPI.as_view('uploads'))
app.add_url_rule('/', view_func=Index.as_view('index'))
