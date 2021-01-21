'use strict'

const Caelum = require('../index')
const caelum = new Caelum('http://localhost:9984/api/v1/')
const validAppName = 'integrity'

let org, app
test('Application', async () => {
  org = await caelum.newOrganization({
    taxID: global.org[0].taxID,
    legalName: global.org[0].legalName,
    countryCode: global.org[0].countryCode
  })
  await org.setKeys()
  app = await org.saveApplication({ name: validAppName, applicationCategory: 1, version: 1 })
  expect(app).toBeDefined()
  expect(app.subject).toBeDefined()
  expect(app.createId).toBeDefined()
  expect(app.subject.name).toEqual(validAppName)
})
