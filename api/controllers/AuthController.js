/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const passport = require('passport');
const jwt = require('jsonwebtoken');

module.exports = {

  login: function(req, res) {
    passport.authenticate('local', {session:false},(err, user, info) =>{
      if((err) || (!user)) {
        return res.send({
          message: info.message,
        });
      }
      req.logIn(user, (err) => {
        if(err) res.send(err);
      });
      req.token = jwt.sign(req.user, 'b4e9f19cbb789b2978b4f32440aca414', { expiresIn: 60 * 60 * 24});
      return res.status(200).json({
        user: req.user,
        token: 'Bearer ' + req.token,
      })
    })(req, res);
  },

  logout: function(req, res) {
    req.logout();
    return res.status(200).json('logged out')
  },

  async me(req,res) {
    let user = await User.search(req)
    if(user){
      return res.status(200).json({user})
    } else {
      return res.status(400).json('not logged in')
    }
  },
}
