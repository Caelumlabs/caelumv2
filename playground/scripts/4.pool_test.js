// Utils.
const utils = require('../utils/index')

// Caelum Lib.
const Caelum = require('../../src/index')
const Blockchain = require('../../src/utils/substrate')

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
  console.log(pool)

  const peerDid = 'holder'
  const adminVC = await pool.addMember(peerDid, 'admin')
  const valid = await pool.verifyMember(adminVC, 'admin')

  console.log(valid)
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
