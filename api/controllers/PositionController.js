const Binance = require('binance-api-node').default

const passport = require('passport');
const jwt = require('jsonwebtoken');

module.exports = {

  async create(req, res) {
    let user = await User.search(req)
    let position = await User.createPosition(user, req.body)
    let positions = await Position.find({owner: user.id}).populate('settings')

    return res.status(200).json(positions)
  },

  async sell(req, res) {
    let user = await User.search(req)
    let position = await Position.find({id: req.body.id })
    position = position[0]
    let client = Binance({
      apiKey: user.binance_key,
      apiSecret: user.binance_secret,
    })
    await client.order({
      symbol: position.pair,
      side: 'SELL',
      quantity: position.amount,
      price: binancePrices[position.pair],
    }).then(response => {
      let checkup = setInterval(async () => {
          await client.getOrder({
            symbol: response.symbol,
            orderId: response.orderId,
          }).then( async response => {
            if(response.status === 'FILLED'){
              console.log('Manual position sold : ' + position.pair)
              await Position.update({
                id: req.body.positionId
              }).set({
                sell_price: response.price,
                result_btc: ((response.price * response.executedQty) - (position.buy_price * position.amount)).toFixed(8),
                status: 'SOLD'
              })
              clearInterval(checkup);
            } else if(response.status === 'PARTIALLY_FILLED'){
            } else if(response.status === 'NEW'){
            } else if(response.status === 'CANCELED'){
              clearInterval(checkup);
            }
          })
        }, 1000 * 10)
      return res.ok({response})
    })

  }
}
