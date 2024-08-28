module.exports = {

  attributes: {
        buy_total_amount: {
          type: 'number',
          allowNull: true
        },
        MH_api_key: {
          type: 'string',
          allowNull:true
        },
        MH_buy: {
          type: 'boolean',
          defaultsTo: false
        },
        MH_buy_amount: {
          type: 'number',
          defaultsTo: 0
        },
        MH_sell_at: {
          type: 'number',
          defaultsTo: 0
        },
        MH_stop_at: {
          type: 'number',
          defaultsTo: 0
        },

        CG_buy: {
          type: 'boolean',
          defaultsTo: false
        },
        CG_buy_amount: {
          type: 'number',
          defaultsTo: 0
        },
        CG_sell_at: {
          type: 'number',
          defaultsTo: 0
        },
        CG_stop_at: {
          type: 'number',
          defaultsTo: 0
        },

        CQ_buy: {
          type: 'boolean',
          defaultsTo: false
        },
        CQ_buy_amount: {
          type: 'number',
          defaultsTo: 0
        },
        CQ_sell_at: {
          type: 'number',
          defaultsTo: 0
        },
        CQ_stop_at: {
          type: 'number',
          defaultsTo: 0
        },

        owner:{
          model:'user',
        },
      },

    customToJSON: function() {
       return _.omit(this, ['owner', 'id', 'createdAt', 'updatedAt'])
    },

};
