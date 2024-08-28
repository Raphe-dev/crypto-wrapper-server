/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const Binance = require('binance-api-node').default

module.exports = {

  async favorites(req,res) {
    let user = await User.update({
      uuid: req.headers.uuid
    }).set({
      favorites: req.body
    }).fetch()

    return res.status(200).json({user})
  },

  async userAssets(req, res){
    let user = await User.search(req)
    let client = Binance({
      apiKey: user.binance_key,
      apiSecret: user.binance_secret,
    })
    client.accountInfo().then(response => {
      let results = []
      for(let currency of response.balances){
        if(currency.free > 0  || currency.locked > 0){
          results.push(currency)
        }
      }
      return res.status(200).json(results)
    })
  },

  async userOrders(req, res){
    let user = await User.search(req)
    let client = Binance({
      apiKey: user.binance_key,
      apiSecret: user.binance_secret,
    })
    let orders = []
    await client.openOrders({recvWindow:1000000}).then(txs => {
      for(let tx in txs){
        let i = txs[tx]
        if(i.status == 'CANCELED'){}
        if(i.status == 'FILLED'){}
        if(i.status == 'NEW'){
          orders.push(i)
        }
      }
    })

      return res.status(200).json(orders)
  },

  async binanceKeys(req, res){
    let user = await User.update({
      uuid: req.headers.uuid
    }).set({
      binance_key: req.body.binance_key,
      binance_secret: req.body.binance_secret
    }).fetch()

    return res.status(200).json({user})
  },

  async userSettings(req, res){
    let user = await User.search(req)
    let settings = await UserSettings.update({
      id: user.settings.id
    }).set({
      MH_api_key : req.body.MH.api_key,
      MH_buy : req.body.MH.buy,
      MH_buy_amount : req.body.MH.buy_amount,
      MH_sell_at : req.body.MH.sell_at,
      MH_stop_at : req.body.MH.stop_at,

      CG_buy : req.body.CG.buy,
      CG_buy_amount : req.body.CG.buy_amount,
      CG_sell_at : req.body.CG.sell_at,
      CG_stop_at : req.body.CG.stop_at,

      CQ_buy : req.body.CQ.buy,
      CQ_buy_amount : req.body.CQ.buy_amount,
      CQ_sell_at : req.body.CQ.sell_at,
      CQ_stop_at : req.body.CQ.stop_at,
    }).fetch()

    settings = settings[0]

    return res.status(200).json({settings})
  }
}
