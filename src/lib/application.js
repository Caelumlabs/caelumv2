'use strict'

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
      } else if (typeof type !== 'number') {
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
