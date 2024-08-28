

module.exports.bootstrap = function(done) {

  Number.prototype.toFixedSpecial = function(n) {
    var str = this.toFixed(n)
    if (str.indexOf('e+') < 0)
        return str

    // if number is in scientific notation, pick (b)ase and (p)ower
    return str.replace('.', '').split('e+').reduce(function(p, b) {
        return p + Array(b - p.length + 2).join(0)
    }) + '.' + Array(n + 1).join(0)
}

  Binance.prices()

  Signal.miningHamster()
  Signal.cryptoGrower()
  Signal.qualitySignals()

  Position.checkPositions()

  return done();
}
