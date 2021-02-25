'use strict'
const axios = require('axios')

const methods = {
  user: {
    endpoint: 'user',
    methods: {
      add: { action: 'post', auth: true },
      issue: { action: 'post', submetohd: 'capacity', auth: true },
      getAll: { action: 'get', auth: true },
      getOne: { action: 'get', auth: true },
      delete: { action: 'delete', auth: true }
    }
  }
}

/**
 * User
 */
module.exports = class SDK {
  /**
   * Constructor. It creates a User object.
   */
  constructor (caelum, did, tokenApi, endpoint, capacity) {
    this.caelum = caelum
    this.did = did
    this.tokenApi = tokenApi
    this.endpoint = endpoint
    this.capacity = capacity
  }

  call (api, call, extra = {}) {
    let promise, endpoint
    return new Promise((resolve, reject) => {
      if (methods[api] && methods[api].methods[call]) {
        const method = methods[api].methods[call]
        // Call parameters
        const headers = method.auth ? { headers: { Authorization: `Bearer ${this.tokenApi}` } } : {}
        const params = extra.params || []
        const data = extra.data || {}

        // Build endpooint.
        endpoint = this.endpoint + methods[api].endpoint
        if (method.submetohd) endpoint += '/' + method.submetohd
        for (let i = 0; i < params.length; i++) endpoint += '/' + params[i]

        // API Method : GET, POST, PUT,  DELETE
        switch (method.action) {
          case 'get' :
            promise = axios.get(endpoint, headers)
            break
          case 'delete' :
            promise = axios.delete(endpoint, headers)
            break
          case 'post' :
            promise = axios.post(endpoint, data, headers)
            break
          case 'put':
            promise = axios.put(endpoint, data, headers)
            break
        }
        promise
          .then(res => resolve(res.data))
          .catch(e => {
            resolve(false)
          }
          )
      } else { resolve(false) }
    })
  }

  /**
   * Get One user.
   *
   * @param {number} userId User unique Id.
   * @return {object} User
   */
  getUser (userId) {
    return new Promise((resolve, reject) => {
      axios.get(this.endpoint + 'user/' + userId, { headers: { Authorization: `Bearer ${this.tokenApi}` } })
        .then(res => resolve(res.data)).catch(e => resolve(false))
    })
  }

  /**
   * Add a new user.
   *
   * @param {object} formData Form Data.
   */
  async addUser (formData) {
    return new Promise((resolve) => {
      axios.post(this.endpoint + 'user', formData, { headers: { Authorization: `Bearer ${this.tokenApi}` } })
        .then((result) => resolve(result.data))
    })
  }

  /**
   * Add a new Capacity for a user (only admin)
   *
   * @param {object} formData New Capacity ({userId, email, capacity, department, location, document, threshold})
   * @returns {boolean} Success or not
   */
  async addCapacity (formData) {
    return new Promise((resolve) => {
      formData.subject = formData.subject.capacity + ((formData.subject.subject !== '') ? ('-' + formData.subject.subject) : '')
      axios.post(this.endpoint + 'user/capacity', formData, { headers: { Authorization: `Bearer ${this.tokenApi}` } })
        .then((result) => resolve(result.data))
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
