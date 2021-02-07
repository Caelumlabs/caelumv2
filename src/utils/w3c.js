const { extendContextLoader } = require('jsonld-signatures')
const vc = require('vc-js')
const { defaultDocumentLoader } = vc
const { Ed25519KeyPair, suites: { Ed25519Signature2018 } } = require('jsonld-signatures')
const { LDKeyPair } = require('jsonld-signatures')
const myCustomContext = require('./caelum_context')
const didDoc = require('./diddoc')

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
    const keyPair = await Ed25519KeyPair.generate({
      id: 'did:caelum:' + did + '#key-1',
      controller: 'did:caelum:' + did
    })
    return keyPair
  }

  /**
   * New Blockchain KeyPair.
   *
   * @returns {object} Key pair
   */
  static async getKeys (keys) {
    const keyPair = await LDKeyPair.from(keys)
    return keyPair
  }

  static async signCredential (subject, issuer, keys, didDocument) {
    const documentLoader = W3C.loadCustomContext(didDocument)
    const keyPair = await LDKeyPair.from(keys)
    const suite = new Ed25519Signature2018({
      verificationMethod: 'did:caelum:' + issuer + '#key-1',
      key: keyPair
    })
    const credential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://web.tabit.caelumapp.com/context/v1'
      ],
      type: ['VerifiableCredential', 'Did'],
      issuer: 'did:caelum:' + issuer,
      issuanceDate: new Date().toISOString(),
      credentialSubject: subject
    }
    const signedVC = await vc.issue({ credential, suite, documentLoader })
    return signedVC
  }

  static async signMember (issuer, holder, capacity, keys, didDocument) {
    const documentLoader = W3C.loadCustomContext(didDocument)
    const keyPair = await LDKeyPair.from(keys)
    const suite = new Ed25519Signature2018({
      verificationMethod: 'did:caelum:' + issuer + '#key-1',
      key: keyPair
    })
    const credential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://web.tabit.caelumapp.com/context/v1'
      ],
      type: ['VerifiableCredential', 'Member'],
      issuer: 'did:caelum:' + issuer,
      holder: holder,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        capacity: capacity
      }
    }
    const signedVC = await vc.issue({ credential, suite, documentLoader })
    return signedVC
  }

  static async verifyCredential (verifiableCredential, issuer, keys, didDocument) {
    const documentLoader = W3C.loadCustomContext(didDocument)
    const keyPair = await LDKeyPair.from(keys)
    const suite = new Ed25519Signature2018({
      verificationMethod: 'did:caelum:' + issuer + '#key-1',
      key: keyPair
    })
    const result = await vc.verifyCredential({
      credential: verifiableCredential,
      suite,
      documentLoader
    })
    // if (!result.verified) console.log(result.error.errors[0])
    return result
  }

  static loadCustomContext (didDocument) {
    const documentLoader = extendContextLoader(async url => {
      if (url === 'https://w3c-ccg.github.io/did-spec/contexts/did-v0.11.jsonld') {
        return {
          contextUrl: null,
          documentUrl: url,
          document: didDoc
        }
      } else if (url === 'https://web.tabit.caelumapp.com/context/v1') {
        return {
          contextUrl: null,
          documentUrl: url,
          document: myCustomContext
        }
      } else if (url.substring(0, 11) === 'did:caelum:') {
        // console.log("****************** DIDDOC", didDocument)
        return {
          contextUrl: null,
          documentUrl: url,
          document: didDocument
        }
      }
      return defaultDocumentLoader(url)
    })
    return documentLoader
  }
}
