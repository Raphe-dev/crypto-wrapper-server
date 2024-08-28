module.exports = {

  attributes: {
//Primitive
    status: {
      type: 'string',
      defaultsTo: 'ACTIVE'
    },
    buy_time: {
      type: 'string',
    },
    sell_time: {
      type: 'string',
    },
    pair: {
      type: 'string',
    },
    amount: {
      type: 'float',
    },
    buy_price: {
      type: 'float',
    },
    sell_price: {
      type: 'float',
    },
    result_btc: {
      type: 'float',
    },
    result_percent: {
      type: 'float',
    },
    stop_loss: {
      type: 'float'
    },
    sell_at: {
      type: 'float'
    },
    owner: {
      model: 'user'
    }
  },
//Methods
  customToJSON: function() {
     return _.omit(this, ['owner', 'createdAt', 'updatedAt'])
  },

  async checkPositions() {
    const Binance = require('binance-api-node').default
    //CHECK FOR POSITIONS SELL PRICE
      setInterval(async () => {
        let positions = await Position.find({status: 'ACTIVE'}).populate('owner')
        for(c = 0; c < positions.length; c++){
          let i = positions[c]
          let tmpClient = Binance({
            apiKey: i.owner.binance_key,
            apiSecret: i.owner.binance_secret,
          })
          if(binancePrices[i.pair] >= (i.buy_price * (1 + (i.sell_at / 100)))){

            await Position.update({
              id: i.id
            }).set({
              status : 'SELLING'
            })

            console.log('New order for position : ' + i.pair)
          //SELL POSITION

            await tmpClient.order({
              symbol: i.pair,
              side: 'SELL',
              quantity: i.amount,
              price: binancePrices[i.pair],
              recvWindow: 10000000
            }).then(async response => {
              await Position.update({id: i.id}).set({
                status : 'SELLING'
              })
              let checkup = setInterval(async () => {
                  await tmpClient.getOrder({
                    symbol: response.symbol,
                    orderId: response.orderId,
                  }).then( async response => {
                    if(response.status === 'FILLED'){
                      await Position.update({
                        id: i.id
                      }).set({
                        sell_price: response.price,
                        result_btc: ((response.price * response.executedQty) - (i.buy_price * i.amount)).toFixed(8),
                        status: 'SOLD'
                      })
                      console.log( 'position SOLD '  + i.pair + ' at price: ' + response.price + ' profits: ' + ((response.price * response.executedQty) - (i.buy_price * i.amount)).toFixed(8) )

                      clearInterval(checkup);
                    } else if(response.status === 'PARTIALLY_FILLED'){
                    } else if(response.status === 'NEW'){
                    } else if(response.status === 'CANCELED'){
                      clearInterval(checkup);
                    }
                  })
                }, 1000 * 10)
              }).catch(err => {
                console.log(err)
              })
          } else if(binancePrices[i.pair] <= (i.buy_price * (1 + (-i.stop_loss / 100)))) {
            await Position.update({
              id: i.id
            }).set({
              status : 'SELLING'
            })
            //SELL POSITION
              await tmpClient.order({
                symbol: i.pair,
                side: 'SELL',
                quantity: i.amount,
                price: binancePrices[i.pair],
                recvWindow: 10000000
              }).then(response => {
                console.log('Stop loss for position : ' + i.pair)

                let checkup = setInterval(async () => {
                    await tmpClient.getOrder({
                      symbol: response.symbol,
                      orderId: response.orderId,
                    }).then( async response => {
                      if(response.status === 'FILLED'){
                        await Position.update({
                          id: i.id
                        }).set({
                          sell_price: response.price,
                          result_btc: ((response.price * response.executedQty) - (i.buy_price * i.amount)).toFixed(8),
                          status: 'STOP'
                        })
                        clearInterval(checkup);
                      } else if(response.status === 'PARTIALLY_FILLED'){
                      } else if(response.status === 'NEW'){
                      } else if(response.status === 'CANCELED'){
                        clearInterval(checkup);
                      }
                    })
                  }, 1000 * 10)
                }).catch(err => {
                  console.log(err)
                })
          } else {
          }
        }
      }, 10000)
  }
}
