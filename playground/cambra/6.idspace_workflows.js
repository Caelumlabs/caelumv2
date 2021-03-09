// Utils.
const utils = require('../utils/index')
const faker = require('faker')
const Caelum = require('../../src/index')
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
    name: 'Tags',
    description: 'Gestió Empreses'
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
  const workflowForm = require('../workflows/wf2.json')
  workflowForm.projectId = projectId
  let workflow = await idspace.sdk.call('ide', 'addWorkflow', {data: workflowForm})
  workflowForm.workflowId = workflow.workflowId
  workflow = await idspace.sdk.call('ide', 'saveDraft', {data: workflowForm})
  workflow = await idspace.sdk.call('ide', 'deploy', {data: workflowForm})

  workflow = await idspace.sdk.call('ide', 'getOneWorkflow', {params: [workflowForm.workflowId]})
  const apiToken = workflow.info.parties[0].apiToken
  console.log('Workflow ID ' + workflowForm.workflowId)
  console.log('API Token ' + apiToken)

  projects = await idspace.sdk.call('ide', 'getAllProjects')
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
  