const BlockchainInterface = require('./index')

class Test1 extends BlockchainInterface {}
class Test2 extends BlockchainInterface {
  async connect () {}
  async disconnect () {}
  setKeyring (seed) {}
  getAddress (seed) {}
  addrState (address) {}
  async transferTokens (addrTo, amount) {}
  async registerDid (did, pubKey) {}
  async getActualKey (did) {}
  async getActualDidKey (did) {}
  async registerDidDocument (did, diddocHash) {}
  async getDidDocHash (did) {}
  async rotateKey (did, pubKey) {}
}

test('Create a Class with the Interface', () => {
  expect(() => { Test1() }).toThrow(Error)
  const test = new Test2()
  expect(test).toBeDefined()
})
