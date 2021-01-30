'use strict'
// const v = require('validator')
// const bip39 = require('bip39')
// const driver = require('bigchaindb-driver')

const CATEGORIES = [
  'NONE',
  'APPS',
  'DIDINFO',
  'DIDDOC',
  'VC',
  'INTEGRITY',
  'DIDREF'
]

/**
 * Schema.org: SoftwareApplication.
 * URL : https://schema.org/SoftwareApplication
 */
module.exports = class Application {
  constructor () {
    this.createTxId = false
  }

  /**
   * Constructor. It creates an Application object.
   * subject will expect one field
   *   - name : string
   *
   * @param {oject} subject App information.
   */
  setSubject (name, type) {
    return new Promise((resolve, reject) => {
      if (typeof name !== 'string' || name.length === 0) {
        reject(new Error('Invalid Application Name'))
      } else if (typeof type !== 'number' || !CATEGORIES[type]) {
        reject(new Error('Invalid Application Type'))
      } else {
        this.subject = {
          name: name,
          type: type
        }
        resolve(this)
      }
    })
  }
}
