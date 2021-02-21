'use strict'
const axios = require('axios')

/**
 * User
 */
module.exports = class SDK {
  /**
   * Constructor. It creates a User object.
   */
  constructor (caelum, did, tokenApi, endpoint) {
    this.caelum = caelum
    this.did = did
    this.tokenApi = tokenApi
    this.endpoint = endpoint
  }

  /**
   * Get a list of users.
   */
  getUsers () {
    return new Promise((resolve, reject) => {
      console.log(this.endpoint + 'user', { headers: { Authorization: `Bearer ${this.tokenApi}` } })
      axios.get(this.endpoint + 'user', { headers: { Authorization: `Bearer ${this.tokenApi}` } })
        .then((result) => resolve(result.data))
        .catch(e => {
          console.log(e.status)
          resolve(false)
        })
    })
  }
}
