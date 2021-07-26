// const didDoc = require('./diddoc')
/* eslint-disable */
const { zencode_exec } = require('zenroom')
/* eslint-enable */

const zexecute = (zencode, _data = {}, _keys = {}) => {
  return new Promise((resolve, reject) => {
    const keys = JSON.stringify(_keys)
    const data = JSON.stringify(_data)
    const conf = 'color=0,debug=0'
    zencode_exec(zencode, { data, keys, conf })
      .then((result) => {
        resolve(JSON.parse(result.result))
      })
      .catch((error) => {
        reject(new Error(error))
      })
  })
}

/**
 * Javascript Class to interact with Zenroom.
 */
module.exports = class W3C {
  /**
   * New Blockchain KeyPair.
   *
   * @returns {object} Key pair
   */
  static async newKeys (did) {
    return new Promise((resolve, reject) => {
      const zencode = `
        Scenario 'ecdh': Create the keypair
        Given my name is in a 'string' named 'myName'
        When I create the keypair
        Then print my data`
      zexecute(zencode, { myName: did }).then(resolve)
    })
  }

  /**
   * New Blockchain KeyPair.
   *
   * @returns {object} Key pair
   */
  static async getKeys (keys) {
    return keys
  }

  static async signCredential (credential, issuer, key) {
    return new Promise((resolve, reject) => {
      const zencode = `
        Rule check version 1.0.0
        Scenario 'w3c' : sign
        Scenario 'ecdh' : keypair
        Given that I am '${issuer}'
        Given I have my 'keypair'
        Given I have a 'verifiable credential' named 'my-vc'
        Given I have a 'string' named 'PublicKeyUrl' inside '${issuer}'
        When I sign the verifiable credential named 'my-vc'
        When I set the verification method in 'my-vc' to 'PublicKeyUrl'
        Then print 'my-vc' as 'string'`
      const zkeys = key
      zkeys[issuer].PublicKeyUrl = 'https://apiroom.net/api/dyneorg/w3c-public-key'
      zexecute(zencode, { 'my-vc': credential }, zkeys)
        .then((result) => {
          resolve(result['my-vc'])
        })
        .catch((e) => {
          console.log(e)
          reject(e)
        })
    })
  }

  static async verifyCredential (credential, issuer, publicKey) {
    return new Promise((resolve, reject) => {
      const zencode = `
        Rule check version 1.0.0
        Scenario 'w3c' : verify w3c vc signature
        Scenario 'ecdh' : verify
        Given I have a 'public key' from '${issuer}'
        Given I have a 'verifiable credential' named 'my-vc'
        When I verify the verifiable credential named 'my-vc'
        Then print the string 'OK'`
      const keys = {}
      keys[issuer] = { public_key: publicKey }
      zexecute(zencode, { 'my-vc': credential }, keys)
        .then((result) => {
          resolve(result.output[0] === 'OK')
        })
        .catch((e) => {
          resolve(false)
        })
    })
  }
}
