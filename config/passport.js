const passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      bcrypt = require('bcrypt-nodejs');

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb){
  User.findOne({id}, function(err, user) {
    cb(err, user);
  });
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  passportField: 'password',
  session: false
}, function(username, password, cb){

User.findOne({email: username}, function(err, user){
    if(err) return cb(err);
    if(!user) return cb(null, false, {message: 'Username not found'});

bcrypt.compare(password, user.password, function(err, res){
    if(!res) return cb(null, false, { message: 'Invalid Password' });

  let userDetails = {
          email: user.email,
          id: user.uuid
        };

return cb(null, userDetails, { message: 'Login Succesful'});
    });
  });
}));
