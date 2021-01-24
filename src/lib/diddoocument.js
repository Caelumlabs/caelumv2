'use strict'
// const v = require('validator')
// const bip39 = require('bip39')
// const driver = require('bigchaindb-driver')

/**
 * W3C: DidDocument.
 * URL : https://www.w3.org/TR/did-core/
 */
module.exports = class DidDocument {
  /**
   * Set subject
   *
   * @param {string} did DID
   */
  setSubject (did) {
    return new Promise((resolve, reject) => {
      this.subject = {
        '@context': 'https://www.w3.org/ns/did/v1',
        did: did
      }
    })
  }

  /**
   * Add a service to the diddoc
   *
   * @param {string} id Identifier for the DID
   * @param {*} type Type of Service
   * @param {*} serviceEndpoint Service endpoint
   */
  addService (id, type, serviceEndpoint) {
    if (!this.services) {
      this.services = []
    }
    this.services.push({
      id: this.subject.did + '#' + id,
      type,
      serviceEndpoint
    })
    this.subject.service = JSON.stringify(this.services)
  }
}
