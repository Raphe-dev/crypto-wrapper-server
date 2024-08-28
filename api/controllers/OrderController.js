/**
 * OrderController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
 const Binance = require('binance-api-node').default

module.exports = {

  async postOrder(req, res){
    let user = await User.search(req)
    let client = Binance({
      apiKey: user.binance_key,
      apiSecret: user.binance_secret,
    })
    await client.order({
      symbol: req.body.pair,
      side: req.body.side,
      quantity: req.body.qty,
      price: req.body.price,
    }).then(response => {
      console.log('new order for ' + req.body.pair + ' at price ' + req.body.price)
      let checkup = setInterval(async () => {
          await client.getOrder({
            symbol: response.symbol,
            orderId: response.orderId,
          }).then( async response => {
            if(response.status === 'FILLED'){
              let newPosition = await User.createPosition(user, {
                pair: response.symbol,
                amount: response.executedQty,
                buy_price: response.price,
                sell_at : 2,
                stop_loss: 2,
                status:"ACTIVE"
              })
              console.log('new position for ' + response.symbol)

              clearInterval(checkup);
            } else if(response.status === 'PARTIALLY_FILLED'){
              console.log('ALMOST FILLED!!!')
            } else if(response.status === 'NEW'){
              console.log('keep going interval.')
            } else if(response.status === 'CANCELED'){
              clearInterval(checkup);
            }
          })
        }, 1000 * 10)
      return res.ok({response})
    }).catch(error => {
      if(error.code === -1013){
        return res.badRequest('Total amount must be higher than 0.0001 BTC');
      } else if(error.code === -2010) {
        return res.badRequest('Not enough currency');
      } else {
        return res.badRequest({error})
      }
    })
  },

  async cancelOrder(req, res){
    let user = await User.search(req)
    let client = Binance({
      apiKey: user.binance_key,
      apiSecret: user.binance_secret,
    })

    await client.cancelOrder({
      symbol: req.body.symbol,
      orderId: req.body.orderId,
      }).then(response => {
        console.log(response)
        return res.ok()
    })
  }

};
