'use strict'

const Caelum = require('../index')
const caelum = new Caelum('http://localhost:9984/api/v1/')
test('Organization', async () => {
  const org = await caelum.newOrganization({
    legalName: global.org[0].legalName,
    taxID: global.org[0].taxID,
    countryCode: 'ES'
  })
  expect(org.subject.taxID).toEqual(global.org[0].taxID)
  expect(org.subject.legalName).toEqual(global.org[0].legalName)
  expect(org.subject.countryCode).toEqual(global.org[0].countryCode)
  expect(org.did).toBeDefined()
  expect(org.did).toHaveLength(44)

  const key = await org.setKeys()
  expect(org.keys).toBeDefined()
  expect(org.keys.publicKey).toBeDefined()
  expect(org.keys.privateKey).toBeDefined()
  expect(org.keys.mnemonic).toBeDefined()
  expect(org.keys.seed).toBeDefined()

  await org.setKeys(key.mnemonic)
  expect(org.keys.publicKey).toEqual(key.publicKey)
  expect(org.keys.privateKey).toEqual(key.privateKey)
})

test('Invalid Subject', () => {
  return caelum.newOrganization('helloWorld')
    .then(() => { throw (new Error('should throw an error')) })
    .catch((e) => {
      expect(e.name).toEqual('Error')
      expect(e.message).toEqual('Invalid subject')
    })
})

test('Invalid Organization legalName', async () => {
  return caelum.newOrganization({ legalName: 4, taxID: 'B101519', countryCode: global.org[0].countryCode })
    .then(() => { throw (new Error('should throw an error')) })
    .catch((e) => {
      expect(e.name).toEqual('Error')
      expect(e.message).toEqual('Invalid legalName')
    })
})

test('Invalid Organization countryCode', async () => {
  return caelum.newOrganization({ legalName: global.org[0].legalName, taxID: global.org[0].taxID })
    .then(() => { throw (new Error('should throw an error')) })
    .catch((e) => {
    // eslint-disable-next-line jest/no-conditional-expect
      expect(e.name).toEqual('Error')
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e.message).toEqual('Invalid countryCode')
    })
})

test('Unknown Organization countryCode', async () => {
  return caelum.newOrganization({ legalName: global.org[0].legalName, taxID: global.org[0].taxID, countryCode: 'FR' })
    .then(() => { throw (new Error('should throw an error')) })
    .catch((e) => {
    // eslint-disable-next-line jest/no-conditional-expect
      expect(e.name).toEqual('Error')
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e.message).toEqual('Unknown countryCode')
    })
})

test('Invalid Organization taxID - 1', async () => {
  return caelum.newOrganization({ legalName: 'Caelum Innovation SL', taxID: '123489', countryCode: global.org[0].countryCode })
    .then(() => { throw (new Error('should throw an error')) })
    .catch((e) => {
    // eslint-disable-next-line jest/no-conditional-expect
      expect(e.name).toEqual('Error')
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e.message).toEqual('Invalid taxID')
    })
})

test('Invalid Organization taxID - 2', async () => {
  return caelum.newOrganization({ legalName: 'Caelum Innovation SL', taxID: '123456789', countryCode: global.org[0].countryCode })
    .then(() => { throw (new Error('should throw an error')) })
    .catch((e) => {
    // eslint-disable-next-line jest/no-conditional-expect
      expect(e.name).toEqual('Error')
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e.message).toEqual('Invalid taxID')
    })
})

test('Invalid Organization taxID - 3', async () => {
  return caelum.newOrganization({ legalName: 'Caelum Innovation SL', taxID: 'B23456f89', countryCode: global.org[0].countryCode })
    .then(() => { throw (new Error('should throw an error')) })
    .catch((e) => {
    // eslint-disable-next-line jest/no-conditional-expect
      expect(e.name).toEqual('Error')
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e.message).toEqual('Invalid taxID')
    })
})

test('Invalid Organization taxID - 4', async () => {
  return caelum.newOrganization({ legalName: 'Caelum Innovation SL', taxID: 'B11111111', countryCode: global.org[0].countryCode })
    .then(() => { throw (new Error('should throw an error')) })
    .catch((e) => {
    // eslint-disable-next-line jest/no-conditional-expect
      expect(e.name).toEqual('Error')
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e.message).toEqual('Invalid taxID')
    })
})

test('Invalid Organization taxID - 5', async () => {
  return caelum.newOrganization({ legalName: 'Caelum Innovation SL', taxID: 'P11111111', countryCode: global.org[0].countryCode })
    .then(() => { throw (new Error('should throw an error')) })
    .catch((e) => {
    // eslint-disable-next-line jest/no-conditional-expect
      expect(e.name).toEqual('Error')
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e.message).toEqual('Invalid taxID')
    })
})
