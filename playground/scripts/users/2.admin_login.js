// Utils.
const utils = require('../../utils/index')

// Caelum Lib.
const Caelum = require('../../../src/index')
const Blockchain = require('../../../src/utils/substrate')

// Constants
const GOVERNANCE = 'wss://substrate.tabit.caelumapp.com'
const STORAGE = 'https://api.bigchaindb.caelumapp.com/api/v1/'

// Main function.
const sdk = async (did) => {
  // Connect Caelum-SDK & Create a new Root Organization. Governanace Level 0
  const caelum = new Caelum(STORAGE, GOVERNANCE)
  const adminInfo = require('./admin.user.json')
  const user = await caelum.newUser(adminInfo)
  console.log(user.credentials)
  await user.login(did, 'admin')

  console.log(user.sessions[did])
  const idspace = await caelum.loadOrganization(did)
  await idspace.setSession(user.sessions[did].tokenApi, user.sessions[did].capacity)

  // const info = await idspace.sdk.call('user', 'getOne', {params: [user.sessions[did].user.id]})
  // console.log(info)
  // Log.


}

/**
* Main
**/
const main = async () => {
  utils.start()
  // const seed = await utils.ask('Governanace Root Seed')
  // const password = await utils.ask('Root Password')
  await sdk('5Gge54aRGqSjKCp76E7PPkVfKg4GxwNZQxX1QGWU6g5b5MeJ')
  utils.end()
}
main()
