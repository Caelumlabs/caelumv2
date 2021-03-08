// Utils.
const utils = require('./utils/index')
const faker = require('faker')
const Caelum = require('../src/index')

// Constants

// Main function.
const sdk = async (did) => {
  // Connect Caelum-SDK & Create a new Root Organization. Governanace Level 0
  const caelum = new Caelum(utils.STORAGE, utils.GOVERNANCE)
  const adminInfo = require('./admin.user.json')
  const user = await caelum.newUser(adminInfo)
  const idspace = await caelum.loadOrganization(did)

  // Admin login and set session
  await user.login(did, 'admin')
  await idspace.setSession(user.sessions[did].tokenApi, user.sessions[did].capacity)

  const auth = {
    url: "https:77tramit.com",
    username: "caelum",
    password: "hello"
  }
  const endpoints = [
    {
      method: "POST",
      url: "https:/7tarmit.com",
      name: "feedback"
    }
  ]
  const apiForm = {
    name: 'Tramit',
    description: 'Tramit - integració',
    integrationTypeId : 2,
    authenticationId: 3,
    authConfiguration: JSON.stringify(auth),
    endpoints: JSON.stringify(endpoints)
  }
  let api = await idspace.sdk.call('api', 'add', {data: apiForm})

  // Get API Information.
  api = await idspace.sdk.call('api', 'getOne', {params: [1]})
  // console.log('API', api)

  console.log('GET All API')
  api = await idspace.sdk.call('api', 'getAll')
  // console.log('API', api)


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

  