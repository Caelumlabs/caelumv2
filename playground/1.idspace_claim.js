// Utils.
const utils = require('./utils/index')

// Caelum Lib.
const Caelum = require('../src/index')
const Blockchain = require('../src/utils/substrate')

// Constants
const GOVERNANCE = 'wss://substrate.tabit.caelumapp.com'
const STORAGE = 'https://api.bigchaindb.caelumapp.com/api/v1/'

// Main function.
const register = async (did, secretCode) => {
  // Connect Caelum-SDK & Create a new Root Organization. Governanace Level 0
  const caelum = new Caelum(STORAGE, GOVERNANCE)
  const user = await caelum.newUser()

  // Opens a new session with the Idspace
  const idspace = await caelum.loadOrganization(did, true)
  const session = await idspace.getSession()
  console.log('QR Code : ' + session.connectionString)

  // Register the user.
  const peerDid = await user.registerConnectionString(session.connectionString, secretCode)

  // Export user to JSON encrypted with password
  const userJson = await user.export()
  await utils.saveFile('admin.user', userJson)
  // Log.
  utils.logV('PeerDID', peerDid)

}

/**
* Main
**/
const main = async () => {
  utils.start()
  // const did = await utils.ask('DID')
  const did = '5C9yX9aaPuxfawjttBrZhp4M1ACoo8ZRtNtScCGy8aZVTbeG'
<<<<<<< HEAD
  const secret= await utils.ask('Secret Code')
=======
  const secret = await utils.ask('Secret Code')
>>>>>>> upstream/main
  await register(did, secret)
  utils.end()
}
main()
