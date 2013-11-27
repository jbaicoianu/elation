elation.component.add('user.auth', function() {
  this.init = function() {
    console.log(this.container.userid, this.container.credentials);
/*
    var input_userid = (this.container.userid ? this.container.userid : elation.html.create());
    var input_credentials = (this.container.credentials ? this.container.credentials : elation.html.create());
    this.inputs = {
      'userid': elation.ui.input(null, input_userid, {}, { blur: elation.bind(this, this.checkavailable) }),
      'credentials': elation.ui.input(null, input_credentials, {})
    }
*/
    this.orientation = this.args.orientation || 'vertical';
    elation.html.addclass(this.container, 'user_auth');
    elation.html.addclass(this.container, 'orientation_' + this.orientation);
    if (this.container.userid && this.container.credentials) {
      // form inputs already exists, fetch them
    } else {
      // no pre-existing form elements found, create them
    }
    elation.events.add(this.container, 'submit', this);
  }
  this.setstate = function(state) {
    elation.html.addclass(this.container, 'state_' + state);
    setTimeout(elation.bind(this, function() {
      elation.html.removeclass(this.container, 'state_' + state);
    }), 200);
  }
  this.checkavailable = function(ev) {
    elation.ajax.Get('/user/exists.js?userid=' + this.inputs['userid'].value, null, {
      callback: elation.bind(this, this.updateauthtype)
    });
  }
  this.updateauthtype = function(evdata) {
    var response = JSON.parse(evdata);
    if (response.data) {
      console.log(response);
      if (response.data.success) {
        console.log('logging in');
      } else {
        console.log('creating');
      }
    }
  }
  this.submit = function(ev) {
    // TODO - real client-side validation would be nice to have
    if (this.container.userid.value != '' && this.container.credentials.value != '') {
      var authdata = {
        userid: this.container.userid.value,
        credentials: this.container.credentials.value
      };
      elation.net.post('/user/auth.js', authdata, {
        callback: elation.bind(this, this.handleauth),
        parse: 'json'
      });
    } else {
      this.setstate('error');
    }
    ev.preventDefault();
  }
  this.handleauth = function(response) {
    if (response.data.success) {
      this.setstate('success');
    } else {
      this.setstate('error');
    }
  }
});
