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

  let tagForm = {
    title: 'Certificat #1',
    description: 'Certificat #1',
    url: 'https://valls.cat',
    logo: 'https://valls.cat',
    requirements: 'Reciclar',
    issuedTo: 'Persona'
  }
  let api = await idspace.sdk.call('tag', 'add', {data: tagForm})

  tagForm.title = 'Certificat #2'
  tagForm.description = 'Certificat #2'
  api = await idspace.sdk.call('tag', 'add', {data: tagForm})
  
  tagForm.title = 'Certificat #3'
  tagForm.description = 'Certificat #3'
  api = await idspace.sdk.call('tag', 'add', {data: tagForm})

  api = await idspace.sdk.call('api', 'getAll')
  console.log(' Certificates: ', api.length)


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

  