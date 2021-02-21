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
  // Connect Caelum-SDK & Create a new Root Organization. Governanace Level 0
  const caelum = new Caelum(STORAGE, GOVERNANCE)
  const adminInfo = require('./admin.user.json')
  const user = await caelum.newUser(adminInfo)

  // Log.
  const session = await user.orgs[did].getSession()
  await user.login(did, session.sessionId)

  const sdk = user.openSdK(did)
  const users = await sdk.getUsers()
  console.log(users)

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
