// Utils.
const utils = require('../utils/index')

// Caelum Lib.
const Caelum = require('../../src/index')
const Blockchain = require('../../src/utils/substrate')

// Constants
const GOVERNANCE = 'wss://substrate.tabit.caelumapp.com'
const STORAGE = 'https://api.bigchaindb.caelumapp.com/api/v1/'

/**
* Load from export file
**/
const idspace = async (password, did, seed) => {

    // Connect Caelum-SDK & Create a new Root Organization. Governanace Level 0
  const caelum = new Caelum(STORAGE, GOVERNANCE)
  const pool = await caelum.newOrganization(did)

  // Storage
  utils.spin()
  utils.logSpinner('Storage', 'Add Diddocument List', 1, 5)
  await pool.addApplication('diddocument')
  utils.logSpinner('Storage', 'Save Diddocument', 2, 5)
  await pool.saveDidDocument()
  utils.logSpinner('Storage', 'Add Verified List', 3, 5)
  await pool.addApplication('verified')
  utils.logSpinner('Applications', 'Add Application List', 4, 5)
  await pool.addApplication('applications')
  utils.logSpinner('Storage', 'Save DID to Storage', 5, 5)
  await pool.saveOrganization({
    id: 'did:caelum:' + did,
    legalName: 'Tabit Ecosystem',
    taxId: '-',
    network: 'tabit'
  })
  utils.unspin()
  utils.nl()
  utils.logV('CreateTxId', pool.createTxId)

  // Governance
  const governance = new Blockchain(GOVERNANCE)
  await governance.connect()
  utils.spin()
  const tempAddress = await governance.setKeyring(seed)
  utils.logSpinner('Governance', 'Rotate Key', 1, 5)
  const newAccount = pool.keys.governance.address
  await governance.rotateKey(did, newAccount)
  utils.logSpinner('Governance', 'change Owner', 2, 5)
  await governance.changeOwner(did, newAccount)
  utils.logSpinner('Governance', 'transfer All Tokens', 3, 5)
  await governance.transferAllTokens(newAccount)
  utils.logSpinner('Governance', 'register Did Document', 4, 5)
  await governance.setKeyring(pool.keys.governance.mnemonic)
  await governance.registerDidDocument(did, pool.createTxId)

  utils.unspin()
  utils.nl()

  const exportJson = await pool.export(password)
  await utils.saveFile('pool.org', exportJson)
}

/**
* Main
**/
const main = async () => {
  utils.start()
  const password = await utils.ask('password')
  const did = await utils.ask('did')
  const seed = await utils.ask('Temp wallet Seed')
  await idspace(password, did, seed)
  utils.end()
}
main()
