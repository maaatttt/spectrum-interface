var BigNumber = require('bignumber.js')

var tokens = {
  // Tokens
  // Ensure address is lowercase
  '0xd245207cfbf6eb6f34970db2a807ab1d178fde6c': {
    name: 'APX',
    symbol: 'APX',
    decimals: 8
  },
  '0xff3bf057adf3b0e015b6465331a6236e55688274': {
    name: 'BeerToken',
    symbol: 'BEER',
    decimals: 0
  },
  '0x79755ea6ccb143b0bd8e1b670efffd59ae874991': {
    name: 'BettingWin',
    symbol: 'BTW',
    decimals: 2
  },
  '0x08533d6a06ce365298b12ef92eb407cba8aa8273': {
    name: 'CryptopiaFeeShare',
    symbol: 'CEFS',
    decimals: 8
  },
  '0x94ad7e41c1d44022c4f47cb1ba019fd1a022c536': {
    name: 'Dotcoin',
    symbol: 'DOT',
    decimals: 8
  },
  '0xcf3222b7fda7a7563b9e1e6c966bead04ac23c36': {
    name: 'Escher',
    symbol: 'ESCH',
    decimals: 18
  },
  '0x500684ce0d4f04abedff3e54fcf8acc5e6cfc4bd': {
    name: 'GeoCoin',
    symbol: 'GEO',
    decimals: 8
  },
  '0x0826180a4c981d5095cb5c48bb2a098a44cf6f73': {
    name: '10grans',
    symbol: 'GRANS',
    decimals: 18
  },
  '0x4b4899a10f3e507db207b0ee2426029efa168a67': {
    name: 'Qwark',
    symbol: 'QWARK',
    decimals: 8
  },
  '0x5e1715bb79805bd672729760b3f7f34d6f485098': {
    name: 'PickleRicks',
    symbol: 'RICKS',
    decimals: 8
  }
}

function tokenSymbols (address) {
  if (tokens[address]) {
    return tokens[address].symbol
  } else {
    return 'UNKNOWN'
  }
}

function tokenDecimals (address) {
  if (tokens[address]) {
    return new BigNumber(10).pow(tokens[address].decimals)
  } else {
    return new BigNumber(1)
  }
}

function isHexPrefixed (str) {
  if (typeof str !== 'string') {
    return false
  }
  return str.slice(0, 2) === '0x'
}

function addHexPrefix (str) {
  if (typeof str !== 'string') {
    return str
  }
  return isHexPrefixed(str) ? str : '0x' + str
}

function toAddress (str) {
  if (typeof str !== 'string') {
    return str
  }
  return addHexPrefix(str.substr(24)).toLowerCase()
}

function toBigNumber (str) {
  if (typeof str !== 'string') {
    return str
  }
  return new BigNumber(addHexPrefix(str), 16)
}

module.exports = {
  processInputData: function (txn, inputData) {
    switch (inputData.methodId) {
      case '0xa9059cbb': // transfer
        return {
          isTokenTxn: true,
          from: txn.from,
          to: toAddress(inputData.params[0]),
          value: toBigNumber(inputData.params[1]).div(tokenDecimals(txn.to)).toString(),
          symbol: tokenSymbols(txn.to),
          contract: txn.to
        }
      case '0x23b872dd': // transferFrom
        return {
          isTokenTxn: true,
          from: toAddress(inputData.params[0]),
          to: toAddress(inputData.params[1]),
          value: toBigNumber(inputData.params[2]).div(tokenDecimals(txn.to)).toString(),
          symbol: tokenSymbols(txn.to),
          contract: txn.to
        }
      case '0x6ea056a9': // sweep
        return {
          isTokenTxn: true,
          from: txn.to,
          to: txn.from,
          value: toBigNumber(inputData.params[1]).div(tokenDecimals((toAddress(inputData.params[0])))).toString(),
          symbol: tokenSymbols(toAddress(inputData.params[0])),
          contract: toAddress(inputData.params[0])
        }
      case '0x40c10f19': // mint
        return {
          isTokenTxn: true,
          from: '0x0000000000000000000000000000000000000000',
          to: toAddress(inputData.params[0]),
          value: toBigNumber(inputData.params[1]).div(tokenDecimals(txn.to)).toString(),
          symbol: tokenSymbols(txn.to),
          contract: txn.to
        }
      default:
        return {
          isTokenTxn: false // not a token transaction
        }
    }
  },
  formatValue: function (val, contract) {
    if (tokens[contract]) {
      return new BigNumber(val).div(tokenDecimals(contract)).toString()
    } else {
      return val
    }
  },
  getName: function (contract) {
    if (tokens[contract]) {
      return tokens[contract].name
    } else {
      return contract
    }
  }
}
