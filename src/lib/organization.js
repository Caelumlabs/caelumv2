'use strict'
const v = require('validator')
const countries = require('../utils/countries')
const BigchainDB = require('../utils/bigchaindb')
const Application = require('./application')
const Achievement = require('./achievement')
const Location = require('./location')

const TX_DID = 1
const TX_INFO = 2
const TX_DIDDOC_LIST = 3
const TX_DIDDOC = 4
const TX_VERIFIED_LIST = 5
const TX_VERIFIED = 6
const TX_APP_LIST = 7
const TX_APP = 8
const TX_TAGS = 9
const TX_ISSUED = 10
const TX_TAG_TYPE = 11
const TX_INTEGRITY = 12
const TX_HASH = 13
// const TX_PRODUCT = 14
// const TX_PROVENANCE = 15

/**
 * Schema.org: Organization.
 * URL https://schema.org/Organization
 */
module.exports = class Organization {
  /**
   * Constructor. It creates an Organization object.
   */
  constructor (caelum, createTxId = false, did = false) {
    this.nodes = {}
    this.did = did
    this.createTxId = createTxId
    this.caelum = caelum
    this.applications = []
    this.certificates = []
  }

  /**
   * Adds an app to one organization.
   *
   * @param {srting} apptype Application TYpe
   */
  addApplication (apptype) {
    return new Promise((resolve, reject) => {
      let subject
      switch (apptype) {
        case 'diddocument' :
          subject = { name: 'Did Document', type: TX_DIDDOC_LIST }
          break
        case 'verified' :
          subject = { name: 'Verified DIDs', type: TX_VERIFIED_LIST }
          break
        case 'applications' :
          subject = { name: 'Applications', type: TX_APP_LIST }
          break
        default: reject(new Error('Invalid app type'))
      }
      const app = new Application()
      app.setSubject(subject.name, subject.type)
        .then(() => {
          return BigchainDB.createApp(this.caelum.conn, this.keys, { name: subject.name, type: subject.type })
        })
        .then(txId => {
          app.createTxId = txId
          this.nodes[apptype] = txId
          resolve(app)
        })
    })
  }

  /**
   * saveOrganization. Save to BigchainDB the organization Object
   */
  saveOrganization (legalName, taxID, countryCode, network) {
    return new Promise((resolve) => {
      const data = {
        did: this.keys.publicKey,
        type: TX_DID,
        diddocument: this.nodes.diddocument,
        verified: this.nodes.verified,
        applications: this.nodes.applications,
        legalName,
        taxID,
        countryCode,
        network
      }
      BigchainDB.createApp(this.caelum.conn, this.keys, data)
        .then(txId => {
          this.did = this.keys.publicKey
          this.createTxId = txId
          resolve(this.did)
        })
    })
  }

  /**
   * Save Information : Verifiable Credential
   */
  loadInformation () {
    return new Promise((resolve) => {
      let asset
      BigchainDB.getTransaction(this.caelum.conn, this.createTxId)
        .then(tx => {
          asset = tx.asset.data
          this.setSubject({
            legalName: asset.legalName,
            taxID: asset.taxID,
            countryCode: asset.countryCode,
            network: asset.network
          })
          return BigchainDB.getLastTransaction(this.caelum.conn, this.createTxId)
        })
        .then(tx => {
          if (tx.operation === 'TRANSFER') {
            this.setInformation(tx.metadata.subject)
          }
          resolve()
        })
    })
  }

  /**
   * Save Information : Verifiable Credential
   */
  saveInformation (subject, pub = false) {
    return new Promise((resolve) => {
      BigchainDB.getLastTransaction(this.caelum.conn, this.createTxId)
        .then(lastTx => {
          // TODO: Check is a valid public Key
          const publicKey = ((pub === false) ? this.keys.publicKey : pub)
          if (subject.location) subject.location = JSON.stringify(subject.location)
          return BigchainDB.transferAsset(this.caelum.conn, lastTx, this.keys, TX_INFO, subject, publicKey)
        })
        .then((tx) => {
          resolve(tx)
        })
    })
  }

  /**
   * Set addres : Verifiable Credential
   * @param {object} subject VC location
   */
  setAddress (subject) {
    return new Promise((resolve, reject) => {
      const location = new Location()
      if (typeof subject !== 'object') {
        reject(new Error('Invalid subject'))
      } else if (typeof subject.streetAddress !== 'string' || subject.streetAddress.length === 0) {
        reject(new Error('Invalid street Address'))
      } else if (typeof subject.addressLocality !== 'string' || subject.addressLocality.length === 0) {
        reject(new Error('Invalid City'))
      } else if (typeof subject.postalCode !== 'string' || subject.postalCode.length === 0) {
        reject(new Error('Invalid Postal Code'))
      } else if (typeof subject.addressRegion !== 'string' || subject.addressRegion.length === 0) {
        reject(new Error('Invalid Region'))
      } else if (typeof subject.addressCountry !== 'string' || subject.addressCountry.length === 0) {
        reject(new Error('Invalid Country'))
      } else {
        location.streetAddress(subject.streetAddress)
        location.addressLocality(subject.addressLocality)
        location.postalCode(subject.postalCode)
        location.addressRegion(subject.addressRegion)
        location.addressCountry(subject.addressCountry)
        this.subject.location = location.subject
        resolve()
      }
    })
  }

  /**
   * Save Information : Verifiable Credential
   * @param {string} diddocumentTxId VC credential
   */
  loadDidDocument (diddocumentTxId) {
    this.nodes.diddocument = diddocumentTxId
    return new Promise((resolve) => {
      BigchainDB.getLastTransaction(this.caelum.conn, this.nodes.diddocument)
        .then(tx => {
          if (tx.operation === 'TRANSFER') {
            this.lastDidDocument = (tx.metadata.type === TX_DIDDOC) ? tx.metadata.subject : {}
            this.lastDidDocument.service = JSON.parse(this.lastDidDocument.service)
          } else this.lastDidDocument = {}
          resolve()
        })
    })
  }

  /**
   * Save Information : Verifiable Credential
   * @param {object} subject VC credential
   */
  saveDidDocument (subject, pub = false) {
    return new Promise((resolve) => {
      BigchainDB.getLastTransaction(this.caelum.conn, this.nodes.diddocument)
        .then(lastTx => {
          // TODO: Check is a valid public Key
          const publicKey = ((pub === false) ? this.keys.publicKey : pub)
          return BigchainDB.transferAsset(this.caelum.conn, lastTx, this.keys, TX_DIDDOC, subject, publicKey)
        })
        .then((tx) => {
          resolve(tx)
        })
    })
  }

  /**
   * Save Information : Verifiable Credential
   * @param {object} subject VC credential
   */
  saveVerified (did, pub = false) {
    return new Promise((resolve) => {
      BigchainDB.getLastTransaction(this.caelum.conn, this.nodes.verified)
        .then(lastTx => {
          // TODO: Check is a valid public Key
          const publicKey = ((pub === false) ? this.keys.publicKey : pub)
          return BigchainDB.transferAsset(this.caelum.conn, lastTx, this.keys, TX_VERIFIED, { did }, publicKey)
        })
        .then((tx) => {
          resolve(tx)
        })
    })
  }

  /**
   * Save Information : Verifiable Credential
   * @param {string} diddocumentTxId VC credential
   */
  loadApplications (applicationsTxId) {
    this.nodes.applications = applicationsTxId
    return new Promise((resolve) => {
      BigchainDB.listTransactions(this.caelum.conn, applicationsTxId)
        .then(tx => {
          for (let i = 0; i < tx.length; i++) {
            if (tx[i].operation === 'TRANSFER') {
              this.applications.push({
                createTxId: tx[i].id,
                date: tx[i].metadata.datetime,
                type: tx[i].metadata.type,
                subject: tx[i].metadata.subject
              })
            }
          }
          resolve()
        })
    })
  }

  /**
   * Sets the Subject of the Organization
   * subject will expect three fields
   *   - legalName : string
   *   - taxID : Valid taxId for the country (if network!= tabit)
   *   - countryCode : isISO31661Alpha2 (valid countryCode, 'ES', 'FR',....)
   */
  setSubject (subject, did = false) {
    return new Promise((resolve, reject) => {
      if (typeof subject !== 'object') {
        reject(new Error('Invalid subject'))
      } else if (typeof subject.legalName !== 'string' || subject.legalName.length === 0) {
        reject(new Error('Invalid legalName'))
      } else if (typeof subject.network !== 'string' || subject.network.length === 0) {
        reject(new Error('Invalid Network'))
      } else if (typeof subject.countryCode !== 'string' || !v.isISO31661Alpha2(subject.countryCode)) {
        reject(new Error('Invalid countryCode'))
      } else if (typeof countries[subject.countryCode] !== 'object') {
        reject(new Error('Unknown countryCode'))
      } else if (subject.network !== 'tabit' && (subject.taxID.length === 0 || countries[subject.countryCode].isTaxID(subject.taxID) === false)) {
        reject(new Error('Invalid taxID'))
      } else {
        this.subject = {
          legalName: subject.legalName,
          taxID: subject.taxID,
          countryCode: subject.countryCode,
          network: subject.network
        }
        if (subject.location) this.subject.location = JSON.parse(subject.location)
        resolve()
      }
    })
  }

  /**
   * Sets the Information of the Organization
  */
  setInformation (subject) {
    return new Promise((resolve, reject) => {
      if (typeof subject !== 'object') {
        reject(new Error('Invalid subject'))
      } else {
        this.subject.information = subject
        if (subject.location) this.subject.information.location = JSON.parse(subject.location)
        resolve()
      }
    })
  }

  /**
   * Get certificates insisde the org tree (owned)
   * @param {object} subject Subject of the certificate
   */
  async loadCertificates () {
    const certApp = this.applications.find(item => item.type === TX_TAGS)
    if (!certApp) return (false)
    else {
      const certificates = await BigchainDB.listTransactions(this.caelum.conn, certApp.subject.certificates)
      for (let i = 0; i < certificates.length; i++) {
        if (certificates[i].operation === 'TRANSFER' &&
          certificates[i].metadata.type === TX_TAG_TYPE &&
          certificates[i].metadata.subject) {
          this.certificates.push({
            certificateId: certificates[i].id,
            appId: certificates[i].asset.id,
            subject: certificates[i].metadata.subject
          })
        }
      }
    }
  }

  /**
   * Get certificates outside the org tree (issued)
   * @param {object} subject Subject of the certificate
   */
  async searchCertificates () {
    return new Promise((resolve, reject) => {
      const certificates = []
      const loadedCertificates = []
      BigchainDB.searchMetadata(this.caelum.conn, this.did)
        .then(async results => {
          for (let i = 0; i < results.length; i++) {
            const metadata = results[i].metadata
            if ((metadata.type && metadata.type === TX_ISSUED) && (metadata.subject && metadata.subject.did === this.did)) {
              const issued = results[i].metadata.subject
              if (['issued', 'revoked'].includes(issued.status)) {
                let certificate = loadedCertificates.find(item => item.txIds.certificateId === issued.certificateId)
                if (certificate) {
                  const inIssued = certificates.find(item => item.certificateId === issued.certificateId)
                  inIssued.status = issued.status
                } else {
                  certificate = await this.caelum.getCertificate(issued.certificateId)
                  loadedCertificates.push(certificate)
                  issued.certificate = certificate
                  // From our accepted list, get the last status
                  const accepted = await this.getIssuedCertificates(issued.certificateId, false)
                  issued.accepted = (accepted.length > 0) ? accepted[accepted.length - 1].subject.status : 'not_accepted'
                  certificates.push(issued)
                }
              }
            }
          }
          resolve(certificates)
        })
        .catch(e => console.log(e))
    })
  }

  /**
   * Get one certificate plus certificates and issued
   * @param {string} issuedId certtificate ID
   */
  async getIssuedCertificate (issuedId) {
    const issued = await BigchainDB.getTransaction(this.caelum.conn, issuedId)
    return issued
  }

  /**
   * Add a certificate App to the hashlist
   */
  async addCertificateApp (pub = false) {
    // Create twho nodes for the App certificates : certifivates (VC) and issued (DIDs)
    const issuedTxId = await BigchainDB.createApp(this.caelum.conn, this.keys, { name: 'Issued', type: TX_APP })
    const acceptedTxId = await BigchainDB.createApp(this.caelum.conn, this.keys, { name: 'Accepted', type: TX_APP })
    const certsTxId = await BigchainDB.createApp(this.caelum.conn, this.keys, { name: 'Certificates', type: TX_APP })
    // Add a new application to the app list
    const lastTx = await BigchainDB.getLastTransaction(this.caelum.conn, this.nodes.applications)
    const metadata = { name: 'Certificates', certificates: certsTxId, issued: issuedTxId, accepted: acceptedTxId }
    const publicKey = ((pub === false) ? this.keys.publicKey : pub)
    const txId = await BigchainDB.transferAsset(this.caelum.conn, lastTx, this.keys, TX_TAGS, metadata, publicKey)
    const app = { createTxId: txId, type: TX_TAGS, subject: metadata }
    this.applications.push(app)
    return app
  }

  /**
   * Add a certticate to the org
   * @param {object} subject Subject of the certificate
   */
  async addCertificate (subject) {
    const achievement = new Achievement(subject)
    let certApp = this.certificates.find(item => item.type === TX_TAGS)
    if (!certApp) {
      certApp = await this.addCertificateApp()
    }
    const certsTxId = certApp.subject.certificates
    const lastAppTx = await BigchainDB.getLastTransaction(this.caelum.conn, certsTxId)
    return await BigchainDB.transferAsset(this.caelum.conn, lastAppTx, this.keys, TX_TAG_TYPE, achievement.subject, this.keys.publicKey)
  }

  /**
   * Issue a certificate
   * @param {object} subject Subject of the certificate
   */
  async issueCertificate (certificateId, did, issued = true) {
    // Get Tags App and cert
    const certApp = this.applications.find(item => item.type === TX_TAGS)
    const certInfo = this.certificates.find(item => item.certificateId === certificateId)
    if (!certApp) throw (new Error('No Tags App found '))
    else if (!certInfo) throw (new Error('No certificate found with certificateId ' + certificateId))
    else {
      const lastTx = await BigchainDB.getLastTransaction(this.caelum.conn, certApp.subject.issued)
      const status = (issued ? 'issued' : 'revoked')
      return await BigchainDB.transferAsset(this.caelum.conn, lastTx, this.keys, TX_ISSUED, { certificateId, did, status }, this.keys.publicKey)
    }
  }

  /**
   * accept a certificate
   * @param {object} subject Subject of the certificate
   */
  async acceptCertificate (certificateId, did, accepted = true) {
    // Get Tags App. ADd one if this is the first time.
    let certApp = this.applications.find(item => item.type === TX_TAGS)
    if (!certApp) {
      await this.addCertificateApp()
      certApp = this.applications[0]
    }
    const lastTx = await BigchainDB.getLastTransaction(this.caelum.conn, certApp.subject.accepted)
    const status = (accepted ? 'accepted' : 'not_accepted')
    await BigchainDB.transferAsset(this.caelum.conn, lastTx, this.keys, TX_ISSUED, { certificateId, did, status }, this.keys.publicKey)
  }

  /**
   * Get one certificate plus certificates and issued
   * @param {string} certificateId certtificate ID
   */
  async getIssuedCertificates (certificateId, issuedCerts = true) {
    const certificatesIssued = []
    const certApp = this.applications.find(item => item.type === TX_TAGS)
    // const certApp = this.certificates.find(item => item.certificateId === certificateId)
    if (!certApp) return certificatesIssued
    else {
      const statusList = (issuedCerts ? certApp.subject.issued : certApp.subject.accepted)
      const issued = await BigchainDB.listTransactions(this.caelum.conn, statusList)
      for (let i = 0; i < issued.length; i++) {
        if (issued[i].operation === 'TRANSFER' &&
          issued[i].metadata.type === TX_ISSUED &&
          issued[i].metadata.subject &&
          issued[i].metadata.subject.certificateId === certificateId) {
          certificatesIssued.push({
            issuedId: issued[i].id,
            appId: issued[i].asset.id,
            subject: issued[i].metadata.subject
          })
        }
      }
      return certificatesIssued
    }
  }

  /**
   * Add a certificate App to the hashlist
   */
  async addHashingApp (pub = false, newKeys = false) {
    // Create twho nodes for the App certificates : certifivates (VC) and issued (DIDs)
    const keys = (newKeys === false) ? this.keys : newKeys
    const integrityTxId = await BigchainDB.createApp(this.caelum.conn, keys, { name: 'Integrity', type: TX_APP })
    // Add a new application to the app list
    const lastTx = await BigchainDB.getLastTransaction(this.caelum.conn, this.nodes.applications)
    const metadata = { name: 'Integrity', integrity: integrityTxId }
    const publicKey = ((pub === false) ? this.keys.publicKey : pub)
    const txId = await BigchainDB.transferAsset(this.caelum.conn, lastTx, this.keys, TX_INTEGRITY, metadata, publicKey)
    const app = { createTxId: txId, type: TX_INTEGRITY, subject: metadata }
    this.applications.push(app)
    return app
  }

  /**
   * Adds a new hash.
   */
  async saveHash (metadata) {
    let hashApp = this.applications.find(item => item.type === TX_INTEGRITY)
    if (!hashApp) {
      hashApp = await this.addHashingApp()
    }
    // TODO:Hash metadata and return txId
    const lastTx = await BigchainDB.getLastTransaction(this.caelum.conn, hashApp.subject.integrity)
    await BigchainDB.transferAsset(this.caelum.conn, lastTx, this.keys, TX_HASH, metadata, this.keys.publicKey)
  }

  /**
   * List all Hashes
   */
  async loadHashes () {
    const hashList = []
    const hashApp = this.applications.find(item => item.type === TX_INTEGRITY)
    if (hashApp) {
      const certificates = await BigchainDB.listTransactions(this.caelum.conn, hashApp.subject.integrity)
      for (let i = 0; i < certificates.length; i++) {
        if (certificates[i].operation === 'TRANSFER' &&
          certificates[i].metadata.type === TX_HASH) {
          hashList.push({
            hashId: certificates[i].id,
            subject: certificates[i].metadata
          })
        }
      }
    }
    return hashList
  }

  /**
   * Set the keys for this organization
   *
   * @param {string} mnemonic Seed. If false will create a new pair of keys.
   */
  setKeys (mnemonic = false) {
    return new Promise((resolve, reject) => {
      BigchainDB.getKeys(mnemonic)
        .then(result => {
          this.keys = result
          resolve(this.keys)
        })
        .catch((e) => {
          reject(e)
        })
    })
  }
}
