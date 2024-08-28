/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */


module.exports.routes = {

  //  ╔═╗╔═╗╦  ╔═╗╔╗╔╔╦╗╔═╗╔═╗╦╔╗╔╔╦╗╔═╗
  //  ╠═╣╠═╝║  ║╣ ║║║ ║║╠═╝║ ║║║║║ ║ ╚═╗
  //  ╩ ╩╩  ╩  ╚═╝╝╚╝═╩╝╩  ╚═╝╩╝╚╝ ╩ ╚═╝

'POST /login': { controller:'AuthController', action:'login'},
'POST /logout':  { controller:'AuthController', action:'logout'},
'GET /me':  { controller:'AuthController', action:'me'},

'POST /users/binanceKeys' : { controller:'UserController', action:'binanceKeys'},
'POST /users/favorites':  { controller:'UserController', action:'favorites'},
'GET /users/assets':  { controller:'UserController', action:'userAssets'},
'GET /users/orders':  { controller:'UserController', action:'userOrders'},
'PATCH /users/settings' : { controller:'UserController', action:'userSettings'},

'POST /binance/order' : { controller:'OrderController', action:'postOrder'},
'POST /binance/cancelorder' : { controller:'OrderController', action:'cancelOrder'},

'POST /positions' : { controller:'PositionController', action:'create'},
'POST /positions/sell' : { controller:'PositionController', action:'sell'},



  //  ╦ ╦╔═╗╔╗ ╦ ╦╔═╗╔═╗╦╔═╔═╗
  //  ║║║║╣ ╠╩╗╠═╣║ ║║ ║╠╩╗╚═╗
  //  ╚╩╝╚═╝╚═╝╩ ╩╚═╝╚═╝╩ ╩╚═╝


  //  ╔╦╗╦╔═╗╔═╗
  //  ║║║║╚═╗║
  //  ╩ ╩╩╚═╝╚═╝


};
