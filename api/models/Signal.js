module.exports = {

  attributes: {
    source: {
      type: 'string',
    },
    timestamp: {
      type: 'string',
    },
    pair: {
      type: 'string',
    },
    price: {
      type: 'string',
    },
    exchange: {
      type: 'string'
    },
    uuid: {
      type: 'string'
    }
  },
  customToJSON: function () {
    return _.omit(this, ['id', 'createdAt', 'updatedAt'])
  },

  async cryptoGrower() {
    const Axios = require('axios')
    const Binance = require('binance-api-node').default

    let axios = await Axios.create({})
    axios.defaults.headers.common['Authorization'] = 'Basic UjhpQ3BXbEp5SG5Ddnk2OUFicjI4dFpzczpSME1kRU5UR1V6VTV0T3JqZDZ3eDZXZU1nY3ZQREI2Sm1BdTRmZVNpV2o2VE02WUtDZA==';
    axios.post('https://api.twitter.com/oauth2/token', 'grant_type=client_credentials').then(async response => {
      axios.defaults.headers.common['Authorization'] = response.data.token_type + ' ' + response.data.access_token
      setInterval(() => {
        axios.get('https://api.twitter.com/1.1/statuses/user_timeline.json?user_id=933688445926559744&count=10').then(async response => {
          for (let i in response.data) {
            let signal = {}
            if (response.data[i].text.search('Binance') != -1) {
              if (await Signal.findOne({uuid: response.data[i].id})) {
              } else {
                signal.exchange = 'Binance'
                signal.source = 'CryptoGrower'
                signal.date = response.data[i].created_at.substring(0, response.data[i].created_at.length - 11)
                signal.pair = response.data[i].entities.symbols[0].text + 'BTC'
                signal.price = response.data[i].text.split("value:").pop();
                signal.uuid = response.data[i].id
                let newSignal = await Signal.create({...signal})
                //NEW SIGNAL
                console.log('new signal from ' + signal.source + ' pair: ' + signal.pair + ' price: ' + signal.price)
                sails.sockets.blast('newSignal')
                Signal.order(signal)
              }
            }
          }
        }).catch(err => {
          console.log('an error occured while gathering data from CryptoGrower')
        })
      }, 25000)
    })
  },

  async miningHamster() {
    const Axios = require('axios')
    let axios = await Axios.create({})
    const Binance = require('binance-api-node').default
    setInterval(() => {
      axios.get('https://www.mininghamster.com/api/v2/Hwd6APjn0ifrw2uI2QCdN7yHhBau0X0I').then(async response => {
        response.data.forEach(async i => {
          let signal = {}
          let uuid = i.market + i.lastprice;

          if (await Signal.findOne({uuid})) {
          } else if (i.exchange == 'binance' && i.market.includes('BTC')) {
            signal.exchange = 'Binance'
            signal.source = 'MiningHamster'
            signal.date = i.date
            signal.pair = i.market.replace('-', '')
            signal.price = i.lastprice
            signal.uuid = uuid
            let newSignal = await Signal.create({...signal})

            //NEW SIGNAL
            console.log('new signal from ' + signal.source + ' pair: ' + signal.pair + ' price: ' + signal.price)
            sails.sockets.blast('newSignal')
            Signal.order(signal)
          }
        })
      }).catch(err => {
        console.log('an error occured while gathering data from MiningHamster')
      })
    }, 15000)
  },

  async qualitySignals() {
    const Axios = require('axios')
    let axios = Axios.create({})

    let interval = setInterval(async () => {
      axios.get('https://cryptoqualitysignals.com/api/getSignal/?api_key=FREE&exchange=BINANCE').then(async response => {
        response.data.signals.forEach(async i => {
          console.log(i)
          if (await Signal.find({uuid: i.id})) {
          }
          if (i.currency && i.currency === 'BTC' && i.type.includes('SHORT')) {
            let signal = {}
            signal.exchange = 'Binance'
            signal.source = 'QualitySignals'
            signal.date = i.timestamp
            signal.pair = i.coin + 'BTC'
            signal.price = i.ask
            signal.uuid = i.id
            let newSignal = await Signal.create({...signal})

            console.log('new signal from ' + signal.source + ' pair: ' + signal.pair + ' price: ' + signal.price)
            sails.sockets.blast('newSignal')
            Signal.order(signal)
          }
        })
      }).catch(err => {
        console.log('an error occured while gathering data from Crypto Quality')
      })
    }, 61000 * 5)
  },

  async order(signal) {
    const Binance = require('binance-api-node').default
    let users = await User.find().populate('settings')
    let client = {}
    users.forEach(async user => {

      let settings = user.settings[0]
      let buy = false
      let amount = 0.005
      let sell_at = 1
      let stop_at = 1

      switch (signal.source) {
        case 'MiningHamster' :
          buy = settings.MH_buy
          amount = settings.MH_buy_amount
          sell_at = settings.MH_sell_at
          stop_at = settings.MH_stop_at
          break;
        case 'CryptoGrower' :
          buy = settings.CG_buy
          amount = settings.CG_buy_amount
          sell_at = settings.CG_sell_at
          stop_at = settings.CG_stop_at
          break;
        case 'QualitySignals' :
          buy = settings.CQ_buy
          amount = settings.CQ_buy_amount
          sell_at = settings.CQ_sell_at
          stop_at = settings.CQ_stop_at
          break;
      }

      if (buy && user.binance_key && user.binance_secret) {
        client = Binance({
          apiKey: user.binance_key,
          apiSecret: user.binance_secret,
        })
        //ORDER
        let coinQty = parseFloat(amount / binancePrices[signal.pair])
        if (coinQty > 1) {
          coinQty = coinQty.toFixed(0)
        } else if (coinQty < 1 && coinQty > 0.1) {
          coinQty = coinQty.toFixed(1)
        } else if (coinQty < 0.1 && coinQty > 0.01) {
          coinQty = coinQty.toFixed(2)
        } else if (coinQty < 0.01 && coinQty > 0.001) {
          coinQty = coinQty.toFixed(3)
        } else if (coinQty < 0.001 && coinQty > 0.0001) {
          coinQty = coinQty.toFixed(4)
        } else {
          coinQty = coinQty.toFixedSpecial(8)
        }
        let options = {
          symbol: signal.pair,
          side: 'BUY',
          quantity: coinQty,
          price: parseFloat(signal.price).toFixedSpecial(8)
        }

        await client.order({
          ...options,
          recvWindow: 10000000
        }).then(async response => {
          console.log('new order BUY ' + signal.pair + ' at price: ' + signal.price + ' amount: ' + amount)
          let checkup = setInterval(async foo => {
            await client.getOrder({
              symbol: response.symbol,
              orderId: response.orderId,
              recvWindow: 10000000
            }).then(async response => {
              if (response.status === 'FILLED') {
                //SIGNAL BOUGHT
                let newPosition = await User.createPosition(user, {
                  pair: response.symbol,
                  amount: response.executedQty,
                  buy_price: response.price,
                  stop_loss: stop_at,
                  sell_at
                })
                console.log('new Position ' + response.symbol + ' Buy price: ' + response.price + ' amount: ' + response.executedQty)
                clearInterval(checkup);
              } else if (response.status === 'PARTIALLY_FILLED') {

              } else if (response.status === 'NEW') {

              } else if (response.status === 'CANCELED') {
                clearInterval(checkup);
              }
            })
          }, 1000 * 10)
        }).catch(err => {
          console.log('an error occured while trying to make an order to binance')
          console.log('price: ' + signal.price + ' amount: ' + coinQty + ' symbol: ' + signal.pair)
          console.log('error code : ' + err.code)
        })
      }
    })
  }
}
