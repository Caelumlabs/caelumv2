// Utils.
const utils = require('../utils/index')
const faker = require('faker')
const fs = require('fs')
// eslint-disable-next-line node/no-path-concat
const filePath = __dirname + '/test.jpg'

// Caelum Lib.
const Caelum = require('../../src/index')

// Constants
const GOVERNANCE = 'wss://substrate.tabit.caelumapp.com'
const STORAGE = 'https://api.bigchaindb.caelumapp.com/api/v1/'

async function getFile(path) {
  return new Promise(resolve => {
    fs.readFile(filePath, async (err, fileData) => {
      if (err) resolve(false)
      else resolve(fileData)
    })
  })
}

// Main function.
const load = async (did) => {
  // Connect Caelum-SDK & Load Organization
  const caelum = new Caelum(STORAGE, GOVERNANCE)
  const pool = await caelum.loadOrganization(did)

  // Add workflow.
  const workflow = pool.getWorkflow(1)

  // First step, coming from an API, needs a token.
  workflow.setToken('054db8a1fb029ece24eb7a57')

  // Set Information for step 1.
  workflow.addPerson('ciutada', {
    currentGivenName: faker.name.firstName(),
    currentFamilyName: faker.name.lastName(),
    email: faker.internet.email(),
    additional: { cadastre: faker.random.uuid() }
  })
  workflow.addJson('coordenades', { latitude: 1, longitude: 2 })
  workflow.addJson('tramit', {ref: faker.random.uuid()})

  // Call set.
  await workflow.set()
  console.log('StateId = ' + workflow.workflow.stateId)

  // Uplaod Image. Step 2.
  workflow.setAction(2)
  await workflow.upload(await getFile(filePath), filePath, 'image/png')
  console.log('Image uploaded')
}

/**
* Main
**/
const main = async () => {
  utils.start()
  // const did = await utils.ask('Did')
  // await load(did)
  // await load('5EURzdJnwfkpmYQvpd8ykWKwMPQZNj8Gh8BphYsxHuXQkFtY') // Valls
  await load('5CSD68xTH3N9qrqwSvkDDkJBqJCnxkaJGs7NwEVaii7qZPVn') // local

  utils.end()
}
main()
