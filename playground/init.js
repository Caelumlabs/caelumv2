// Utils.
const utils = require('./utils')

// Caelum Lib.
const Caelum = require('../src/index')
const Blockchain = require('../src/utils/substrate')

// Constants
const GOVERNANCE = 'wss://substrate.tabit.caelumapp.com'
const STORAGE = 'https://api.bigchaindb.caelumapp.com/api/v1/'
const ROOT_LEVEL = 10

// Main function.
const init = async (seed, password) => {
  // Connect Caelum-SDK & Create a new Root Organization. Governanace Level 0
  const caelum = new Caelum(STORAGE, GOVERNANCE)
  const pool = await caelum.newOrganization(false, true)

  // Log.
  utils.logV('DID', pool.did)
  utils.logV('SEED', pool.keys.governance.mnemonic)

  // Setup Governance.
  const governance = new Blockchain(GOVERNANCE)
  await governance.connect()
  governance.setKeyring(seed)

  // RegisterDID
  const poolAddress = pool.keys.governance.address
  utils.logV('Temp Wallet', poolAddress)
  utils.spin()
  utils.logSpinner('Governance', 'Register DID to Governance', 1, 3)
  await governance.registerDid(pool.did, poolAddress, ROOT_LEVEL)
  utils.logSpinner('Governance', 'Wait for the Block', 2, 3)
  await governance.wait4Event('DidRegistered')

  // Send Governanace tokens
  const amountTransfer = Blockchain.units * 500
  utils.logSpinner('Governance', 'Transfer token units '+ 500, 3, 3)
  await governance.transferTokensNoFees(poolAddress, amountTransfer)

  // Save Org.
  const exportJson = await pool.export(password)
  utils.unspin()

  // await utils.saveFile('pool.org', exportJson)
  await governance.disconnect()
}

/**
* Main
**/
const main = async () => {
  utils.start()
  // const seed = await utils.ask('Governanace Root Seed')
  // const password = await utils.ask('Root Password')
  await init('what unlock stairs benefit salad agent rent ask diamond horror fox aware', 'nikola')
  utils.end()
}
main()
