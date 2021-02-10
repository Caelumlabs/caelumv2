// Utils.
const utils = require('../utils/index')

// Caelum Lib.
const Caelum = require('../../src/index')
const Blockchain = require('../../src/utils/substrate')
const Crypto = Caelum.loadCrypto()

// Constants
const GOVERNANCE = 'wss://substrate.tabit.caelumapp.com'
const STORAGE = 'https://api.bigchaindb.caelumapp.com/api/v1/'

const poolInfo = require('../certificates/pool.org.json')

// Main function.
const setup = async (password) => {
  // Connect Caelum-SDK & Create a new Root Organization. Governanace Level 0
  const caelum = new Caelum(STORAGE, GOVERNANCE)
  const pool = await caelum.importOrganization(poolInfo, password)
  await pool.loadInformation()
  await pool.loadApplications()

  const peerDid = 'holder'
  const adminVC = await pool.addMember(peerDid, 'admin')
  let valid = await pool.verifyMember(adminVC, 'admin')

  const oidcVC = await pool.addMember(peerDid, 'oidc', {
    email: 'user.email',
    currentGivenName: 'user.currentGivenName',
    currentFamilyName: 'user.currentFamilyName',
    telephone: 'user.telephone',
    govId: 'user.govId',
  })
  valid = await pool.verifyMember(oidcVC, 'oidc')
  console.log(oidcVC, valid)

  console.log(Crypto.random())
}

/**
* Main
**/
const main = async () => {
  utils.start()
  const password = await utils.ask('Password')
  await setup(password)
  utils.end()
}
main()
