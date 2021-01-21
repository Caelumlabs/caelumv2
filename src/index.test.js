/* eslint-disable jest/no-try-expect */
'use strict'

const Caelum = require('.')
let caelum
test('Constructor', async () => {
  caelum = new Caelum('http://localhost:9984/api/v1/')
  expect(caelum).toBeDefined()

  await caelum.newKeys()
  expect(caelum.keys.mnemonic).toBeDefined()
  expect(caelum.keys.seed).toBeDefined()
  expect(caelum.keys.keypair).toBeDefined()
  expect(caelum.keys.keypair.type).toBeDefined()
  expect(caelum.keys.keypair.type).toEqual('Ed25519Keypair')
  expect(caelum.keys.keypair.publicKey).toBeDefined()
  expect(caelum.keys.keypair.privateKey).toBeDefined()

  const seed = caelum.keys.seed
  await caelum.loadKeys(caelum.keys.mnemonic)
  expect(caelum.keys.mnemonic).toBeDefined()
  expect(caelum.keys.seed).toBeDefined()
  expect(caelum.keys.seed).toEqual(seed)
  expect(caelum.keys.keypair).toBeDefined()
  expect(caelum.keys.keypair.type).toBeDefined()
  expect(caelum.keys.keypair.type).toEqual('Ed25519Keypair')
  expect(caelum.keys.keypair.publicKey).toBeDefined()
  expect(caelum.keys.keypair.privateKey).toBeDefined()

  process.env.DEV = 'false'
  try {
    // In production enviroments localhost is not allowed.
    caelum = new Caelum('http://localhost:9984/api/v1/')
  } catch (e) {
    // eslint-disable-next-line jest/no-conditional-expect
    expect(e.message).toEqual('Invalid URL http://localhost:9984/api/v1/')
  }
})
