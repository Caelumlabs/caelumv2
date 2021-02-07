/* eslint-disable no-async-promise-executor */
'use strict'
const BlockchainInterface = require('./blockchain')
const Utils = require('./substrate_utils')
const Crypto = require('./crypto')

const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const { bufferToU8a } = require('@polkadot/util')

const UNITS = (10 ** 12)

// Debug
const debug = require('debug')('did:debug:sub')
/**
 * Javascript Class to interact with the Blockchain.
 */
module.exports = class Substrate extends BlockchainInterface {
  static get units () {
    return UNITS
  }

  /**
   * Constructor
   *
   * @param {string} server Web Sockets Provider, e.g. 'ws://127.0.0.1:9944/'
   */
  constructor (server) {
    super()
    this.providerWS = server
    this.api = false
    this.keypair = {}
    this.units = 1000000000
    this.connected = false
  }

  /**
   * New Blockchain KeyPair.
   *
   * @returns {object} Key pair
   */
  static async newKeys () {
    await Crypto.init()
    return Crypto.keyPair()
  }

  /**
   * New Blockchain KeyPair.
   *
   * @param {string} mnemonic Mnemonic
   * @returns {object} Key pair
   */
  static async getKeys (mnemonic) {
    await Crypto.init()
    return Crypto.keyPair(mnemonic)
  }

  /**
   * Connect with the Blockchain.
   *
   * @returns {boolean} success
   */
  async connect () {
    if (this.connected === true) return true
    debug('connecting to ' + this.providerWS)

    // 'wss://substrate-demo.caelumlabs.com/'
    this.provider = new WsProvider(this.providerWS)
    this.api = await ApiPromise.create({
      provider: this.provider,
      types: {
        Accumulator: {
          infinity: 'Vec<u8>',
          g: 'Vec<u8>',
          n: 'Vec<u8>',
          h: 'Vec<u8>',
          c: 'Vec<u8>',
          z: 'Vec<u8>',
          q: 'Vec<u8>',
          i: 'u32'
        },
        Releases: {
          _enum: [
            'V1_0_0',
            'V2_0_0'
          ]
        },
        CID: {
          release: 'Releases',
          cid: 'Vec<u8>',
          owner: 'AccountId',
          did_owner: 'Vec<u8>',
          max_hids_issue: 'u64',
          total_hids_issued: 'u64',
          date_created: 'u64',
          valid_from: 'u64',
          block_valid_from: 'BlockNumber',
          valid_to: 'u64',
          block_valid_to: 'BlockNumber'
        },
        PublicKey: {
          release: 'Releases',
          pub_key: 'Vec<u8>',
          valid_from: 'u64',
          block_valid_from: 'BlockNumber',
          valid_to: 'u64',
          block_valid_to: 'BlockNumber'
        },
        PublicKeyType: {
          release: 'Releases',
          pub_key_type: 'u16',
          pub_keys: 'Vec<PublicKey>',
          valid_from: 'u64',
          block_valid_from: 'BlockNumber',
          valid_to: 'u64',
          block_valid_to: 'BlockNumber'
        },
        Credential: {
          release: 'Releases',
          credential: 'Vec<u8>',
          accumulator: 'Accumulator',
          valid_from: 'u64',
          block_valid_from: 'BlockNumber',
          valid_to: 'u64',
          block_valid_to: 'BlockNumber'
        },
        DIDData: {
          release: 'Releases',
          owner: 'AccountId',
          did_promoter: 'Vec<u8>',
          level: 'u16',
          pub_keys: 'Vec<PublicKeyType>',
          did_doc: 'Vec<u8>',
          max_cids_issue: 'u64',
          total_cids_issued: 'u64',
          credentials: 'Vec<Credential>',
          valid_from: 'u64',
          block_valid_from: 'BlockNumber',
          valid_to: 'u64',
          block_valid_to: 'BlockNumber'
        }
      }
    })

    await cryptoWaitReady()

    const [chain, nodeName, nodeVersion] = await Promise.all([
      this.api.rpc.system.chain(),
      this.api.rpc.system.name(),
      this.api.rpc.system.version()
    ])

    debug(`Connected to chain ${chain} - ${nodeName} v${nodeVersion}`)
    this.connected = true
    return true
  }

  /**
   * Disconnect from Blockchain.
   */
  disconnect () {
    this.provider.unsubscribe()
    this.provider.disconnect()
  }

  /**
   * Sets the Keyring
   *
   * @param {string} seed Seed (12, 15, 24-digit mnemonic, or //Alice)
   * @returns {string} address
   */
  setKeyring (seed) {
    const keyring = new Keyring({ type: 'sr25519' })
    this.keypair = keyring.addFromUri(seed)
    debug('Keyring added:' + this.keypair.address)
    return this.keypair.address
  }

  getKeyring (seed) {
    const keyring = new Keyring({ type: 'sr25519' })
    return keyring.addFromUri(seed)
  }

  /**
   * Get Address
   *
   * @param {string} seed Seed (12, 15, 24-digit mnemonic, or //Alice)
   * @returns {string} address
   */
  getAddress (seed) {
    const keyring = new Keyring({ type: 'sr25519' })
    const keypair = keyring.addFromUri(seed)
    return keypair.address
  }

  /**
   * Balance of Tokens
   *
   * @param {string} address Address to send tokens to
   * @returns {*} balance and nonce
   */
  async addrState (address = false) {
    return new Promise(async (resolve) => {
      const addressTo = (address === false) ? this.keypair.address : address
      const { nonce, data: balance } = await this.api.query.system.account(addressTo)
      resolve({ balance, nonce })
    })
  }

  /**
   * Transfer Tokens
   *
   * @param {string} addrTo Address to send tokens to
   * @param {*} amount Amount of tokens
   * @returns {Promise} of sending tokens
   */
  async transferTokens (addrTo, amount) {
    return new Promise(async (resolve) => {
      const unsub = await this.api.tx.balances
        .transfer(addrTo, amount)
        .signAndSend(this.keypair, (result) => {
          if (result.status.isInBlock) {
            debug(`Transaction included at blockHash ${result.status.asInBlock}`)
          } else if (result.status.isFinalized) {
            debug(`Transaction finalized at blockHash ${result.status.asFinalized}`)
            resolve(true)
            unsub()
          }
        })
    })
  }

  /**
   * Transfer Tokens
   *
   * @param {string} addrTo Address to send tokens to
   * @param {*} amount Amount of tokens
   * @returns {Promise} of sending tokens
   */
  async transferTokensNoFees (addrTo, amount) {
    return new Promise(async (resolve) => {
      const unsub = await this.api.tx.balances
        .transferNoFees(addrTo, amount)
        .signAndSend(this.keypair, (result) => {
          if (result.status.isInBlock) {
            debug(`Transaction included at blockHash ${result.status.asInBlock}`)
          } else if (result.status.isFinalized) {
            debug(`Transaction finalized at blockHash ${result.status.asFinalized}`)
            resolve(true)
            unsub()
          }
        })
    })
  }

  /**
   * Transfer All Tokens
   *
   * @param {string} addrTo Address to send tokens to
   * @returns {Promise} of sending tokens
   */
  async transferAllTokens (addrTo) {
    const current = await this.addrState()
    const amount = current.balance.free
    const info = await this.api.tx.balances.transfer(addrTo, amount).paymentInfo(this.keypair)
    if (info.partialFee.sub(amount) > 0) {
      return this.transferTokens(addrTo, info.partialFee.sub(amount))
    }
    return this.transferTokens(addrTo, amount.sub(info.partialFee))
  }

  /**
   * Registers Did in Substrate.
   *
   * @param {string} did DID
   * @param {string} accountTo Account to assign DID
   * @param {number} level Level to assign
   * @returns {Promise} of transaction
   */
  async registerDid (did, accountTo, level) {
    // Convert did string to hex
    const hexDID = Utils.base64ToHex(did)
    const transaction = await this.api.tx.caelumApp.registerDid(hexDID, accountTo, level)
    return await this.execTransaction(transaction)
  }

  /**
   * Registers a Vec<u8> (of the DID document) for a DID
   *
   * @param {string} did DID
   * @param {object} diddocHash Did document Hash (Vec<u8>)
   * @returns {Promise} Result of the transaction
   */
  async registerDidDocument (did, diddocHash) {
    const hexDid = Utils.base64ToHex(did)
    const docHash = Utils.toUTF8Array(Buffer.from(diddocHash, 'utf-8'))
    const transaction = await this.api.tx.caelumApp.registerDidDocument(hexDid, docHash)
    return await this.execTransaction(transaction)
  }

  /**
   * Rotate Key : changes the current key for a DID
   * Assumes Key Type = 0
   *
   * @param {string} did DID
   * @param {object} pubKey Public Key to be rotated (Vec<u8>)
   * @param {number} typ Public Key type
   * @returns {Promise} Result of the transaction
   */
  async rotateKey (did, pubKey, typ = 0) {
    // Convert did string to hex
    const hexDID = Utils.base64ToHex(did)
    // Convert pubKey to vec[u8]
    const keyArray = Utils.toUTF8Array(pubKey)
    // Call caelumApp RotateKey function
    const transaction = await this.api.tx.caelumApp.rotateKey(hexDID, keyArray, typ)
    return await this.execTransaction(transaction)
  }

  /**
   * Rotate Key Type: changes the current key for a specific type for a DID
   *
   * @param {string} did DID
   * @param {object} pubKey Public Key to be rotated (Vec<u8>)
   * @param {number} typ Public Key type
   * @returns {Promise} Result of the transaction
   */
  async rotateKeyType (did, pubKey, typ) {
    // Convert did string to hex
    const hexDID = Utils.base64ToHex(did)
    // Convert pubKey to vec[u8]
    const keyArray = Utils.toUTF8Array(pubKey)
    // Call caelumApp RotateKey function
    const transaction = await this.api.tx.caelumApp.rotateKey(hexDID, keyArray, typ)
    return await this.execTransaction(transaction)
  }

  /**
   * Change DID owner.
   *
   * @param {string} did DID
   * @param {string} newOwner New owner's Account (AccountId)
   * @returns {Promise} Result of the transaction
   */
  async changeOwner (did, newOwner) {
    // Convert did string to hex
    const hexDID = Utils.base64ToHex(did)
    const transaction = await this.api.tx.caelumApp.changeDidOwner(hexDID, newOwner)
    return await this.execTransaction(transaction)
  }

  /**
   * Assign a Credential for a DID
   *
   * @param {string} did DID
   * @param {object} credential Credential Hash (Vec<u8>)
   * @returns {Promise} Result of the transaction
   */
  async assignCredential (did, credential) {
    const hexDid = Utils.base64ToHex(did)
    const cred = Utils.toUTF8Array(credential)
    const transaction = await this.api.tx.caelumApp.assignCredential(hexDid, cred)
    return await this.execTransaction(transaction)
  }

  /**
   * Remove a Credential for a DID
   *
   * @param {string} did DID
   * @param {object} credential Credential Hash (Vec<u8>)
   * @returns {Promise} Result of the transaction
   */
  async removeCredential (did, credential) {
    const hexDid = Utils.base64ToHex(did)
    const cred = Utils.toUTF8Array(credential)
    const transaction = await this.api.tx.caelumApp.removeCredential(hexDid, cred)
    return await this.execTransaction(transaction)
  }

  /**
   * Remove DID.
   *
   * @param {string} did DID
   * @returns {Promise} Result of the transaction
   */
  async removeDid (did) {
    // Convert did string to hex
    const hexDID = Utils.base64ToHex(did)
    const transaction = await this.api.tx.caelumApp.removeDid(hexDID)
    return await this.execTransaction(transaction)
  }

  /**
   * Get Public Key from Did.
   *
   * @param {string} did DID
   * @returns {Promise} of public key
   */
  async getDidData (did) {
    const hexDid = Utils.base64ToHex(did)
    const didData = await this.api.query.caelumApp.didData(hexDid)
    return JSON.parse(didData)
  }

  /**
   * Get Owner Account of a DID.
   *
   * @param {string} did DID
   * @returns {string} public key in hex format
   */
  async getOwnerFromDid (did) {
    return await this.api.query.caelumApp.ownerFromDid(did)
  }

  /**
   * Get DID from Owner Account.
   *
   * @param {string} owner DID
   * @returns {string} DID
   */
  async getDidFromOwner (owner) {
    return await this.api.query.caelumApp.didFromOwner(owner)
  }

  /**
   * Get Public Key from Did.
   * Assumes Key Type = 0
   *
   * @param {string} did DID
   * @param {number} typ Public Key type
   * @returns {string} Actual Key
   */
  async getActualDidKey (did, typ = 0) {
    const hexDid = Utils.base64ToHex(did)
    const result = await this.api.query.caelumApp.publicKeyFromDid([hexDid, typ])
    return bufferToU8a(result)
    // return (result)
  }

  /**
   * Get Public Key of specific type from Did.
   *
   * @param {string} did DID
   * @param {number} typ Public Key type
   * @returns {string} Actual Key
   */
  async getActualDidKeyType (did, typ) {
    const hexDid = Utils.base64ToHex(did)
    const result = await this.api.query.caelumApp.publicKeyFromDid([hexDid, typ])
    return bufferToU8a(result)
    // return (result)
  }

  /**
   * Retrieves the Hash of a Did Document for a DID
   *
   * @param {string} did DID
   * @returns {string} hash in Base64 format
   */
  async getDidDocHash (did) {
    const hexDID = Utils.base64ToHex(did)
    const didDoc = await this.api.query.caelumApp.didDocumentFromDid(hexDID)
    const doc = didDoc.toString().split('x')[1].replace(/0+$/g, '')
    return Utils.hexToBase64(doc)
  }

  /**
   * Adds a CID.
   * DID to assign the CID. By default is Null and the CID
   * will be assigned to the DID of the sender transaction account
   *
   * @param {string} cid CID
   * @param {string} did DID to assign the new CID (Must exists)
   * @returns {Promise} of transaction
   */
  async addCid (cid, did = null, max_hids = 0) {
    // Convert cid string to hex
    const hexCID = Utils.base64ToHex(cid)
    // Convert did string to hex
    let hexDID = Buffer.from([0])
    if (did != null) {
      hexDID = Utils.base64ToHex(did)
    }
    const transaction = await this.api.tx.caelumApp.addCid(hexCID, hexDID, max_hids)
    return await this.execTransaction(transaction)
  }

  /**
   * Removes a CID.
   * DID of the CIDs owner. By default is Null and the CID
   * must be assigned to the DID of the sender transaction account
   *
   * @param {string} cid CID
   * @param {string} did DID of the CIDs owner if providede
   * @returns {Promise} of transaction
   */
  async deleteCid (cid, did = null) {
    // Convert cid string to hex
    const hexCID = Utils.base64ToHex(cid)
    // Convert did string to hex
    let hexDID = Buffer.from([0])
    if (did != null) {
      hexDID = Utils.base64ToHex(did)
    }
    const transaction = await this.api.tx.caelumApp.deleteCid(hexCID, hexDID)
    return await this.execTransaction(transaction)
  }

  /**
   * Get all CIDs.
   * Get the whole CIDs collection, including deleted.
   *
   * @returns {Array} array of CIDs
   */
  async getCIDs () {
    const CIDs = await this.api.query.caelumApp.cIDs()
    return CIDs.map((cid) => { return JSON.parse(cid) })
  }

  /**
   * Get all valid CIDs.
   * Get all CIDs that are not deleted.
   *
   * @returns {Array} array of CIDs
   */
  async getValidCIDs () {
    const CIDs = await this.api.query.caelumApp.cIDs()
    return CIDs.map((cid) => {
      const c = JSON.parse(cid)
      return (c.valid_to === 0) ? c : false
    })
  }

  /**
   * Get CID by key.
   * Get CID data is key exists, else return null.
   * Because is an ordered array, we use a binary search
   *
   * @param {string} cid CID
   * @returns {string} CID struct or null
   */
  async getCIDByKey (cid) {
    const CIDs = await this.api.query.caelumApp.cIDs()
    let first = 0
    let last = CIDs.length - 1
    let middle = Math.floor((last + first) / 2)

    let parsedCID = JSON.parse(CIDs[middle])
    while (parsedCID.cid !== cid && first < last) {
      if (cid < parsedCID.cid) {
        last = middle - 1
      } else if (cid > parsedCID.cid) {
        first = middle + 1
      }
      middle = Math.floor((last + first) / 2)
      parsedCID = JSON.parse(CIDs[middle])
    }

    return (parsedCID.cid !== cid) ? null : parsedCID
  }

  /**
   * Get all valid CIDs that belongs to a DID.
   * Get a collections of CID data that belongs to a DID.
   * (Can be empty)
   *
   * @param {string} did DID to search
   * @returns {object} CID array
   */
  async getCIDsByDID (did) {
    const CIDs = await this.api.query.caelumApp.cIDs()
    // Convert did string to hex
    const hexDID = Utils.base64ToHex(did)
    const didCollection = []
    for (let i = 0; i < CIDs.length; i++) {
      const parsedCID = JSON.parse(CIDs[i])
      if (parsedCID.did_owner.toString().split('x')[1] === hexDID && parsedCID.valid_to === 0) {
        didCollection.push(parsedCID)
      }
    }
    return didCollection
  }

  /**
   * Get Metadata.
   * Get the State Metadata.
   *
   * @returns {Array} array of CIDs
   */
  async getMetadata () {
    return await this.api.rpc.state.getMetadata()
  }

  /**
   * Subscribe to register events
   *
   * @param {string} eventMethod Event to listen to
   * @returns {Promise} Result of the transaction
   */
  async wait4Event (eventMethod) {
    return new Promise(resolve => {
      this.api.query.system.events(events => {
        // loop through
        events.forEach(record => {
          // extract the phase, event and the event types
          const { event } = record
          const types = event.typeDef
          if (event.section === 'caelumApp' && event.method === eventMethod) {
            for (let i = 0; i < event.data.length; i++) {
              // All events have a a type 'AccountId'
              if (types[i].type === 'AccountId') {
                resolve(JSON.parse(event.data.toString()))
              }
            }
            resolve([])
          }
        })
      })
    })
  }

  /**
   * Execute a transaction.
   *
   * @param {object} transaction Transaction to execute (Transaction)
   * @returns {Promise} result of the Transaction
   */
  async execTransaction (transaction) {
    return new Promise(async (resolve) => {
      let result = true
      // console.log(this.keypair.address)
      await transaction.signAndSend(this.keypair, ({ status, events }) => {
        if (status.isInBlock || status.isFinalized) {
          const errors = events.filter(({ event: { method, section } }) =>
            section === 'system' && method === 'ExtrinsicFailed'
          )
          if (errors.length > 0) {
            errors.forEach(({ event: { data: [error, info] } }) => {
              if (error.isModule) {
                console.log(`Module error: ${Uint8Array.of(error.asModule.index, error.asModule.error)}`)
              } else {
                console.log('System error found ' + error.toString())
              }
            })
            result = false
          }
          resolve(result)
        }
      })
    })
  }
}
