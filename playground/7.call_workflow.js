// Utils.
const utils = require('./utils/index')
const faker = require('faker')
const Caelum = require('../src/index')
const FormData = require('form-data')
const fs = require('fs')
const filePath = __dirname + '/assets/test.jpg'
require('dotenv').config()

// Main function.
const sdk = async (did) => {
  // Connect Caelum-SDK & Create a new Root Organization. Governanace Level 0
  const caelum = new Caelum(utils.STORAGE, utils.GOVERNANCE)
  const adminInfo = require('./admin.user.json')
  const user = await caelum.newUser(adminInfo)
  const idspace = await caelum.loadOrganization(did)
  await idspace.startSdk()

  // Call Workflow
  const workflowId = 1
  const apiToken = '1dfb9f566bbe390886f9b2b5'
  const callWF = {
    stateId: 0,
    workflowId: workflowId,
    actionId: 1,
    partyId: 1,
    apiToken: apiToken,
    ciutada_currentGivenName: faker.name.firstName(),
    ciutada_currentFamilyName: faker.name.lastName(),
    ciutada_email: faker.internet.email(),
    ciutada_telephone: '+34 678 54 43 57',
    ciutada_currentGivenName: '34753074M',
    coordenades_longitude: '1',
    coordenades_latitude: '2'
  }
  result = await idspace.sdk.call('workflow', 'set', {data: callWF})
  const stateId = result.stateId
  console.log('StateId ' + stateId)

  const imageData = fs.readFileSync(filePath)
  const form = new FormData()
  form.append('file', imageData, { filepath: filePath, contentType: 'image/png' })
  form.append('workflow', JSON.stringify({
      stateId: stateId,
      actionId: 2,
      partyId: 1,
      apiToken: apiToken
    }))
  await idspace.sdk.call('workflow', 'upload', {form: form})

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
  