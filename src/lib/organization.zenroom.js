'use strict'
// const countries = require('../utils/countries')
// const Storage = require('../utils/arweave')
const Blockchain = require('../utils/substrate')
const W3C = require('../utils/zenroom')
const Crypto = require('../utils/crypto')
// const Application = require('./application')
// const Achievement = require('./achievement')
// const Location = require('./location')
// const SDK = require('./sdk')
// const axios = require('axios')

/**
 * Schema.org: Organization.
 * URL https://schema.org/Organization
 */
module.exports = class Organization {
  /**
   * Constructor. It creates an Organization object.
   */
  constructor (caelum) {
    this.caelum = caelum
  }

  /**
   * Set new keys. Creates three keys: governance, storage and w3c
   */
  async newKeys () {
    this.keys = {}
    this.keys.governance = await Blockchain.newKeys()
    this.did = this.keys.governance.address
    this.keys.storage = await this.caelum.storage.newKeys()
    this.keys.w3c = await W3C.newKeys(this.did)
  }

  /*
   * newAuthorisedCapability
   * Creates a new Credential of type AuthorisedCapability
   *
   */
  newAuthorisedCapability (holder, id, type, location, sphere, validFrom, validTo) {
    const subject = {
      id: 'did:caelum:' + this.did + '#issued-' + (id || 0),
      capability: {
        type: type || 'member',
        sphere: (['over18', 'oidc'].includes(type) ? 'personal' : 'professional')
      }
    }
    if (location) subject.capability.location = location
    const credential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://caelumapp.com/context/v1'
      ],
      id: 'did:caelum:' + this.did + '#issued',
      type: ['VerifiableCredential', 'AuthorisedCapability'],
      issuer: 'did:caelum:' + this.did,
      holder: holder,
      issuanceDate: new Date().toISOString(),
      credentialSubject: subject
    }
    return credential
  }

  /**
   * Sign a credential
   *
   * @param {object} credential The Verifiable credential
   */
  async signCredential (credential) {
    const result = await W3C.signCredential(credential, this.did, this.keys.w3c)
    return result
  }

  /**
   * Verify a credential
   *
   * @param {object} credential The signed Verifiable credential
   */
  async verifyCredential (credential) {
    return W3C.verifyCredential(credential, this.did, this.keys.w3c[this.did].keypair.public_key)
  }

  async export (password) {
    const keys = Crypto.encryptObj(password, this.keys)
    const json = JSON.stringify({ did: this.did, keys: keys })
    return json
  }

  async import (data, password) {
    this.did = data.did
    this.keys = Crypto.decryptObj(password, data.keys)
  }
}
