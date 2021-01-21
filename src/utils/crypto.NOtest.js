const Crypto = require('./crypto')
const fs = require('fs')
const path = require('path')

let alice
let rnd = false
const message = 'Hello World'
const password = 'password random'

test('KeyPair generation', async () => {
  await Crypto.init()
  alice = Crypto.keyPair()
  expect(alice.mnemonic).toBeDefined()
  const mnemonicArray = alice.mnemonic.split(' ')
  expect(mnemonicArray).toHaveLength(12)
  expect(alice.publicKey).toBeDefined()
  expect(alice.publicKey).toHaveLength(66)
  expect(alice.address).toBeDefined()
  expect(alice.address).toHaveLength(48)
  expect(alice.box).toBeDefined()
  expect(alice.box.publicKey).toBeDefined()
  expect(alice.box.secretKey).toBeDefined()
})

test('Base58 Encode/decode', async () => {
  const pubKey = Crypto.u8aToBase58(alice.box.publicKey)
  expect(pubKey).toBeDefined()
  expect(alice.box.publicKey).toEqual(Crypto.base58ToU8a(pubKey))
})

test('KeyPair generation from mnemonic', async () => {
  const alice2 = Crypto.keyPair(alice.mnemonic)
  expect(alice.mnemonic).toBeDefined()
  expect(alice.pubKey).toEqual(alice2.pubKey)
})

test('Should hash a String', () => {
  const result = Crypto.blake2('Hello world')
  expect(result).toBeDefined()

  const result1 = Crypto.hash('Hello world')
  expect(result1).toBeDefined()
  expect(result1).toEqual('0xa21cf4b3604cf4b2bc53e6f88f6a4d75ef5ff4ab415f3e99aea6b61c8249c4d0')

  const result2 = Crypto.hash({ test: 'Hello world' })
  expect(result2).toBeDefined()
  expect(result2).toEqual('0x9ebc09154518985254db0d83558368bbf6144e7caf8c1c05bbae250a44342573')

  const result3 = Crypto.hash({ test: 'Hello world', id: 2 })
  expect(result3).toBeDefined()
})

test('Should create a random String', () => {
  rnd = Crypto.random()
  expect(rnd).toBeDefined()
  expect(rnd).toHaveLength(32)
  rnd = Crypto.random(16)
  expect(rnd).toHaveLength(16)
  rnd = Crypto.random(8)
  expect(rnd).toHaveLength(8)
})

test('Should create a random PIN', () => {
  rnd = Crypto.randomPin()
  expect(rnd).toBeDefined()
  expect(rnd).toHaveLength(6)
  rnd = Crypto.randomPin(4)
  expect(rnd).toHaveLength(4)
})

test('Should create a new Signature', async () => {
  const signature = Crypto.signMessage(message, alice.keyPair)
  expect(signature).toBeDefined()
  const check = Crypto.checkSignature(message, signature, alice.address)
  expect(check).toEqual(true)
})

// Encryption.
test('Should encrypt & decrypt a message', () => {
  const msgEncrypted = Crypto.encrypt(password, message)
  expect(msgEncrypted.encrypted).toBeDefined()
  expect(msgEncrypted.nonce).toBeDefined()
  const msg = Crypto.decrypt(password, msgEncrypted)
  expect(msg).toEqual(message)
})

// Encryption.
test('Should encrypt & decrypt a buffer', () => {
  const buffer = fs.readFileSync(path.resolve(__dirname, '../test/dog.gif'))
  const msgEncrypted = Crypto.encryptBuffer(password, buffer)
  expect(msgEncrypted.encrypted).toBeDefined()
  expect(msgEncrypted.nonce).toBeDefined()
  const msg = Crypto.decryptBuffer(password, msgEncrypted)
  expect(msg).toEqual(buffer)
})

// Encryption.
test('Should encrypt & decrypt an object', () => {
  const msgEncrypted = Crypto.encryptObj(password, { msg: message, test: 'áà # test' })
  const testMessage = JSON.parse(msgEncrypted)
  expect(testMessage.e).toBeDefined()
  expect(testMessage.n).toBeDefined()

  const result = Crypto.decryptObj(password, msgEncrypted)
  expect(result.msg).toEqual(message)
  expect(result.test).toEqual('áà # test')
})

test('nacl encryption', () => {
  const receiver = Crypto.keyPair()
  const msgEncrypted = Crypto.box(message, alice.box.secretKey, receiver.box.publicKey)
  const msg = Crypto.unbox(msgEncrypted, alice.box.publicKey, receiver.box.secretKey)
  expect(msg).toEqual(message)
  const objEncrypted = Crypto.boxObj({ msg: message }, alice.box.secretKey, receiver.box.publicKey)
  const obj = Crypto.unboxObj(objEncrypted, alice.box.publicKey, receiver.box.secretKey)
  expect(obj).toEqual({ msg: message })
})
