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

  // add a new API
  const projectForm = {
    name: 'Project 1',
    description: 'Project Description'
  }
  
  // Add one API.
  let result = await idspace.sdk.call('ide', 'addProject', {data: projectForm})
  const projectId = result.id
  
  // Get All projects
  let projects = await idspace.sdk.call('ide', 'getAllProjects')
  console.log('Projects: ', projects.length)

  // Update project Name.
  projectForm.name = 'Project Final'
  result = await idspace.sdk.call('ide', 'updateProject', {data: projectForm, params: [projectId]})
  
  // Get One projects
  projects = await idspace.sdk.call('ide', 'getOneProject', {params: [projectId]})
  console.log('Project', projects)

  // Add one workflow.
  const workflow = await idspace.sdk.call('ide', 'addWorkflow', {params: [projectId]})

  // Save Workflow

  // Deploy Workflow

  // Edit Workflow

  // Delete Workflow

  // Delete project
  result = await idspace.sdk.call('ide', 'deleteProject', {params: [projectId]})
  projects = await idspace.sdk.call('ide', 'getAllProjects')
  console.log('Projects: ', projects.length)
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
  