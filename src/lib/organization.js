'use strict'
const v = require('validator')
const countries = require('../utils/countries')
const BigchainDB = require('../utils/bigchaindb')
const Application = require('./application')

/**
 * Schema.org: Organization.
 * URL https://schema.org/Organization
 */
module.exports = class Organization {
  /**
   * Constructor. It creates an Organization object.
   */
  constructor () {
    this.applications = []
    this.did = false
    this.createTxId = false
  }

  /**
   *Sets the Subject of the Organization
   * subject will expect three fields
   *   - legalName : string
   *   - taxID : Valid taxId for the country
   *   - countryCode : isISO31661Alpha2 (valid countryCode, 'ES', 'FR',....)
   */
  setSubject (subject, did = false) {
    return new Promise((resolve, reject) => {
      if (typeof subject !== 'object') {
        reject(new Error('Invalid subject'))
      } else if (typeof subject.legalName !== 'string' || subject.legalName.length === 0) {
        reject(new Error('Invalid legalName'))
      } else if (typeof subject.network !== 'string' || subject.network.length === 0) {
        reject(new Error('Invalid Network'))
      } else if (typeof subject.countryCode !== 'string' || !v.isISO31661Alpha2(subject.countryCode)) {
        reject(new Error('Invalid countryCode'))
      } else if (typeof countries[subject.countryCode] !== 'object') {
        reject(new Error('Unknown countryCode'))
      } else if (subject.taxID.length === 0 || countries[subject.countryCode].isTaxID(subject.taxID) === false) {
        reject(new Error('Invalid taxID'))
      } else {
        this.subject = {
          legalName: subject.legalName,
          taxID: subject.taxID,
          countryCode: subject.countryCode,
          network: subject.network
        }
        if (did !== false) {
          this.did = did
          resolve(this)
        } else {
          BigchainDB.getKeys(this.subject)
            .then(result => {
              this.did = result.publicKey
              resolve(this)
            })
            .catch((e) => {
              reject(e)
            })
        }
      }
    })
  }

  /**
   * Add an application to the list of applications
   * @param {Application} app Application Object
   */
  addApplication (app) {
    if (app instanceof Application) {
      this.applications.push(app)
    }
  }

  /**
   * Set the keys for this organization
   *
   * @param {string} mnemonic Seed. If false will create a new pair of keys.
   */
  setKeys (mnemonic = false) {
    return new Promise((resolve, reject) => {
      BigchainDB.getKeys(mnemonic)
        .then(result => {
          this.keys = result
          resolve(this.keys)
        })
        .catch((e) => {
          reject(e)
        })
    })
  }
}
