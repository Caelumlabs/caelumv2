require('dotenv').config();
const Organization = require('./lib/organization');
const Blockchain = require('./utils/substrate');

/**
 * Caelum main lin
 */
module.exports = class Caelum {
  /**
   * Constructor
   *
   * @param {string} url BigchainDB server API
   */
  constructor(blockchainUrl) {
    this.blockchain = new Blockchain(blockchainUrl);
  }

  async connect() {
    await this.blockchain.connect();
  }

  async disconnect() {
    await this.blockchain.disconnect();
  }

  async getOrganizationFromSeed(seed) {
    this.blockchain.setKeyring(seed);
    const did = await this.blockchain.getDidFromOwner();
    const org = new Organization(this.blockchain, did);
    return org;
  }

  async getOrganizationFromDid(did) {
    const org = new Organization(this.blockchain, did);
    await org.getData();
    return org;
  }

  /**
   * newOrganization. creates an organization Object
   *
   * @param {object} data Data can be a DID (string) or an object with {legalName and taxID}
   */
  /*
  async newOrganization (did = false, newKeys = false) {
    const organization = new Organization(this, did)
    if (newKeys) await organization.newKeys()
    return organization
  }
  */

  /**
   * newUser. creates a new User object
   */
  /*
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
*/
  /**
   * newOrganization. creates an organization Object
   *
   * @param {object} data Data can be a DID (string) or an object with {legalName and taxID}
   */
  /*
  async importOrganization (data, password) {
    const organization = new Organization(this)
    await organization.import(data, password)
    return organization
  }
*/
  /**
   * loadOrganization. Retrieves an organization
   *
   * @param {string} createTxId Transaction ID
   * @param {string} did DID
   */
  /*
  async loadOrganization (did) {
    const organization = new Organization(this, did)
    await organization.loadInformation()
    return organization
  }

  static loadCrypto () {
    return Crypto
  }
  */
};
