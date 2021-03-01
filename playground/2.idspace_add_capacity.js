// Utils.
const utils = require('./utils/index')
const faker = require('faker')

// Caelum Lib.
const Caelum = require('../src/index')
const Blockchain = require('../src/utils/substrate')

// Constants
const GOVERNANCE = 'wss://substrate.tabit.caelumapp.com'
const STORAGE = 'https://api.bigchaindb.caelumapp.com/api/v1/'

// Main function.
const sdk = async (did) => {
  // Connect Caelum-SDK & Create a new Root Organization. Governanace Level 0
  const caelum = new Caelum(STORAGE, GOVERNANCE)
  const adminInfo = require('./admin.user.json')
  const user = await caelum.newUser(adminInfo)
  const idspace = await caelum.loadOrganization(did)

  // Login as admin
  await user.login(did, 'admin')
  await idspace.setSession(user.sessions[did].tokenApi, user.sessions[did].capacity)
  let users = await idspace.sdk.call('user', 'getAll')
  console.log('Total users: ', users.length, users)

  // Issue a new capacity.
  const capacity = { userId: users[0].id, subject: 'member-technology' }
  let result = await idspace.sdk.call('user', 'issue', {data: capacity})

  // Get Notifications
  await user.login(did, 'peerdid')
  await idspace.setSession(user.sessions[did].tokenApi, user.sessions[did].capacity)
  const notifications = await idspace.sdk.call('auth', 'notifications')
  await user.claim(idspace, notifications[0].id)

  const userJson = await user.export()
  await utils.saveFile('admin.user', userJson)
/*


  // add a new user
  const userForm = {
    currentGivenName: faker.name.firstName(),
    currentFamilyName: faker.name.lastName(),
    email: faker.internet.email(),
    telephone: '....',
    govId: faker.random.uuid()
  }
  let resultPost = await idspace.sdk.call('user', 'add', {data: userForm})
  const userId = resultPost.userId

  // Issue capacity
  const capacity = { userId: userId, subject: 'member-technology' }
  resultPost = await idspace.sdk.call('user', 'issue', {data: capacity})

  users = await idspace.sdk.call('user', 'getAll')
  console.log('Total users: ', users.length)

  const user1 = await idspace.sdk.call('user', 'getOne', {params: [userId]})
  console.log('user', user1)

  // Call Delete
  resultPost = await idspace.sdk.call('user', 'delete', {params: [userId]})
  users = await idspace.sdk.call('user', 'getAll')
  console.log('Total users: ', users.length)
  */
}

/**
* Main
**/
const main = async () => {
  utils.start()
  // const did = await utils.ask('DID')
  await sdk('5C9yX9aaPuxfawjttBrZhp4M1ACoo8ZRtNtScCGy8aZVTbeG')
  utils.end()
}
main()
