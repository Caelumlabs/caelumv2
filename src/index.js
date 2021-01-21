'use strict'
require('dotenv').config()
const v = require('validator')
const Organization = require('./lib/organization')
const Application = require('./lib/application')
const DidDocument = require('./lib/diddoocument')
const BigchainDB = require('./utils/bigchaindb')
const driver = require('bigchaindb-driver')
// const axios = require('axios')
/**
 * Caelum main lin
 */
module.exports = class Caelum {
  /**
   * Constructor
   *
   * @param {string} url BigchainDB server API
   */
  constructor (url) {
    const validUrl = (process.env.DEV === 'true') ? true : v.isURL(url)
    if (validUrl) {
      this.bigcgaindbUrl = url
      this.conn = new driver.Connection(url)
    } else throw (new Error('Invalid URL ' + url))
  }

  /**
   * newOrganization. creates an organization Object
   *
   * @param {object} data Data can be a DID (string) or an object with {legalName and taxID}
   */
  async newOrganization (subject) {
    const organization = new Organization()
    return organization.setSubject(subject)
  }

  /**
   * saveOrganization. Save to BigchainDB the organization Object
   *
   * @param {object} org Data can be a DID (string) or an object with {legalName and taxID}
   */
  async saveOrganization (org) {
    return new Promise((resolve, reject) => {
      if (org instanceof Organization) {
        const data = {
          did: org.did,
          subject: org.subject,
          applications: []
        }
        for (let i = 0; i < org.applications.length; i++) {
          data.applications.push({
            createTxId: org.applications[i].createTxId,
            name: org.applications[i].subject.name
          })
        }
        BigchainDB.createApp(this.conn, org.keys, data)
          .then(txId => {
            org.createTxId = txId
            resolve(org)
          })
      } else {
        reject(new Error('org is not an Organization Class'))
      }
    })
  }

  /**
   * loadOrganization. Retrieves an organization
   *
   * @param {string} createTxId Transaction ID
   * @param {string} did DID
   */
  async loadOrganization (createTxId, did) {
    return new Promise((resolve, reject) => {
      let subject, applications, org
      BigchainDB.getTransaction(this.conn, createTxId)
        .then(txInfo => {
          if (txInfo) {
            if (did !== txInfo.asset.data.did) {
              reject(new Error('Transaction Id does not correspond to the DID'))
            } else {
              subject = txInfo.asset.data.subject
              applications = txInfo.asset.data.applications
              return this.newOrganization(subject, did)
            }
          } else {
            reject(new Error('Invalid txId ' + createTxId))
          }
        })
        .then(async (result) => {
          org = result
          org.createTxId = createTxId
          for (let i = 0; i < applications.length; i++) {
            const app = await this.loadApplication(applications[i].createTxId)
            org.addApplication(app)
          }
          resolve(org)
        })
        .catch(e => console.log(e))
    })
  }

  /**
   * Loads an app from BigchainDB.
   */
  loadApplication (createTxId) {
    return new Promise((resolve, reject) => {
      let app
      BigchainDB.getTransaction(this.conn, createTxId)
        .then(txInfo => {
          const app = new Application()
          return app.setSubject(txInfo.asset.data)
        }).then(result => {
          app = result
          app.createTxId = createTxId
          return this.conn.listTransactions(app.createTxId)
        })
        .then(transactions => {
          app.transactions = transactions
          resolve(app)
        })
    })
  }

  /**
   * Adds an app to one organization.
   *   - legalName : string
   *   - taxID : Valid taxId for the country
   *   - countryCode : isISO31661Alpha2 (valid countryCode, 'ES', 'FR',....)
   */
  saveApplication (org, appData) {
    return new Promise((resolve, reject) => {
      if (org instanceof Organization) {
        const app = new Application()
        app.setSubject(appData)
          .then(() => {
            return BigchainDB.createApp(this.conn, org.keys, appData)
          })
          .then(txId => {
            app.createTxId = txId
            org.addApplication(app)
            resolve(app)
          })
      } else {
        reject(new Error('org is not an Organization Class'))
      }
    })
  }

  /**
   * Adds a a didoc
   * @param {string} w3cDid DID following W3cStandard
   */
  newDidDoc (w3cDid) {
    // TODO: Check DID standard
    const doc = new DidDocument()
    doc.setSubject(w3cDid)
    return doc
  }

  /**
   * Loads an app from BigchainDB.
   */
  search (s) {
    return new Promise((resolve, reject) => {
      BigchainDB.search(this.conn, s)
        .then(results => {
          resolve(results)
        })
    })
  }

  /**
   * Get las non-spent App Doc
   * @param {Array} apps Applications for th eorg
   * @param {number} applicationCategory Category
   */
  getLastAppDoc (apps, applicationCategory) {
    return new Promise((resolve) => {
      const app = apps.find(item => item.subject.applicationCategory === applicationCategory)
      this.conn.listTransactions(app.createTxId)
        .then(transactions => {
          resolve(transactions[transactions.length - 1])
        })
    })
  }

  /**
   * Loads an app from BigchainDB.
   */
  addAppDoc (org, doc, updateOwner = false, applicationCategory) {
    let txCreated
    return new Promise((resolve, reject) => {
      this.getLastAppDoc(org.applications, applicationCategory)
        .then(result => {
          txCreated = result
          if (!txCreated) reject(new Error('Invalid txId'))
          else if (updateOwner !== false) return BigchainDB.getKeys(updateOwner)
          else resolve(org.keys)
        })
        .then(newOwner => {
          return BigchainDB.transferAsset(this.conn, txCreated, org.keys, doc, newOwner)
        })
        .then(tx => {
          console.log(tx)
          resolve(tx)
        })
    })
  }
}
