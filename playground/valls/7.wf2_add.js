require('dotenv').config()
const fs = require('fs')
const faker = require('faker')
const utils = require('../utils/index')
const Caelum = require('../../src/index')
const FormData = require('form-data')
const filePath = __dirname + '/assets/test.jpg'

// Main function.
const sdk = async (did) => {
  const caelum = new Caelum(utils.STORAGE, utils.GOVERNANCE)
  const adminInfo = require('./admin.user.json')
  const user = await caelum.newUser(adminInfo)
  const idspace = await caelum.loadOrganization(did)

  // Admin login and set session
  await user.login(did, 'admin')
  await idspace.setSession(user.sessions[did].tokenApi, user.sessions[did].capacity)
  const projectId = 1
  
  // Add one workflow.
  const workflowForm = require('./wf2.json')
  workflowForm.projectId = projectId
  let workflow = await idspace.sdk.call('ide', 'addWorkflow', {data: workflowForm})
  workflowForm.workflowId = workflow.workflowId
  workflow = await idspace.sdk.call('ide', 'saveDraft', {data: workflowForm})
  workflow = await idspace.sdk.call('ide', 'deploy', {data: workflowForm})

  workflow = await idspace.sdk.call('ide', 'getOneWorkflow', {params: [workflowForm.workflowId]})
  const apiToken = workflow.info.parties[0].apiToken
  console.log('Workflow ID ' + workflowForm.workflowId)
  console.log('API Token ' + apiToken)
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
  