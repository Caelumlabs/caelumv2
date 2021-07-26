const debug = require('debug')('did:debug:org');

/**
 * Schema.org: Organization.
 * URL https://schema.org/Organization
 */
module.exports = class Organization {
  /**
   * Constructor. It creates an Organization object.
   */
  constructor(blockchain, did = false) {
    this.info = { did };
    this.data = false;
    this.keys = {};
    this.blockchain = blockchain;
  }

  async registerOrganization(legalName, taxId, level) {
    debug(`registerOrg - ${legalName}`);
    const keys = await this.blockchain.newKeys();
    await this.blockchain.registerDid(keys.address, level, 2, legalName, taxId);
    await this.blockchain.wait4Event('DidRegistered');
    const did = await this.blockchain.getDidFromOwner(keys.address);
    debug(`DID = ${did}`);
    debug(`Mnemonic = ${keys.mnemonic}`);
    const newOrg = new Organization(this.blockchain, did);
    return newOrg;
  }

  async getData() {
    this.data = await this.blockchain.getDidData(this.info.did);
    return this.data;
  }
};
