// Utils.
require('dotenv').config()
const utils = require('../utils/index')
const Caelum = require('../../src/index')

// Main function.
const register = async (did, secretCode) => {
  // Connect Caelum-SDK & Create a new Root Organization. Governanace Level 0
  const caelum = new Caelum(utils.STORAGE, utils.GOVERNANCE)
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
  await register('5HTTjSwL7z9P7mefGpJ1DWRYWiSRFJN52aqAK6aEmUUmi2sB', 'cc0c9d5c')
  utils.end()
}
main()
