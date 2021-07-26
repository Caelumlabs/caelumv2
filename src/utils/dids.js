/* eslint-disable no-async-promise-executor */
'use strict'
const Utils = require('./utils')
const { bufferToU8a, stringToU8a, u8aConcat, u8aToHex, hexToU8a, hexToString, stringToHex } = require('@polkadot/util')

// Debug
var debug = require('debug')('did:debug:sub')
/**
 * IdSpace functions deling with DIDs.
 */
module.exports = class DIDs {
  /**
   * Registers Did in Substrate.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} accountTo Account to assign DID
   * @param {number} level Level to assign
   * @param {number} didType DID type
   * @param {string} legalName Organization's legal name
   * @param {string} taxId Organization's tax id
   * @returns {Promise} of transaction
   */
  async registerDid (exec, keypair, accountTo, level, didType, legalName, taxId) {
    const transaction = await exec.api.tx.idSpace.registerDid(accountTo, level, didType, legalName, taxId)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Registers an Arweave storage Address (Vec<u8>)for a DID
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} did DID
   * @param {object} storageAddress Arweave storage address (Vec<u8>)
   * @returns {Promise} Result of the transaction
   */
  async setStorageAddress (exec, keypair, did, storageAddress) {
    const storageAddr = u8aToHex(storageAddress)
    const transaction = await exec.api.tx.idSpace.setStorageAddress(did, storageAddr)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Registers a Vec<u8> (of the DID document) for a DID
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} did DID
   * @param {object} diddocHash Did document Hash (Vec<u8>)
   * @returns {Promise} Result of the transaction
   */
  async registerDidDocument (exec, keypair, did, diddocHash) {
    const docHash = u8aToHex(diddocHash)
    const transaction = await exec.api.tx.idSpace.registerDidDocument(did, docHash)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Rotate Key : changes the current key for a DID
   * Assumes Key Type = 0
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} did DID
   * @param {object} pubKey Public Key to be rotated (Vec<u8>)
   * @param {number} typ Public Key type
   * @returns {Promise} Result of the transaction
   */
  async rotateKey (exec, keypair, did, pubKey, typ) {
    // Convert pubKey to vec[u8]
    const keyArray = u8aToHex(Utils.toUTF8Array(pubKey))
    // Call idSpace RotateKey function
    const transaction = await exec.api.tx.idSpace.rotateKey(did, keyArray, typ)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Rotate Key Type: changes the current key for a specific type for a DID
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} did DID
   * @param {object} pubKey Public Key to be rotated (Vec<u8>)
   * @param {number} typ Public Key type
   * @returns {Promise} Result of the transaction
   */
  async rotateKeyType (exec, keypair, did, pubKey, typ) {
    // Convert pubKey to vec[u8]
    const keyArray = u8aToHex(Utils.toUTF8Array(pubKey))
    // Call idSpace RotateKey function
    const transaction = await exec.api.tx.idSpace.rotateKey(did, keyArray, typ)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Change DID owner.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} did DID
   * @param {string} newOwner New owner's Account (AccountId)
   * @returns {Promise} Result of the transaction
   */
  async changeOwner (exec, keypair, did, newOwner) {
    // Check if DID is wellformed
    if (Utils.verifyHexString(did) === false) {
      return false
    }
    const transaction = await exec.api.tx.idSpace.changeDidOwner(did, newOwner)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Assign a Credential for a DID
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} did DID
   * @param {object} credential Credential Hash (Vec<u8>)
   * @returns {Promise} Result of the transaction
   */
  async assignCredential (exec, keypair, did, credential) {
    const transaction = await exec.api.tx.idSpace.assignCredential(did, credential)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Change Legal Name or Tax ID
   * Only the promoter account is allowed to do it
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} did DID
   * @param {object} legalName New Legal Name (if null will not be changed)
   * @param {object} taxId New Tax Id (if null will not be changed)
   * @returns {Promise} Result of the transaction
   */
  async changeLegalNameOrTaxId (exec, keypair, did, legalName, taxId) {
    if (legalName === null) { legalName = '0x00' }
    if (taxId === null) { taxId = '0x00' }
    const transaction = await exec.api.tx.idSpace.changeLegalNameOrTaxId(did, legalName, taxId)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Change DID Info
   * Only the owner account is allowed to do it
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} did DID
   * @param {object} name New Name (if null will not be changed)
   * @param {object} address New address Id (if null will not be changed)
   * @param {object} postalCode New postal code (if null will not be changed)
   * @param {object} city New city (if null will not be changed)
   * @param {object} countryCode New country code (if null will not be changed)
   * @param {object} phoneNumber New phone number (if null will not be changed)
   * @param {object} website New website (if null will not be changed)
   * @param {object} endpoint New endpoint (if null will not be changed)
   * @returns {Promise} Result of the transaction
   */
  async changeInfo (exec, keypair, did, name, address, postalCode, city, countryCode, phoneNumber, website, endpoint) {
    if (name === null) { name = '0x00' }
    if (address === null) { address = '0x00' }
    if (postalCode === null) { postalCode = '0x00' }
    if (city === null) { city = '0x00' }
    if (countryCode === null) { countryCode = '0x00' }
    if (phoneNumber === null) { phoneNumber = '0x00' }
    if (website === null) { website = '0x00' }
    if (endpoint === null) { endpoint = '0x00' }
    const transaction = await exec.api.tx.idSpace.changeInfo(did, name, address, postalCode, city, countryCode, phoneNumber, website, endpoint)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Remove a Credential for a DID
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} did DID
   * @param {object} credential Credential Hash (Vec<u8>)
   * @returns {Promise} Result of the transaction
   */
  async removeCredential (exec, keypair, did, credential) {
    const transaction = await exec.api.tx.idSpace.removeCredential(did, credential)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Remove DID.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} did DID
   * @returns {Promise} Result of the transaction
   */
  async removeDid (exec, keypair, did) {
    // Check if CID is wellformed
    if (Utils.verifyHexString(did) === false) {
      return false
    }
    const transaction = await exec.api.tx.idSpace.removeDid(did)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Get Public Key from Did.
   *
   * @param {object} exec Executor class.
   * @param {string} did DID
   * @returns {Promise} of public key
   */
  async getDidData (exec, did) {
    // Check if CID is wellformed
    if (Utils.verifyHexString(did) === false) {
      return false
    }
    const { internalDid } = this.structDid(did)
    const didData = await exec.api.query.idSpace.didData(internalDid)
    return JSON.parse(didData)
  }

  /**
   * Get Owner Account of a DID.
   *
   * @param {object} exec Executor class.
   * @param {string} did DID
   * @returns {string} public key in hex format
   */
  async getOwnerFromDid (exec, did) {
    // Check if CID is wellformed
    if (Utils.verifyHexString(did) === false) {
      return false
    }
    const { internalDid } = this.structDid(did)
    return await exec.api.query.idSpace.ownerFromDid(internalDid)
  }

  /**
   * Get DID from Owner Account.
   *
   * @param {object} exec Executor class.
   * @param {string} owner DID
   * @returns {string} DID
   */
  async getDidFromOwner (exec, owner) {
    const did = await exec.api.query.idSpace.didFromOwner(owner)
    return u8aToHex(did)
  }

  /**
   * Get Public Key from Did.
   * Assumes Key Type = 0
   *
   * @param {object} exec Executor class.
   * @param {string} did DID
   * @param {number} typ Public Key type
   * @returns {string} Actual Key
   */
  async getActualDidKey (exec, did, typ) {
    // Check if CID is wellformed
    if (Utils.verifyHexString(did) === false) {
      return false
    }
    const { internalDid } = this.structDid(did)
    const result = await exec.api.query.idSpace.publicKeyFromDid([internalDid, typ])
    return bufferToU8a(result)
  }

  /**
   * Get Public Key of specific type from Did.
   *
   * @param {object} exec Executor class.
   * @param {string} did DID
   * @param {number} typ Public Key type
   * @returns {string} Actual Key
   */
  async getActualDidKeyType (exec, did, typ) {
    // Check if CID is wellformed
    if (Utils.verifyHexString(did) === false) {
      return false
    }
    const { internalDid } = this.structDid(did)
    const result = await exec.api.query.idSpace.publicKeyFromDid([internalDid, typ])
    return bufferToU8a(result)
  }

  /**
   * Retrieves the Hash of a Did Document for a DID
   *
   * @param {object} exec Executor class.
   * @param {string} did DID
   * @returns {string} hash in Base64 format
   */
  async getDidDocHash (exec, did) {
    // Check if CID is wellformed
    if (Utils.verifyHexString(did) === false) {
      return false
    }
    const { internalDid } = this.structDid(did)
    return await exec.api.query.idSpace.didDocumentFromDid(internalDid)
  }

  /**
   * Adds a CID.
   * DID to assign the CID. By default is Null and the CID
   * will be assigned to the DID of the sender transaction account
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} cid CID
   * @param {string} did DID to assign the new CID (Must exists)
   * @param {number} maxHids DID to assign the new CID (Must exists)
   * @returns {Promise} of transaction
   */
  async addCid (exec, keypair, cid, did, maxHids) {
    const transaction = await exec.api.tx.idSpace.addCid(cid, did, maxHids)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Removes a CID.
   * DID of the CIDs owner. By default is Null and the CID
   * must be assigned to the DID of the sender transaction account
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} cid CID
   * @param {string} did DID of the CIDs owner if providede
   * @returns {Promise} of transaction
   */
  async deleteCid (exec, keypair, cid, did) {
    const transaction = await exec.api.tx.idSpace.deleteCid(cid, did)
    return await exec.execTransaction(keypair, transaction)
  }

  /**
   * Get all CIDs.
   * Get the whole CIDs collection, including deleted.
   *
   * @param {object} exec Executor class.
   * @returns {Array} array of CIDs
   */
  async getCIDs (exec) {
    const CIDs = await exec.api.query.idSpace.cIDs()
    return CIDs.map((cid) => { return JSON.parse(cid) })
  }

  /**
   * Get all valid CIDs.
   * Get all CIDs that are not deleted.
   *
   * @param {object} exec Executor class.
   * @returns {Array} array of CIDs
   */
  async getValidCIDs (exec) {
    const CIDs = await exec.api.query.idSpace.cIDs()
    return CIDs.map((cid) => {
      const c = JSON.parse(cid)
      if (c.valid_to === 0) {
        return c
      }
    })
  }

  /**
   * Get CID by key.
   * Get CID data is key exists, else return null.
   * Because is an ordered array, we use a binary search
   *
   * @param {object} exec Executor class.
   * @param {string} cid CID
   * @returns {string} CID struct or null
   */
  async getCIDByKey (exec, cid) {
    // Check if CID is wellformed
    if (Utils.verifyHexString(cid) === false) {
      return false
    }
    const CIDs = await exec.api.query.idSpace.cIDs()
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
   * @param {object} exec Executor class.
   * @param {string} did DID to search
   * @returns {object} CID array
   */
  async getCIDsByDID (exec, did) {
    // Check if CID is wellformed
    if (Utils.verifyHexString(did) === false) {
      return false
    }
    const CIDs = await exec.api.query.idSpace.cIDs()
    const didCollection = []
    for (let i = 0; i < CIDs.length; i++) {
      const parsedCID = JSON.parse(CIDs[i])
      if (parsedCID.did_owner === did && parsedCID.valid_to === 0) {
        didCollection.push(parsedCID)
      }
    }
    return didCollection
  }

  /**
   * Destructure DID into its components as version.
   *
   * @param {string} did DID to search
   * @returns {object} CID array
   */
  structDid (did) {
    return {
      version: did.slice(2, 4),
      network: did.slice(4, 8),
      didType: did.slice(8, 10),
      internalDid: did.slice(0, 2).concat(did.slice(10))
    }
  }
}
