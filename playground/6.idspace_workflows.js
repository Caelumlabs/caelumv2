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

  // Admin login and set session
  await user.login(did, 'admin')
  await idspace.setSession(user.sessions[did].tokenApi, user.sessions[did].capacity)

  // add a new API
  const projectForm = {
    name: 'Project 1',
    description: 'Project Description'
  }
  
  // Add one API.
  let result = await idspace.sdk.call('ide', 'addProject', {data: projectForm})
  const projectId = result.id
  
  // Update project Name.
  projectForm.name = 'Project Final'
  result = await idspace.sdk.call('ide', 'updateProject', {data: projectForm, params: [projectId]})
  
  // Get One projects
  let projects = await idspace.sdk.call('ide', 'getAllProjects')

  // Add one workflow.
  const workflowForm = require('./workflows/wf1.json')
  workflowForm.projectId = projectId
  let workflow = await idspace.sdk.call('ide', 'addWorkflow', {data: workflowForm})
  workflowForm.workflowId = workflow.workflowId
  workflow = await idspace.sdk.call('ide', 'saveDraft', {data: workflowForm})
  workflow = await idspace.sdk.call('ide', 'deploy', {data: workflowForm})

  workflow = await idspace.sdk.call('ide', 'getOneWorkflow', {params: [workflowForm.workflowId]})
  const apiToken = workflow.info.parties[0].apiToken
  console.log('Workflow ID ' + workflowForm.workflowId)
  console.log('API Token ' + apiToken)

  // Call Workflow
  const callWF = {
    stateId: 0,
    workflowId: workflowForm.workflowId,
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
  await user.login(did, 'member-technology')
  const approveForm = {
    stateId: stateId,
    actionId: 3,
    partyId: 2,
    approval_status: 'ok',
    approval_msg: 'This works',
    apiToken: user.sessions[did].tokenApi
  }
  await idspace.sdk.call('workflow', 'approve', {data: approveForm})

  // Delete project
  result = await idspace.sdk.call('ide', 'deleteProject', {params: [projectId]})
  projects = await idspace.sdk.call('ide', 'getAllProjects')
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
  