// Utils.
require('dotenv').config()
const fs = require('fs')
const utils = require('../utils/index')
const faker = require('faker')
const Caelum = require('../../src/index')
const FormData = require('form-data')
const filePath = __dirname + '/test.jpg'

// Main function.
const sdk = async (did) => {
  const caelum = new Caelum(utils.STORAGE, utils.GOVERNANCE)
  const adminInfo = require('./admin.user.json')
  const user = await caelum.newUser(adminInfo)
  const idspace = await caelum.loadOrganization(did)
  await idspace.startSdk()

  // Call Workflow
  const workflowId = 1
  const apiToken = '09ba935d8df81fa08120696b'
  const callWF = {
    stateId: 0,
    workflowId: workflowId,
    actionId: 1,
    partyId: 1,
    apiToken: apiToken,
    ciutada_currentGivenName: faker.name.firstName(),
    ciutada_currentFamilyName: faker.name.lastName(),
    ciutada_email: faker.internet.email(),
    ciutada_telephone: '+34 655 14 42 11',
    ciutada_currentGivenName: '1222111A',
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

  // Login as tech
  
  // await user.login(did, 'member-technology')
  /*
  const approveForm = {
    stateId: stateId,
    actionId: 3,
    partyId: 2,
    approval_status: 'ok',
    approval_msg: 'This works',
    apiToken: user.sessions[did].tokenApi
  }*/
  // await idspace.sdk.call('workflow', 'approve', {data: approveForm})
}

/**
* Main
**/
const main = async () => {
  utils.start()
  // const did = await utils.ask('DID')
  await sdk(process.env.DID_VALLS)
  utils.end()
}
main()
  