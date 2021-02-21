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
      axios.get(this.endpoint + 'user', { headers: { Authorization: `Bearer ${this.tokenApi}` } })
        .then(res => resolve(res.data)).catch(e => resolve(false))
    })
  }

  /**
   * Get a list of users.
   */
  getParameters () {
    return new Promise((resolve, reject) => {
      axios.get(this.endpoint + 'parameter', { headers: { Authorization: `Bearer ${this.tokenApi}` } })
        .then(res => resolve(res.data)).catch(e => resolve(false))
    })
  }
}
