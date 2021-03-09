// Utils.
const utils = require('../utils/index')
const faker = require('faker')
require('dotenv').config()
const Caelum = require('../../src/index')

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
    title: 'Empresa de TAGS',
    description: 'Certificat empresa incorporada a Barcelona',
    url: 'https://barcelonatags.cat',
    logo: 'https://barcelonatags.cat',
    requirements: 'Tenir empresa incorporada a Barcelona',
    issuedTo: 'Organization'
  }
  let api = await idspace.sdk.call('tag', 'add', {data: tagForm})

  api = await idspace.sdk.call('api', 'getAll')
  console.log(' Certificates: ', api.length)
}

/**
* Main
**/
const main = async () => {
  utils.start()
  await sdk('5HTTjSwL7z9P7mefGpJ1DWRYWiSRFJN52aqAK6aEmUUmi2sB')
  utils.end()
}
main()

  