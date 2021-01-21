'use strict'
// const v = require('validator')
// const bip39 = require('bip39')
// const driver = require('bigchaindb-driver')

const CATEGORIES = [
  'NONE',
  'APP',
  'CERTIFICATE',
  'INTEGRITY',
  'VERIFIED',
  'APPLICATION'
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
  setSubject (subject) {
    return new Promise((resolve, reject) => {
      if (typeof subject !== 'object') {
        reject(new Error('Invalid subject'))
      } else if (typeof subject.name !== 'string' || subject.name.length === 0) {
        reject(new Error('Invalid Application Name'))
      } else if (typeof subject.applicationCategory !== 'number' || !CATEGORIES[subject.applicationCategory]) {
        reject(new Error('Invalid Application Category'))
      } else if (typeof subject.version !== 'number' && subject.version < 1) {
        reject(new Error('Invalid Application Category'))
      } else {
        this.subject = {}
        this.subject.name = subject.name
        this.subject.version = subject.version
        this.subject.applicationCategory = subject.applicationCategory
        resolve(this)
      }
    })
  }
}
