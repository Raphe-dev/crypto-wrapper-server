/**
 * Binance.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {},

  prices: function() {
    const Binance = require('binance-api-node').default
    const client = Binance({})

    binancePrices = {}
      client.prices().then(response => {
        Object.keys(response).forEach( i => {
          if(i.includes('BTC')){
            binancePrices[i] = response[i]
          }
        })
        client.ws.trades(Object.keys(binancePrices), trade => {
          binancePrices[trade.symbol] = trade.price
        })
        setInterval(() => {
          sails.sockets.blast('binancePrices', binancePrices);
        }, 2000)
      })

      return binancePrices
  }

};
