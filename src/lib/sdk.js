'use strict'
const axios = require('axios')

const methods = {
  parameter: {
    endpoint: 'parameter',
    methods: {
      getAll: { action: 'get', auth: true }
    }
  },
  auth: {
    endpoint: 'auth',
    methods: {
      notifications: { action: 'get', submethod: 'notifications', auth: true }
    }
  },
  user: {
    endpoint: 'user',
    methods: {
      add: { action: 'post', auth: true },
      issue: { action: 'post', submethod: 'capacity', auth: true },
      getAll: { action: 'get', auth: true },
      getOne: { action: 'get', auth: true },
      delete: { action: 'delete', auth: true }
    }
  },
  tag: {
    endpoint: 'tags',
    methods: {
      add: { action: 'post', auth: true },
      issue: { action: 'put', auth: true },
      getAll: { action: 'get', auth: true },
      getOne: { action: 'get', auth: true },
      getIssued: { action: 'get', submethod: 'issued', auth: true },
      revoke: { action: 'delete', submethod: 'issued', auth: true }
    }
  },
  api: {
    endpoint: 'api',
    methods: {
      add: { action: 'post', auth: true },
      update: { action: 'put', auth: true },
      getOne: { action: 'get', auth: true },
      getAll: { action: 'get', auth: true }
    }
  },
  ide: {
    endpoint: 'ide',
    methods: {
      addProject: { action: 'post', submethod: 'project', auth: true },
      getOneProject: { action: 'get', submethod: 'project', auth: true },
      getAllProjects: { action: 'get', submethod: 'project', auth: true },
      updateProject: { action: 'put', submethod: 'project', auth: true },
      deleteProject: { action: 'delete', submethod: 'project', auth: true },
      addWorkflow: { action: 'post', submethod: 'workflow', auth: true },
      getOneWorkflow: { action: 'get', submethod: 'workflow', auth: true },
      getAllWorkflows: { action: 'get', submethod: 'workflow', auth: true },
      updateWorkflow: { action: 'put', submethod: 'workflow', auth: true },
      deleteWorkflow: { action: 'delete', submethod: 'workflow', auth: true },
      saveDraft: { action: 'put', submethod: 'workflow/draft', auth: true },
      deploy: { action: 'put', submethod: 'workflow/deploy', auth: true },
      states: { action: 'get', submethod: 'workflow/states', auth: true }
    }
  },
  workflow: {
    endpoint: 'workflow',
    methods: {
      set: { action: 'post', submethod: 'set', auth: false },
      upload: { action: 'form', submethod: 'upload', auth: false },
      download: { action: 'get', submethod: 'download', auth: false },
      approve: { action: 'post', submethod: 'approve', auth: false }
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
        const form = extra.form || {}

        // Build endpooint.
        endpoint = this.endpoint + methods[api].endpoint
        if (method.submethod) endpoint += '/' + method.submethod
        for (let i = 0; i < params.length; i++) endpoint += '/' + params[i]
        // console.log(method.action + ' ' + endpoint)
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
          case 'form':
            promise = axios.post(endpoint, form, { headers: form.getHeaders() })
            break
        }
        promise
          .then(res => resolve(res.data))
          .catch(e => {
            console.log('Axios failed', e.status)
            resolve(false)
          })
      } else {
        console.log('Error')
        resolve(false)
      }
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
