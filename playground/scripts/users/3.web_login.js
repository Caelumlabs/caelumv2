// Utils.
const utils = require('../../utils/index')

// Caelum Lib.
const Caelum = require('../../../src/index')
const Blockchain = require('../../../src/utils/substrate')

// Constants
const GOVERNANCE = 'wss://substrate.tabit.caelumapp.com'
const STORAGE = 'https://api.bigchaindb.caelumapp.com/api/v1/'

// Main function.
const login = async (did) => {
  return new Promise(async resolve => {
    // Connect Caelum-SDK & Create a new Root Organization. Governanace Level 0
    const caelum = new Caelum(STORAGE, GOVERNANCE)

    // Web : Open a session.
    const idspace = await caelum.loadOrganization(did)
    const session = await idspace.getSession()
    console.log('QR Code : ' + session.connectionString)

    // Web. Wait for the login to be fullfilled
    idspace.waitSession(session.sessionId)
    .then(result => {
      console.log('Logged In', result)
      resolve()
    })

    // Mobile App : Login.
    const adminInfo = require('./admin.user.json')
    const user = await caelum.newUser(adminInfo)
    await user.loginConnectionString(session.connectionString)
    console.log('Waiting')
  })
}

/**
* Main
**/
const main = async () => {
  utils.start()
  // const seed = await utils.ask('Governanace Root Seed')
  // const password = await utils.ask('Root Password')
  await login('5DhaoaHnEM5qeBzgEAwaM8kgXfxmA9BbKFYsDpuYCCrDbrtF')
  utils.end()
}
main()
