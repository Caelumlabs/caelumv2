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
  async newOrganization () {
    const organization = new Organization(this)
    return organization
    // return organization.setSubject(subject)
  }

  /**
   * loadOrganization. Retrieves an organization
   *
   * @param {string} createTxId Transaction ID
   * @param {string} did DID
   */
  async loadOrganization (createTxId, did) {
    return new Promise((resolve, reject) => {
      let org
      BigchainDB.getTransaction(this.conn, createTxId)
        .then(async txInfo => {
          if (!txInfo) reject(new Error('Invalid txId ' + createTxId))
          else if (did !== txInfo.asset.data.did) reject(new Error('Transaction Id does not correspond to the DID'))
          else if (txInfo.asset.data.type !== 2) reject(new Error('This is not an organization'))
          else {
            org = new Organization(this, createTxId, did)
            await org.loadInformation()
            await org.loadDidDocument(txInfo.asset.data.diddocument)
            await org.loadApplications(txInfo.asset.data.applications)
            org.nodes.verified = txInfo.asset.data.verified
          }
          resolve(org)
        })
        .catch(e => reject(e))
    })
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
      BigchainDB.getTransaction(this.conn, certificateId)
        .then(txInfo => {
          if (txInfo.metadata.type !== 5) reject(new Error('not a certificate'))
          else {
            cert.subject = txInfo.metadata.subject
            cert.datetime = txInfo.metadata.datetime
            cert.txIds.nodeAppDocs = txInfo.asset.id
            cert.txIds.certificateId = txInfo.id
            // 2. Search the Apps Node
            return BigchainDB.searchMetadata(this.conn, cert.txIds.nodeAppDocs)
          }
        })
        .then(results => {
          // 3. Filter the App
          for (let i = 0; i < results.length; i++) {
            const certificates = results[i].metadata.subject.certificates || false
            if (certificates === cert.txIds.nodeAppDocs) {
              cert.txIds.appId = results[i].id
              return BigchainDB.getTransaction(this.conn, cert.txIds.appId)
            }
          }
        })
        .then(tx => {
          cert.txIds.didAppsId = tx.asset.id
          return BigchainDB.searchAsset(this.conn, cert.txIds.didAppsId)
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
      BigchainDB.getTransaction(this.conn, createTxId)
        .then(txInfo => {
          const app = new Application()
          return app.setSubject(txInfo.asset.data.name, txInfo.asset.data.type)
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
   * Get the Keys for a mnemonic
   *
   * @param {string} mnemonic Seed. If false will create a new pair of keys.
   */
  getKeys (mnemonic = false) {
    return new Promise((resolve, reject) => {
      BigchainDB.getKeys(mnemonic)
        .then(result => { resolve(result) })
        .catch((e) => { reject(e) })
    })
  }
}
