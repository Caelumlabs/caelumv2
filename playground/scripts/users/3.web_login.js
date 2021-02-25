// Utils.
const utils = require('../../utils/index')
const faker = require('faker')

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

    // Web. Wait for the login to be fullfilled
    idspace.waitSession(session.sessionId)
    .then(async result => {
      console.log('Logged In', result.user.currentGivenName)
      const webSessionOrg = await caelum.loadOrganization(did)
      await webSessionOrg.setSession(idspace.sdk.tokenApi, result.isAdmin)

      // add a new user
      const user = {
        currentGivenName: faker.name.firstName(),
        currentFamilyName: faker.name.lastName(),
        email: faker.internet.email(),
        telephone: '....',
        govId: faker.random.uuid()
      }
      let resultPost = await webSessionOrg.sdk.call('user', 'add', {data: user})
      const userId = resultPost.userId

      // Issue capacity
      const capacity = { userId: userId, subject: 'member-technology' }
      resultPost = await webSessionOrg.sdk.call('user', 'issue', {data: capacity})

      let usersWeb = await webSessionOrg.sdk.call('user', 'getAll')
      console.log('Total users: ', usersWeb.length)

      const user1 = await webSessionOrg.sdk.call('user', 'getOne', {params: [userId]})
      console.log('user', user1)

      // Call Delete
      resultPost = await webSessionOrg.sdk.call('user', 'delete', {params: [userId]})
      console.log(resultPost)
      usersWeb = await webSessionOrg.sdk.call('user', 'getAll')
      console.log('Total users: ', usersWeb.length)

      // Add Tag

      // Get all tags

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
  await login('5Gge54aRGqSjKCp76E7PPkVfKg4GxwNZQxX1QGWU6g5b5MeJ')
  utils.end()
}
main()
