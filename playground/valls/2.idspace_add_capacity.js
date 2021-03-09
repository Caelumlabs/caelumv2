// Utils.
require('dotenv').config()
const utils = require('../utils/index')
const faker = require('faker')
const Caelum = require('../../src/index')

// Main function.
const sdk = async (did) => {
  // Connect Caelum-SDK & Create a new Root Organization. Governanace Level 0
  const caelum = new Caelum(utils.STORAGE, utils.GOVERNANCE)
  const adminInfo = require('./admin.user.json')
  const user = await caelum.newUser(adminInfo)
  const idspace = await caelum.loadOrganization(did)

  // Login as admin
  await user.login(did, 'admin')
  await idspace.setSession(user.sessions[did].tokenApi, user.sessions[did].capacity)
  let users = await idspace.sdk.call('user', 'getAll')
  console.log('Total users: ', users.length)

  // Issue a new capacity.
  const capacity = { userId: users[1].id, subject: 'member-technology' }
  // let result = await idspace.sdk.call('user', 'issue', {data: capacity})

  // Get Notifications
  await user.login(did, 'peerdid')
  await idspace.setSession(user.sessions[did].tokenApi, user.sessions[did].capacity)
  const notifications = await idspace.sdk.call('auth', 'notifications')

  // Claim capacity for the user.
  await user.claim(idspace, notifications[0].id)

  // The wallet has been updated. Save changes.
  const userJson = await user.export()
  await utils.saveFile('admin.user', userJson)
}

/**
* Main
**/
const main = async () => {
  utils.start()
  await sdk(process.env.DID_VALLS)
  utils.end()
}
main()
