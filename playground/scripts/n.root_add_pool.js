// Utils.
const utils = require('../utils/index')

// Caelum Lib.
const Caelum = require('../../src/index')
const Blockchain = require('../../src/utils/substrate')

// Constants
const GOVERNANCE = 'wss://substrate.tabit.caelumapp.com'
const STORAGE = 'https://api.bigchaindb.caelumapp.com/api/v1/'
const ROOT_LEVEL = 100
const rootInfo = require('../certificates/root.org.json')

// Main function.
const init = async (password) => {
  // Connect Caelum-SDK & Create a new Root Organization. Governanace Level 0
  const caelum = new Caelum(STORAGE, GOVERNANCE)
  const root = await caelum.importOrganization(rootInfo, password)
  await await root.loadInformation()
  const signedVC = await root.generateDid({
    legalName: 'Chamber of Commerce',
    taxID: 'Q0873001B',
    network: 'tabit',
    countryCode: 'ES'
  })

  const filename = signedVC.credentialSubject.id + '.cert'
  await utils.saveFile(filename, JSON.stringify(signedVC))
  utils.log(signedVC)
}

/**
* Main
**/
const main = async () => {
  utils.start()
  // const password = await utils.ask('Password')
  // await init(password)
  await init('nikola')
  utils.end()
}
main()
