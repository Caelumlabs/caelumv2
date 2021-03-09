require('dotenv').config()
const utils = require('../utils/index')
const faker = require('faker')
const Caelum = require('../../src/index')

// Main function.
const sdk = async (did) => {
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
