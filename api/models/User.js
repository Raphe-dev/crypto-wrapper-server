/**
 * User.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
 const bcrypt = require('bcrypt-nodejs');
 const uuidv1 = require('uuid/v1');

module.exports = {

  attributes: {
    email: {
    type: 'string',
    required: true,
    unique: true
    },
    password: {
      type: 'string',
      required: true
    },
    uuid: {
      type: 'string',
    },
    binance_key: {
      type: 'string'
    },
    binance_secret: {
      type: 'string'
    },
    favorites: {
      type: 'json',
    },
    settings: {
      collection: 'UserSettings',
      via: 'owner'
    },
    positions: {
      collection: 'Position',
      via: 'owner'
    },

  },

  async search(req){
    let userFound = await User.findOne({uuid: req.headers.uuid}).populate('positions').populate('settings')
    return userFound
  },

  async createPosition(user, data){
    let position = await Position.create({
      ...data,
      owner: user.id
    })
    return position
  },

  async initSettings(user){
    return await UserSettings.create({
      sell_at: 0.5,
      stop_loss_at: 2,
      owner: user
    }).fetch()
  },

  customToJSON: function() {
     return _.omit(this, ['password', 'id', 'binance_key', 'binance_secret', 'updatedAt', 'createdAt'])
  },

  beforeCreate: function(user, cb){
    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(user.password, salt, null, function(err, hash){
        if(err) return cb(err);
        user.password = hash;
        user.uuid = uuidv1()
        return cb()
      });
    });
  },

  afterCreate: function(user, cb){
    User.initSettings(user.id)
    return cb()
  }
};
