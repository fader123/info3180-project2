let dataCache = {};

dataCache.token = sessionStorage.getItem('token');
dataCache.id = sessionStorage.getItem('user_id');

if (!dataCache.id && !dataCache.token){
  delete dataCache.id;
  delete dataCache.token;
}


let msg = '';
let dat = {
  msg_err: ''
}

const home = Vue.component('home', {
  data: function(){
    return dat;
  },
  template: `
  <div>
    <div class="alert alert-success" v-if="msg !== ''">
              {{ msg }}
            </div>
            <div class="alert alert-danger" v-if="msg_err !== ''">
              {{ msg_err }}
            </div>
    <img src="https://pre00.deviantart.net/0d6f/th/pre/f/2012/120/a/6/water_under_the_bridge_by_denehy-d4y4t00.jpg" id="home-img">
    <div id="optionForm">
      <h3 class="text-center"><i class="material-icons">photo_camera</i> Photogram</h3><hr>
      <p>Share photos of your favourite moments with friends, family and the world</p>
      <div class="text-center">
        <router-link to="/register"><button class="btn btn-inline btn-success">Register</button></router-link>
        <router-link to="/login"><button class="btn btn-inline btn-primary"> Login</button></router-link>
      </div>
    
    </div>
  </div>
  
  `,
});

const register = Vue.component('register', {
  data: function() {
    return {
      err: "",
      successful: "",
    }
  },
  methods: {
    registerAction: function(e) {
      msg = '';
      self = this;
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "api/users/register",
        "method": "POST",
        "headers": {},
        "processData": false,
        "contentType": false,
        "mimeType": "multipart/form-data",
        "data": new FormData($("#regContent")[0]),
        "error": function(resp) {
          data = JSON.parse(resp.responseText);
          if (data.error) {
            self.err = data.error;
            self.successful = "";

          }
        }
      }

      $.ajax(settings).done(function(data) {
        data = JSON.parse(data);
        self.successful = 'registration successfully completed';
        self.err = "";
        setTimeout(function() {
          self.$router.push('login');
        }, 2000);
      });


    }
  },
  template: `
    <div>
      <div id="registerForm">
        <h2 style="margin-left:1em;">Register</h2>
        <form id="regContent" v-on:submit.prevent="registerAction" method="post" enctype="multipart/form-data">
            <div class="alert alert-danger" v-if="err !== ''">
              {{ err }}
            </div>
            <div class="alert alert-success" v-if="successful !== ''">
              {{ successful }}
            </div>
            <div class="form-group">
              <label>Username</label>
              <input type="text" class="form-control" name="username">
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" class="form-control" name="password">
            </div>
            <div class="form-group">
              <label>Firstname</label>
              <input type="text" class="form-control" name="firstname">
            </div>
            <div class="form-group">
              <label>Lastname</label>
              <input type="text" class="form-control" name="lastname">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" class="form-control" name="email">
            </div>
            <div class="form-group">
              <label>Location</label>
              <input type="text" class="form-control" name="location">
            </div>
            <div class="form-group">
              <label>Biography</label>
              <input type="text" class="form-control" name="biography">
            </div>
            <div class="form-group">
              <label>Photo</label>
              <input type="file" class="form-control-file" name="photo">
            </div>
            <button class="btn btn-inline btn-success btn-block">Register</button>
        </form>
        
      </div>
    
    </div>
  
  
  `
});

const login = Vue.component('login', {
  data: function() {
    return {
      err: "",
      successful: "",
    }
  },
  methods: {
    loginAction: function(e) {
      msg = '';
      self = this;
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "api/auth/login",
        "method": "POST",
        "headers": {},
        "processData": false,
        contentType: "application/json; charset=utf-8",
        "data": JSON.stringify(objectifyForm($("#loginContent").serializeArray())),
        "error": function(resp) {
          data = JSON.parse(resp.responseText);
          if (data.error) {
            self.err = data.error;
            self.successful = "";

          }
        }
      }

      $.ajax(settings).done(function(data) {
        self.successful = 'login successful. redirecting....';
        self.err = "";
        setTimeout(function() {
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('user_id', data.user_id);
          dataCache.id = data.user_id;
          dataCache.token = data.token;
          self.$router.push('/explore');
        }, 2000);
      });


    }
  },
  template: `
  <div>
      <div id="loginForm">
        <h2 style="margin-left:1em;">Login</h2>
        <form id="loginContent" v-on:submit.prevent="loginAction">
            <div class="alert alert-danger" v-if="err !== ''">
              {{ err }}
            </div>
            <div class="alert alert-success" v-if="successful !== ''">
              {{ successful }}
            </div>
            <div class="form-group">
              <label>Username</label>
              <input type="text" class="form-control" name="username">
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" class="form-control" name="password">
            </div>
            <button class="btn btn-inline btn-success btn-block">Login</button>
        </form>
        
      </div>
    
    </div>
  
  
  `
});


const profile = Vue.component('dashboard', {
  data: function() {
    self = this;
    var settings = {
      "async": false,
      "crossDomain": true,
      "url": "api/users/" + this.$route.params.user_id + "/posts",
      "method": "GET",
      "headers": { 'Authorization': 'Bearer ' + dataCache.token },
      "processData": false,
      "error": function(resp) {
        data = resp.responseText;
        if (data.error) {
          console.log(data);

        }
      }
    }
    let dataBlob = null;
    $.ajax(settings).done(function(data) {
      dataBlob = data;

    });

    return {
      user_info: dataBlob,
    }
  },
  methods: {
    follow: function() {
      self = this;
      var settings = {
        "async": false,
        "crossDomain": true,
        "url": "/api/users/" + this.$route.params.user_id + "/follow",
        "method": "POST",
        "headers": { 'Authorization': 'Bearer ' + dataCache.token },
        "processData": false,
        "error": function(resp) {
          data = resp.responseText;
          if (data.error) {
            console.log(data);

          }
        }
      }
      let dataBlob = null;
      $.ajax(settings).done(function(data) {
        self.user_info.following = true;

      });
    }
  },
  template: `
  <div>
    <div id="profile-details">
      <div id="profile-img" class="float-left">
        <img v-bind:src="user_info.usr_photo">
      </div>
      <div id="profile-info">
        <h5>{{user_info.user}}</h5>
        <p>{{user_info.addr}}</p>
        <p>Member since {{user_info.joined}}</p>
        <p id="profile-bio">{{user_info.bio}}</p>
      </div>
      <div id="profile-additional" class="float-right">
        <div>
          <div class="profile-snip float-left">
            <h3>{{user_info.total_post}}</h3>
            <p>Posts</p>
          </div>
          <div class="profile-snip float-right">
            <h3>{{user_info.followers}}</h3>
            <p>Followers</p>
          </div>
        </div>
        <button class="btn btn-block btn-success" @click="follow" v-if="user_info.following">Following</button>
        <button class="btn btn-block btn-primary" @click="follow" v-else>Follow</button>
      </div>
    </div>
    
    <div id="profile-uploads">
      <img v-for="post in user_info.posts" v-bind:src="post.photo">
    </div>
  
  </div>
  
  
  `
});

const explore = Vue.component('explore', {
  data: function() {
    self = this;
    var settings = {
      "async": false,
      "crossDomain": true,
      "url": "api/posts",
      "method": "GET",
      "headers": { 'Authorization': 'Bearer ' + dataCache.token },
      "processData": false,
      "error": function(resp) {
        data = resp.responseText;
        if (data.error) {
          console.log(data);

        }
      }
    }
    let dataBlob = null;
    $.ajax(settings).done(function(data) {
      dataBlob = data.posts;
      console.log(dataBlob);

    });
    return {
      info: dataBlob,
      notLiked: true,
    }
  },
  methods: {
    registerLike: function(post_id) {
      let self = this;
      var settings = {
        "async": false,
        "crossDomain": true,
        "url": "api/posts/" + post_id + '/like',
        "method": "POST",
        "headers": { 'Authorization': 'Bearer ' + dataCache.token },
        "processData": false,
        "error": function(resp) {
          data = resp.responseText;
          if (data.error) {
            console.log(data);

          }
        }
      }
      $.ajax(settings).done(function(data) {
        let section = document.getElementById(post_id);
        section.getElementsByTagName("p")[0].innerHTML = " " + data.likes + " Likes";
        section.getElementsByTagName("i")[0].classList.add("text-danger");

      });
    }
  },
  template: `
    <div id="exp">
      <div id="explorerView">
        <div class="card" style="width: 40em;" v-for="post in info">
          <router-link v-bind:to="'/users/' + post.user_id"><h5 class="card-title"><i class="material"><img v-bind:src="post.details.img"></i> {{ post.details.user }}</h5></router-link>
          <img class="card-img-top" v-bind:src="post.details.photo" alt="">
          <div class="card-body">
            <p class="card-text">{{ post.details.caption }}</p>
            <div>
              <span @click="registerLike(post.post_id)" v-bind:id="post.post_id" v-if="post.details.liked"><i class="fa fa-heart text-danger"></i><p class="likes-info">{{post.details.likes}} Likes</p></span>
              <span @click="registerLike(post.post_id)" v-bind:id="post.post_id" v-else><i class="fa fa-heart"></i><p class="likes-info">{{post.details.likes}} Likes</p></span>
              <span class="float-right"><strong>{{ post.details.posted }}</strong></span>
            </div>
          </div>
        </div>
      </div>
      <router-link to="/new_post"><button class="btn btn-primary" id="mk_post">New Post</button></router-link>
    
    </div>
  
  `,
});

// Define a new component called button-counter
const newPost = Vue.component('newPost', {
  data: function() {
    return {
      err: "",
      successful: "",
    }
  },
  methods: {
    postAction: function(e) {
      msg = '';
      self = this;
      var settings = {
        "async": true,
        "crossDomain": true,
        "url": "api/users/" + dataCache.id + "/posts",
        "method": "POST",
        "headers": { 'Authorization': 'Bearer ' + dataCache.token },
        "processData": false,
        "contentType": false,
        "mimeType": "multipart/form-data",
        "data": new FormData($("#postContent")[0]),
        "error": function(resp) {
          data = JSON.parse(resp.responseText);
          if (data.error) {
            self.err = data.error;
            self.successful = "";

          }
        }
      }

      $.ajax(settings).done(function(data) {
        self.successful = 'post successfully uploaded...';
        self.err = "";
        setTimeout(function() {
          self.$router.push('/explore');
        }, 2000);
      });


    }
  },
  template: `
  <div>
      <div id="newPostForm">
        <h2 style="margin-left:1em;">New Post</h2>
        <form id="postContent" v-on:submit.prevent="postAction">
            <div class="alert alert-danger" v-if="err !== ''">
              {{ err }}
            </div>
            <div class="alert alert-success" v-if="successful !== ''">
              {{ successful }}
            </div>
            <div class="form-group">
              <label>Photo</label>
              <input type="file" class="form-control-file" name="photo">
            </div>
            <div class="form-group">
              <label>Caption</label>
              <textarea class="form-control" name="caption" rows="2" placeholder="Write a caption"></textarea>
            </div>
            <button class="btn btn-inline btn-success btn-block">Submit</button>
        </form>
        
      </div>
    
    </div>
  `
});


const routes = [
  { path: '/register', component: register },
  { path: '/', component: home },
  { path: '/login', component: login },
  // { path: '/logout', component: logout },
  { path: '/explore', component: explore },
  { path: '/new_post', component: newPost },
  { path: '/users/:user_id', component: profile, props: true },

];

const router = new VueRouter({
  routes // short for `routes: routes`
});

router.beforeEach((to, from, next) => {
  if (to.path == '/' || to.path == '/login' || to.path == '/register'){
    next();
  }
  
  else{
    if ((dataCache.id == null || dataCache.id == undefined) || (dataCache.token == null || dataCache.token == undefined)) {
        next('/');
        dat.msg_err = 'You are currently not logged in';
      }
      else{
        next();
      }
  }
});

let app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  },
  methods: {
    explo: function() {
      if (dataCache.token !== undefined && dataCache.token !== null) {
        this.$router.push('/explore');
      }
      else {
        this.$router.push('/');
        dat.msg_err = 'You are currently not logged in';
      }
    },
    view_pro: function() {
      if (dataCache.token !== undefined && dataCache.token !== null) {
        this.$router.push('/users/' + dataCache.id);
      }
      else {
        this.$router.push('/');
        dat.msg_err = 'You are currently not logged in';
      }
    },
    signout: function() {
      let self = this;
      msg = '';
      if (dataCache.token !== undefined && dataCache.token !== null) {
        var settings = {
          "async": true,
          "crossDomain": true,
          "url": "api/auth/logout",
          "method": "GET",
          "headers": { 'Authorization': 'Bearer ' + dataCache.token },
          "processData": false,
          "error": function(resp) {

            data = JSON.parse(resp.responseText);
            if (data.error) {
              self.err = data.error;
              dat.msg_err = 'You are currently not logged in';
              self.$router.push('/');
            }
          }
        }
        $.ajax(settings).done(function(data) {
          msg = 'successfully logged out';
          dat.msg_err = '';
          dataCache.token = null;
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user_id");

          self.$router.push('/');
        });


      }
    }
  },
  router
});



function objectifyForm(formArray) { //serialize data function

  var returnArray = {};
  for (var i = 0; i < formArray.length; i++) {
    returnArray[formArray[i]['name']] = formArray[i]['value'];
  }
  return returnArray;
}