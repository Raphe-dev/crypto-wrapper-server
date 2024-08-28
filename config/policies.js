/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */
const jwt = require('express-jwt');
const authenticate = jwt({secret: 'b4e9f19cbb789b2978b4f32440aca414'});


module.exports.policies = {

  AuthController: {
    'login': true,
    'logout': 'isLogged',
    // 'me': 'isLogged',
    // 'positions': 'isLogged',
    // 'user/favorites' : 'isLogged'
  }

};
