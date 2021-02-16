'use strict'
const axios = require('axios')
const FormData = require('form-data')

/**
 * Schema.org: Organization.
 * URL https://schema.org/Organization
 */
module.exports = class Workflow {
  /**
   * Constructor. It creates an Organization object.
   */
  constructor (org, workflowId, stateId, partyId, actionId) {
    this.org = org
    this.params = {}
    this.workflow = {
      workflowId: workflowId,
      stateId: stateId,
      partyId: partyId,
      actionId: actionId,
      apiToken: ''
    }
  }

  /**
   * Sets the Token
   *
   * @param {string} token Token
   */
  setToken (token) { this.workflow.apiToken = token }

  /**
   * Sets the Token
   *
   * @param {number} actionId Action ID
   */
  setAction (actionId) {
    this.workflow.actionId = actionId
  }

  /**
   * Sets a Person as a parameter.
   *
   * @param {srting} token Token
   */
  addPerson (name, subject) {
    if (!this.params[this.workflow.actionId]) this.params[this.workflow.actionId] = {}
    for (const field in subject) {
      this.params[this.workflow.actionId][name + '_' + field] = subject[field]
    }
  }

  /**
   * Sets a Json as a parameter.
   *
   * @param {srting} token Token
  */
  addJson (name, subject) {
    if (!this.params[this.workflow.actionId]) this.params[this.workflow.actionId] = {}
    for (const field in subject) {
      this.params[this.workflow.actionId][name + '_' + field] = subject[field]
    }
  }

  upload (fileData, filePath, contentType) {
    return new Promise(resolve => {
      const form = new FormData()
      form.append('file', fileData, { filepath: filePath, contentType: contentType })
      console.log(this.workflow)
      form.append('workflow', JSON.stringify(this.workflow))
      axios.post(this.org.endpoint + 'workflow/upload', form, { headers: form.getHeaders() })
        .then(result => {
          console.log(result.data)
          resolve(result.data.stateId)
        })
        .catch((e) => {
          resolve(0)
        })
    })
  }

  /**
   * Calls a Workflow. SET.
   *
   * @param {srting} token Token
   */
  set () {
    return new Promise(resolve => {
      const workflowPost = { ...this.workflow, ...this.params[this.workflow.actionId] }
      console.log(workflowPost)
      axios.post(this.org.endpoint + 'workflow/set', workflowPost)
        .then(result => {
          this.workflow.stateId = result.data.stateId
          resolve(result.data.stateId !== 0)
        })
        .catch(() => resolve(0))
    })
  }
}
