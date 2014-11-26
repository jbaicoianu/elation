elation.component.add('user.auth', function() {
  this.init = function() {
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
    if (this.container instanceof HTMLFormElement) {
      this.form = this.container;
    } else {
      this.form = elation.html.create({tag: 'form', append: this.container});
      this.form.method = 'post';
      this.form.action = '/user/auth.js';
    }
    if (this.form.userid && this.form.credentials) {
      // form inputs already exists, fetch them
      this.inputs = {
        'userid': this.form.userid,
        'credentials': this.form.credentials,
        'credentials2': this.form.credentials2,
      }
      elation.events.add(this.inputs.userid, 'blur', elation.bind(this, this.checkavailable));
    } else {
      // no pre-existing form elements found, create them
      // TODO
      this.inputs = {
        'userid': elation.ui.input(null, elation.html.create({append: this.form}), {inputname: "userid", placeholder:"Username", autofocus: true}, { blur: elation.bind(this, this.checkavailable) }),
        'credentials': elation.ui.input(null, elation.html.create({append: this.form}), {inputname: "credentials", placeholder: "Password", type: "password"}),
        'credentials2': elation.ui.input(null, elation.html.create({append: this.form}), {inputname: "credentials2", placeholder: "Confirm password", type: "password", disabled: true}),
        'submit': elation.ui.button(null, elation.html.create({tag: 'button', append: this.form}), {label: 'Authenticate'})
      }
    }
    elation.events.add(this.form, 'submit', this);
  }
  this.setstate = function(state) {
    elation.html.addclass(this.container, 'state_' + state);
    setTimeout(elation.bind(this, function() {
      elation.html.removeclass(this.container, 'state_' + state);
    }), 200);
  }
  this.setformtype = function(formtype) {
    if (this.formtype) {
      elation.html.removeclass(this.container, 'user_auth_formtype_' + this.formtype);
    }
    this.formtype = formtype;
    elation.html.addclass(this.container, 'user_auth_formtype_' + this.formtype);
    switch (this.formtype) {
      case 'signup':
        this.inputs['credentials2'].disabled = false;
        break;
      case 'login':
      default:
        this.inputs['credentials2'].disabled = true;
        break;
    }
console.log(this.inputs['credentials2'].disabled);
  }
  this.checkavailable = function(ev) {
    if (this.inputs.userid.value == '') {
      // if userid is empty, reset to default state
      this.setformtype('default');
    } else {
      elation.ajax.Get('/user/exists.js?userid=' + this.inputs['userid'].value, null, {
        callback: elation.bind(this, this.updateauthtype)
      });
    }
  }
  this.updateauthtype = function(evdata) {
    var response = JSON.parse(evdata);
    if (response.data) {
      console.log(response);
      if (response.data.success) {
        console.log('logging in');
        this.setformtype("login");
      } else {
        console.log('creating');
        this.setformtype("signup");
      }
    }
  }
  this.submit = function(ev) {
    // TODO - real client-side validation would be nice to have
    if (this.inputs.userid.value == '' && this.inputs.credentials.value == '') {
      // if BOTH are empty, reset form to default state
      this.setformtype('default');
    } else if (this.inputs.userid.value == '') {
      this.inputs.userid.focus();
      this.setstate('error');
    } else if (this.inputs.credentials.value == '') {
      this.inputs.credentials.focus();
      this.setstate('error');
    } else if (this.formtype == 'signup' && this.inputs.credentials2.value != this.inputs.credentials.value) {
      this.inputs.credentials2.focus();
      this.setstate('error');
    } else {
      elation.user.login('default', this.inputs.userid.value, this.inputs.credentials.value);
    }
    ev.preventDefault();
  }
/*
  this.handleauth = function(response) {
    if (response.data.success) {
      this.setstate('success');
    } else {
      this.setstate('error');
    }
  }
*/
});
