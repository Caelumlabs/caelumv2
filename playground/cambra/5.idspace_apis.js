// Utils.
const utils = require('../utils/index')
const faker = require('faker')
require('dotenv').config()
const Caelum = require('../../src/index')

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

  const auth = { value: "SG.Z6XwKEPMR1eyY_ObeNTvbA." }
  const endpoints = [
    { templateId: 'd-b8c368c2c7774648887a1a92e52301c9', name: 'cambra - nou tagger' },
    { templateId: 'd-8b8b359d76ef4739b4698abfecf8580e', name: 'tagger - benvingut' },
    { templateId: 'd-d48b49c817a042009b09f3c4ba5838b1', name: 'tagger - pagar' },
    { templateId: 'd-605115312faa42a291dd718f7611217d', name: 'tagger - pagament Ok' },
    { templateId: 'd-ee151ed5d7d04864b71b68c55ac56d3d', name: 'caelum - alta idspace' }
  ]

  const apiForm = {
    name: 'Sendgrid',
    description: 'Email processos',
    integrationTypeId : 1,
    authenticationId: 1,
    authConfiguration: JSON.stringify(auth),
    endpoints: JSON.stringify(endpoints)
  }
  // let api = await idspace.sdk.call('api', 'add', {data: apiForm})

  // Get API Information.
  api = await idspace.sdk.call('api', 'getOne', {params: [1]})
  // console.log('API', api)

  console.log('GET All API')
  api = await idspace.sdk.call('api', 'getAll')
  console.log('API', api)


}

/**
* Main
**/
const main = async () => {
  utils.start()
  // const did = await utils.ask('DID')
  await sdk('5HTTjSwL7z9P7mefGpJ1DWRYWiSRFJN52aqAK6aEmUUmi2sB')
  utils.end()
}
main()

  