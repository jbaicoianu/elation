elation.extend('user', new function() {
  this.usertype = false;
  this.userid = false;

  this.init = function(user) {
    for (var k in user) {
      this[k] = user[k];
    }
    elation.events.fire({type: 'user_init', element: this});
  }
  this.login = function(usertype, userid, credentials) {
      var authdata = {
        usertype: usertype,
        userid: userid,
        credentials: credentials
      };
/*
      if (this.formtype == 'signup') {
        authdata.create = true;
      }
*/
      elation.net.post('/user/auth.js', authdata, {
        callback: elation.bind(this, this.handleauth),
        parse: 'json'
      });
  }
  this.handleauth = function(response) {
    if (response.data.success) {
      elation.events.fire({type: 'user_login', element: this, data: this});
    }
  }
  this.logout = function(next) {
    elation.events.fire({type: 'user_prelogout', element: this});
    elation.net.get('/user/logout.js', null, {
      callback: elation.bind(this, function() { 
        elation.events.fire({type: 'user_logout', element: this});
        if (next) document.location = next; 
      }),
      nocache: true
    });
  }
});
