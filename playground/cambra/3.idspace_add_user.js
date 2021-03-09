// Utils.
const utils = require('./utils/index')
const faker = require('faker')
require('dotenv').config()

// Caelum Lib.
const Caelum = require('../src/index')
const Blockchain = require('../src/utils/substrate')

// Main function.
const sdk = async (did) => {
  // Connect Caelum-SDK & Create a new Root Organization. Governanace Level 0
  const caelum = new Caelum(utils.STORAGE, utils.GOVERNANCE)
  const adminInfo = require('./admin.user.json')
  const user = await caelum.newUser(adminInfo)
  const idspace = await caelum.loadOrganization(did)

  // Admin login
  await user.login(did, 'admin')
  await idspace.setSession(user.sessions[did].tokenApi, user.sessions[did].capacity)

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
  // const capacity = { userId: userId, subject: 'admin' }
  resultPost = await idspace.sdk.call('user', 'issue', {data: capacity})
  users = await idspace.sdk.call('user', 'getAll')
  console.log('Total users: ', users.length)

  // Get the user.
  const user1 = await idspace.sdk.call('user', 'getOne', {params: [userId]})
  console.log('user', user1)

  // Delete the user.
  // resultPost = await idspace.sdk.call('user', 'delete', {params: [userId]})
  // users = await idspace.sdk.call('user', 'getAll')
  // console.log('Total users: ', users.length)
}

/**
* Main
**/
const main = async () => {
  utils.start()
  // const did = await utils.ask('DID')
  await sdk(process.env.DID)
  utils.end()
}
main()
