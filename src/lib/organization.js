'use strict'
const countries = require('../utils/countries')
const Storage = require('../utils/bigchaindb')
const Blockchain = require('../utils/substrate')
const W3C = require('../utils/w3c')
const Crypto = require('../utils/crypto')
const Application = require('./application')
const Workflow = require('./workflow')
const Achievement = require('./achievement')
const Location = require('./location')
const SDK = require('./sdk')
const axios = require('axios')

// const CBOR = require('cbor-js')
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
  constructor (caelum, did = false) {
    this.did = did
    this.createTxId = false
    this.caelum = caelum
    this.nodes = {}
    this.applications = []
    this.certificates = []
    this.sdk = false
    this.parameters = false
  }

  /**
   * Creates a new session.
   */
  getSession (capacity) {
    return new Promise((resolve, reject) => {
      axios.post(this.endpoint + 'auth/session', { capacity })
        .then((result) => {
          // 1 - login/register to Tabit network (last param)
          const connectionString = '1-' + result.data.sessionId + '-' + this.did + '-1'
          resolve({ sessionId: result.data.sessionId, connectionString })
        })
        .catch((e) => {
          resolve(false)
        })
    })
  }

  waitSession (sessionId) {
    return new Promise((resolve, reject) => {
      axios.get(this.endpoint + 'auth/session/wait/' + sessionId)
        .then(async (result) => {
          this.sdk = new SDK(this.caelum, this.did, result.data.tokenApi, this.endpoint)
          this.parameters = (result.data.capacity === 'admin') ? await this.sdk.call('parameter', 'getAll') : false
          resolve(result.data)
        })
        .catch(() => {
          resolve(false)
        })
    })
  }

  async startSdk () {
    this.sdk = new SDK(this.caelum, this.did, '', this.endpoint, 'peerdid')
  }

  async setSession (tokenApi, capacity) {
    this.sdk = new SDK(this.caelum, this.did, tokenApi, this.endpoint, capacity)
    this.parameters = (capacity === 'admin') ? await this.sdk.call('parameter', 'getAll') : false
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
          return Storage.createApp(this.caelum.storage, this.keys.storage, subject)
        })
        .then(txId => {
          app.createTxId = txId
          this.nodes[apptype] = txId
          this.applications.push({ createTxId: txId, subject })
          resolve(app)
        })
    })
  }

  /**
   * saveOrganization. Save to Storage the organization Object
   */
  saveOrganization (signedVC) {
    return new Promise((resolve) => {
      const data = {
        did: this.did,
        type: TX_DID,
        diddocument: this.nodes.diddocument,
        verified: this.nodes.verified,
        applications: this.nodes.applications,
        credential: signedVC
      }
      Storage.createApp(this.caelum.storage, this.keys.storage, data)
        .then(txId => {
          this.createTxId = txId
          resolve(this.did)
        })
    })
  }

  /**
   * Save Information : Verifiable Credential
   */
  async loadInformation () {
    await this.caelum.governance.connect()
    return new Promise((resolve) => {
      this.caelum.governance.getDidDocHash(this.did)
        .then(createTxId => {
          this.createTxId = createTxId
          return this.caelum.governance.getDidData(this.did)
        })
        .then(didDataJson => {
          this.level = didDataJson.level
          return Storage.getTransaction(this.caelum.storage, this.createTxId)
        })
        .then(tx => {
          this.nodes = {
            diddocument: tx.asset.data.diddocument || false,
            verified: tx.asset.data.verified || false,
            applications: tx.asset.data.applications || false
          }
          this.subject = tx.asset.data.credential
          return Storage.getLastTransaction(this.caelum.storage, this.createTxId)
        })
        .then(tx => {
          if (tx.operation === 'TRANSFER') {
            this.setInformation(tx.metadata.subject)
          }
          return this.loadDidDocument()
        })
        .then(() => {
          resolve()
        })
        .catch(e => {
          console.log(e)
          resolve(false)
        })
    })
  }

  /**
   * Save Information : Verifiable Credential
   */
  loadDidDocument () {
    return new Promise((resolve) => {
      Storage.getLastTransaction(this.caelum.storage, this.nodes.diddocument)
        .then(tx => {
          if (tx.operation === 'TRANSFER') {
            this.didDocument = (tx.metadata.type === TX_DIDDOC) ? JSON.parse(tx.metadata.subject) : {}
            this.endpoint = this.didDocument.service[0].serviceEndpoint
            if (this.didDocument.assertionMethod) {
              if (!this.keys) {
                this.keys = { w3c: false, governanace: false, storage: false }
                this.keys.w3c = {
                  passphrase: null,
                  privateKeyBase58: null,
                  publicKeyBase58: this.didDocument.assertionMethod[0].publicKeyBase58,
                  id: 'did:caelum:' + this.did + '#key-1',
                  type: 'Ed25519VerificationKey2018',
                  controller: 'did:caelum:' + this.did
                }
              }
            }
            // parse keys
            // parse service
            // this.didDocument.service = JSON.parse(this.didDocument.service)
          } else this.didDocument = false
          resolve()
        })
    })
  }

  /**
  * Save Information : Verifiable Credential
  * @param {object} subject VC credential
  */
  saveDidDocument (endpoint, pub = false) {
    return new Promise((resolve) => {
      const didDoc = JSON.stringify({
        '@context': ['https://w3c-ccg.github.io/did-spec/contexts/did-v0.11.jsonld'],
        id: 'did:caelum:' + this.did,
        assertionMethod: [{
          '@id': 'did:caelum:' + this.did + '#key-1',
          type: 'Ed25519VerificationKey2018',
          controller: 'did:caelum:' + this.did,
          publicKeyBase58: this.keys.w3c.publicKeyBase58
        }],
        service: [{
          '@id': 'did:caelum:' + this.did + '#caelum',
          type: 'Idspace',
          serviceEndpoint: endpoint
        }]
      })
      Storage.getLastTransaction(this.caelum.storage, this.nodes.diddocument)
        .then(lastTx => {
          // TODO: Check is a valid public Key
          const publicKey = ((pub === false) ? this.keys.storage.publicKey : pub)
          return Storage.transferAsset(this.caelum.storage, lastTx, this.keys.storage, TX_DIDDOC, didDoc, publicKey)
        })
        .then((tx) => {
          resolve(tx)
        })
    })
  }

  /**
   * Save Information : Verifiable Credential
   */
  saveInformation (subject, pub = false) {
    return new Promise((resolve) => {
      Storage.getLastTransaction(this.caelum.storage, this.createTxId)
        .then(lastTx => {
          // TODO: Check is a valid public Key
          const publicKey = ((pub === false) ? this.keys.publicKey : pub)
          if (subject.location) subject.location = JSON.stringify(subject.location)
          return Storage.transferAsset(this.caelum.storage, lastTx, this.keys, TX_INFO, subject, publicKey)
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
   * @param {object} subject VC credential
   */
  saveVerified (did, pub = false) {
    return new Promise((resolve) => {
      Storage.getLastTransaction(this.caelum.storage, this.nodes.verified)
        .then(lastTx => {
          // TODO: Check is a valid public Key
          const publicKey = ((pub === false) ? this.keys.publicKey : pub)
          return Storage.transferAsset(this.caelum.storage, lastTx, this.keys, TX_VERIFIED, { did }, publicKey)
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
  loadApplications () {
    return new Promise((resolve) => {
      Storage.listTransactions(this.caelum.storage, this.nodes.applications)
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
      // } else if (typeof subject.countryCode !== 'string' || !v.isISO31661Alpha2(subject.countryCode)) {
      //   reject(new Error('Invalid countryCode'))
      // } else if (typeof countries[subject.countryCode] !== 'object') {
      //  reject(new Error('Unknown countryCode'))
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
      const certificates = await Storage.listTransactions(this.caelum.storage, certApp.subject.certificates)
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
      Storage.searchMetadata(this.caelum.storage, this.did)
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
    const issued = await Storage.getTransaction(this.caelum.storage, issuedId)
    return issued
  }

  /**
   * Add a certificate App to the hashlist
   */
  async addCertificateApp (pub = false) {
    // Create twho nodes for the App certificates : certifivates (VC) and issued (DIDs)
    const issuedTxId = await Storage.createApp(this.caelum.storage, this.keys.storage, { name: 'Issued', type: TX_APP })
    const acceptedTxId = await Storage.createApp(this.caelum.storage, this.keys.storage, { name: 'Accepted', type: TX_APP })
    const certsTxId = await Storage.createApp(this.caelum.storage, this.keys.storage, { name: 'Certificates', type: TX_APP })
    // Add a new application to the app list
    const lastTx = await Storage.getLastTransaction(this.caelum.storage, this.nodes.applications)
    const metadata = { name: 'Certificates', certificates: certsTxId, issued: issuedTxId, accepted: acceptedTxId }
    const publicKey = ((pub === false) ? this.keys.storage.publicKey : pub)
    const txId = await Storage.transferAsset(this.caelum.storage, lastTx, this.keys.storage, TX_TAGS, metadata, publicKey)
    const app = { createTxId: txId, type: TX_TAGS, subject: metadata }
    this.applications.push(app)
    return app
  }

  /**
   * Add a certticate to the org
   * @param {object} subject Subject of the certificate
   */
  async addCertificate (subject) {
    return new Promise((resolve, reject) => {
      const achievement = new Achievement(subject)
      let certApp = this.applications.find(item => item.type === TX_TAGS)
      const promise = (certApp) ? Promise.resolve(certApp) : this.addCertificateApp()
      promise
        .then((result) => {
          certApp = result
          const certsTxId = certApp.subject.certificates
          return Storage.getLastTransaction(this.caelum.storage, certsTxId)
        })
        .then((result) => {
          const lastAppTx = result
          return Storage.transferAsset(this.caelum.storage, lastAppTx, this.keys.storage, TX_TAG_TYPE, achievement.subject, this.keys.storage.publicKey)
        })
        .then((result) => {
          resolve(result)
        })
        .catch((e) => console.log(e))
    })
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
      const lastTx = await Storage.getLastTransaction(this.caelum.storage, certApp.subject.issued)
      const status = (issued ? 'issued' : 'revoked')
      return await Storage.transferAsset(this.caelum.storage, lastTx, this.keys.storage, TX_ISSUED, { certificateId, did, status }, this.keys.storage.publicKey)
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
    const lastTx = await Storage.getLastTransaction(this.caelum.storage, certApp.subject.accepted)
    const status = (accepted ? 'accepted' : 'not_accepted')
    await Storage.transferAsset(this.caelum.storage, lastTx, this.keys.storage, TX_ISSUED, { certificateId, did, status }, this.keys.storage.publicKey)
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
      const issued = await Storage.listTransactions(this.caelum.storage, statusList)
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
    const integrityTxId = await Storage.createApp(this.caelum.storage, keys, { name: 'Integrity', type: TX_APP })
    // Add a new application to the app list
    const lastTx = await Storage.getLastTransaction(this.caelum.storage, this.nodes.applications)
    const metadata = { name: 'Integrity', integrity: integrityTxId }
    const publicKey = ((pub === false) ? this.keys.publicKey : pub)
    const txId = await Storage.transferAsset(this.caelum.storage, lastTx, this.keys, TX_INTEGRITY, metadata, publicKey)
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
    const lastTx = await Storage.getLastTransaction(this.caelum.storage, hashApp.subject.integrity)
    await Storage.transferAsset(this.caelum.storage, lastTx, this.keys, TX_HASH, metadata, this.keys.publicKey)
  }

  /**
   * List all Hashes
   */
  async loadHashes () {
    const hashList = []
    const hashApp = this.applications.find(item => item.type === TX_INTEGRITY)
    if (hashApp) {
      const certificates = await Storage.listTransactions(this.caelum.storage, hashApp.subject.integrity)
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
   * Set new keys
   */
  async newKeys () {
    this.keys = {}
    this.keys.governance = await Blockchain.newKeys()
    if (this.did === false) {
      this.did = this.keys.governance.address
    }
    this.keys.storage = await Storage.getKeys(false)
    this.keys.w3c = await W3C.newKeys(this.did)
  }

  /**
   * Set the keys for this organization
   *
   * @param {string} mnemonic Seed. If false will create a new pair of keys.
   */
  async setKeys (keyType, keyInfo) {
    if (!this.keys) this.keys = {}
    switch (keyType) {
      case 'storage':
        this.keys.storage = await Storage.getKeys(keyInfo)
        break
      case 'governance':
        this.keys.governance = await Blockchain.getKeys(keyInfo)
        break
      case 'w3c':
        this.keys.w3c = await W3C.getKeys(keyInfo)
        break
    }
  }

  async generateDid (subject) {
    const key = await Blockchain.newKeys()
    const didSubject = { ...subject }
    didSubject.id = key.address
    const result = await W3C.signCredential(didSubject, this.did, this.keys.w3c, this.didDocument)
    return result
  }

  async signDid (subject) {
    // const result = await W3C.signCredential(subject, this.did, this.keys.w3c)
    const result = await W3C.signCredential(subject, this.did, this.keys.w3c, this.didDocument)
    return result
  }

  async addMember (peerDid, capacity, subject = {}) {
    const signSubject = { ...subject }
    signSubject.sphere = (['over18', 'oidc'].includes(capacity) ? 'personal' : 'professional')
    signSubject.capacity = capacity
    const result = await W3C.signMember(this.did, peerDid, signSubject, this.keys.w3c, this.didDocument)
    return result
  }

  async verifyMember (signedVC, capacity) {
    let result = await W3C.verifyCredential(signedVC, this.did, this.keys.w3c, this.didDocument)
    if (result.verified === true) {
      result = (signedVC.credentialSubject.capacity === capacity)
    }
    return result
  }

  async verifyVC (signedVC) {
    const result = await W3C.verifyCredential(signedVC, this.did, this.keys.w3c, this.didDocument)
    return result
  }

  async registerDid (did, createTxId, address, level, tokens) {
    await this.caelum.governance.connect()
    this.caelum.governance.setKeyring('what unlock stairs benefit salad agent rent ask diamond horror fox aware')

    // Register the DID & CreateTxId-
    await this.caelum.governance.registerDid(did, address, level)
    await this.caelum.governance.wait4Event('DidRegistered')
    await this.caelum.governance.registerDidDocument(did, createTxId)

    // Transfer tokens.
    const amountTransfer = Blockchain.units * tokens
    await this.caelum.governance.transferTokensNoFees(address, amountTransfer)

    // assign new owner.
    // console.log('TODO : changeOwner??')
    // await this.caelum.governance.changeOwner(did, address)
  }

  getWorkflow (workflowId, stateId = 0, partyId = 1, actionId = 1) {
    const wf = new Workflow(this, workflowId, stateId, partyId, actionId)
    return wf
  }

  async export (password) {
    const keys = Crypto.encryptObj(password, this.keys)
    const json = JSON.stringify({ did: this.did, keys: keys })
    return json
  }

  async import (data, password) {
    this.did = data.did
    this.keys = Crypto.decryptObj(password, data.keys)
  }
}
