// Utils.
const utils = require('./utils')

// Caelum Lib.
const Caelum = require('../src/index')
const Blockchain = require('../src/utils/substrate')
const Crypto = Caelum.loadCrypto()

// Constants
const GOVERNANCE = 'wss://substrate.tabit.caelumapp.com'
const STORAGE = 'https://api.bigchaindb.caelumapp.com/api/v1/'


// Main function.
const load = async (did) => {
  // Connect Caelum-SDK & Create a new Root Organization. Governanace Level 0
  const caelum = new Caelum(STORAGE, GOVERNANCE)
  const pool = await caelum.loadOrganization(did)
  await pool.loadInformation()
  await pool.loadApplications()
  await pool.loadCertificates()
  console.log(pool)
}

/**
* Main
**/
const main = async () => {
  utils.start()
  const did = await utils.ask('Did')
  await load(did)
  utils.end()
}
main()
