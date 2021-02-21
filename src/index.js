'use strict'
require('dotenv').config()
const v = require('validator')
const User = require('./lib/user')
const Organization = require('./lib/organization')
const Application = require('./lib/application')
const BigchainDB = require('./utils/bigchaindb')
const Blockchain = require('./utils/substrate')
const driver = require('bigchaindb-driver')
const Crypto = require('./utils/crypto')

/**
 * Caelum main lin
 */
module.exports = class Caelum {
  /**
   * Constructor
   *
   * @param {string} url BigchainDB server API
   */
  constructor (storageUrl, governanceUrl) {
    if (!v.isURL(storageUrl) || v.isURL(governanceUrl)) {
      throw (new Error('Invalid URLs'))
    } else {
      this.storageUrl = storageUrl
      this.storage = new driver.Connection(storageUrl)
      this.governanceUrl = governanceUrl
      this.governance = new Blockchain(governanceUrl)
    }
  }

  /**
   * newOrganization. creates an organization Object
   *
   * @param {object} data Data can be a DID (string) or an object with {legalName and taxID}
   */
  async newOrganization (did = false, newKeys = false) {
    const organization = new Organization(this, did)
    if (newKeys) await organization.newKeys()
    return organization
    // return organization.setSubject(subject)
  }

  /**
   * newUser. creates a new User object
   */
  async newUser (importJson = false) {
    let connections = {}; let credentials = {}; const orgs = {}
    if (importJson !== false) {
      connections = importJson.connections
      credentials = importJson.credentials
      for (const did in connections) {
        orgs[did] = await this.loadOrganization(did)
      }
    }
    const user = new User(this, connections, credentials, orgs)
    return user
  }

  /**
   * newOrganization. creates an organization Object
   *
   * @param {object} data Data can be a DID (string) or an object with {legalName and taxID}
   */
  async importOrganization (data, password) {
    const organization = new Organization(this)
    await organization.import(data, password)
    return organization
  }

  /**
   * loadOrganization. Retrieves an organization
   *
   * @param {string} createTxId Transaction ID
   * @param {string} did DID
   */
  async loadOrganization (did) {
    const organization = new Organization(this, did)
    await organization.loadInformation()
    return organization
  }

  /**
   * Gets one certificate and it's owner
   *
   * @param {string} certificateId Certificate ID
   */
  async getCertificate (certificateId) {
    const cert = {
      txIds: {}
    }
    return new Promise((resolve, reject) => {
      // 1. Get transaction for the certificate
      BigchainDB.getTransaction(this.storage, certificateId)
        .then(txInfo => {
          if (txInfo.metadata.type !== 11) reject(new Error('not a certificate'))
          else {
            cert.subject = txInfo.metadata.subject
            cert.datetime = txInfo.metadata.datetime
            cert.txIds.nodeAppDocs = txInfo.asset.id
            cert.txIds.certificateId = txInfo.id
            // 2. Search the Apps Node
            return BigchainDB.searchMetadata(this.storage, cert.txIds.nodeAppDocs)
          }
        })
        .then(results => {
          // 3. Filter the App
          for (let i = 0; i < results.length; i++) {
            const certificates = results[i].metadata.subject.certificates || false
            if (certificates === cert.txIds.nodeAppDocs) {
              cert.txIds.appId = results[i].id
              return BigchainDB.getTransaction(this.storage, cert.txIds.appId)
            }
          }
        })
        .then(tx => {
          cert.txIds.didAppsId = tx.asset.id
          return BigchainDB.searchAsset(this.storage, cert.txIds.didAppsId)
        })
        .then(results => {
          for (let i = 0; i < results.length; i++) {
            const applications = results[i].data.applications || false
            if (applications === cert.txIds.didAppsId) {
              cert.did = results[i].data.did
              cert.createTxId = results[i].id
              resolve(cert)
            }
          }
          resolve(false)
        })
        .catch((e) => {
          console.log(e)
          resolve(false)
        })
    })
  }

  /**
   * Loads an app from BigchainDB.
   */
  loadApplication (createTxId) {
    return new Promise((resolve, reject) => {
      let app
      BigchainDB.getTransaction(this.storage, createTxId)
        .then(txInfo => {
          const app = new Application()
          return app.setSubject(txInfo.asset.data.name, txInfo.asset.data.type)
        }).then(result => {
          app = result
          app.createTxId = createTxId
          return this.storage.listTransactions(app.createTxId)
        })
        .then(transactions => {
          app.transactions = transactions
          resolve(app)
        })
    })
  }

  /**
   * Loads an app from BigchainDB.
   */
  search (s) {
    return new Promise((resolve, reject) => {
      BigchainDB.search(this.storage, s)
        .then(results => {
          resolve(results)
        })
    })
  }

  static loadCrypto () {
    return Crypto
  }
}
