// Utils.
const utils = require('./utils')

// Caelum Lib.
const Caelum = require('../src/index')
const Blockchain = require('../src/utils/substrate')
const Crypto = Caelum.loadCrypto()

// Constants
const GOVERNANCE = 'wss://substrate.tabit.caelumapp.com'
const STORAGE = 'https://api.bigchaindb.caelumapp.com/api/v1/'
let pool

// Main function.
const load = async (query) => {
  return new Promise((resolve) => {

  const caelum = new Caelum(STORAGE, GOVERNANCE)
  caelum.findOrganization(query)
    .then((result) => {
      console.log(result)
      resolve()
    })
  })
}

/**
* Main
**/
const main = async () => {
  utils.start()
  const query = await utils.ask('Query')
  await load(query)
  utils.end()
}
main()
