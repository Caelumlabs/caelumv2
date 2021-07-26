/* eslint-disable no-async-promise-executor */
const debug = require('debug')('did:debug:sub');
const { Keyring } = require('@polkadot/api');
const { mnemonicGenerate, mnemonicValidate } = require('@polkadot/util-crypto');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const { hexToString } = require('@polkadot/util');
const BlockchainInterface = require('./blockchain');
const Executor = require('./executor');
const DID = require('./dids');
const Balance = require('./balance');
const Process = require('./process');
const Tokens = require('./fungibles');
const ClassNFTs = require('./classnfts');

/**
 * Javascript Class to interact with the Blockchain.
 */
module.exports = class SubstrateLib extends BlockchainInterface {
  /**
   * Constructor
   *
   * @param {string} server Web Sockets Provider, e.g. 'ws://127.0.0.1:9944/'
   */
  constructor(server) {
    super();
    // Initialize all needed classes
    this.exec = new Executor(server);
    this.dids = new DID();
    this.balance = new Balance();
    this.process = new Process();
    this.tokens = new Tokens();
    this.classNFTs = new ClassNFTs();
    this.keypair = {};
  }

  // Blockchain execution related functions

  /**
   * Connect with the Blockchain.
   *
   * @returns {boolean} success
   */
  async connect() {
    const result = await this.exec.connect();
    if (result === undefined || result === null) {
      return false;
    }
    return true;
  }

  /**
   * Disconnect from Blockchain.
   */
  disconnect() {
    this.exec.disconnect();
  }

  /**
   * Get Metadata.
   * Get the State Metadata.
   *
   * @returns {Array} array of CIDs
   */
  async getMetadata() {
    return this.exec.getMetadata();
  }

  // Keys related functions

  /**
   * Sets the Keyring
   *
   * @param {string} seed Seed (12, 15, 24-digit mnemonic, or //Alice)
   * @returns {string} address
   */
  setKeyring(seed) {
    const keyring = new Keyring({ type: 'sr25519' });
    this.keypair = keyring.addFromUri(seed);
    debug(`Keyring added: ${this.keypair.address}`);
    return this.keypair.address;
  }

  /**
   * Gets the keyring
   *
   * @param {string} seed Seed
   * @returns {object} keyring
   */
  getKeyring(seed) {
    const keyring = new Keyring({ type: 'sr25519' });
    return keyring.addFromUri(seed);
  }

  /**
   * Get Address
   *
   * @param {string} seed Seed (12, 15, 24-digit mnemonic, or //Alice)
   * @returns {string} address
   */
  getAddress(seed = null) {
    if (seed == null) {
      return this.keypair.address;
    }
    const keyring = new Keyring({ type: 'sr25519' });
    const keypair = keyring.addFromUri(seed);
    return keypair.address;
  }

  /**
   * New Blockchain KeyPair.
   *
   * @returns {object} Key pair
   */
  async newKeys(_mnemonic = false) {
    await cryptoWaitReady();
    const mnemonic = (_mnemonic === false) ? mnemonicGenerate() : _mnemonic;
    const keyring = new Keyring({ type: 'sr25519' });
    if (mnemonicValidate(mnemonic)) {
      const meta = { whenCreated: Date.now() };
      const pair = keyring.addFromMnemonic(mnemonic, meta);
      const keyringPairAddress = keyring.getPair(pair.address).address;
      // const keyringPairPubKey = u8aToHex(keyring.getPair(pair.address).publicKey)
      return ({
        mnemonic,
        address: keyringPairAddress,
        keyPair: keyring.getPair(pair.address),
      });
    }
	return false;
  }

  // The following functions deal with native blockchain tokens
  // Gets and sets token balances

  /**
   * Balance of Tokens
   *
   * @param {string} address Address to send tokens to
   * @returns {*} balance and nonce
   */
  async addrState(address = false) {
    return this.balance.addrState(this.exec, this.keypair, address);
  }

  /**
   * Transfer Tokens
   *
   * @param {string} addrTo Address to send tokens to
   * @param {*} amount Amount of tokens
   * @returns {Promise} of sending tokens
   */
  async transferTokens(addrTo, amount) {
    return this.balance.transferTokens(this.exec, this.keypair, addrTo, amount);
  }

  /**
   * Transfer Tokens
   *
   * @param {string} addrTo Address to send tokens to
   * @param {*} amount Amount of tokens
   * @returns {Promise} of sending tokens
   */
  async transferTokensNoFees(addrTo, amount) {
    return this.balance.transferTokensNoFees(this.exec, this.keypair, addrTo, amount);
  }

  /**
   * Transfer All Tokens
   *
   * @param {string} addrTo Address to send tokens to
   * @returns {Promise} of sending tokens
   */
  async transferAllTokens(addrTo) {
    return this.balance.transferAllTokens(this.exec, this.keypair, addrTo);
  }

  /**
   * Transfer All Tokens
   *
   */
  async createOwnAdminToken(id, admin, minBalance) {
    return this.tokens.createOwnAdminToken(this.exec, this.keypair, id, admin, minBalance);
  }

  // DID and CID functions

  /**
   * Registers Did in Substrate.
   *
   * @param {string} accountTo Account to assign DID
   * @param {number} level Level to assign
   * @param {number} didType DID type
   * @param {string} legalName Organization Legal Name
   * @param {string} taxId Organization tax id
   * @returns {Promise} of transaction
   */
  async registerDid(accountTo, level, didType, legalName, taxId) {
    return this.dids.registerDid(
      this.exec,
      this.keypair,
      accountTo,
      level,
      didType,
      legalName,
      taxId,
    );
  }

  /**
   * Rotate Key : changes the current key for a DID
   * Assumes Key Type = 0
   *
   * @param {string} did DID
   * @param {object} pubKey Public Key to be rotated (Vec<u8>)
   * @param {number} typ Public Key type. Defaults to zero
   * @returns {Promise} Result of the transaction
   */
  async rotateKey(did, pubKey, typ = 0) {
    return this.dids.rotateKey(this.exec, this.keypair, did, pubKey, typ);
  }

  /**
   * Rotate Key Type: changes the current key for a specific type for a DID
   *
   * @param {string} did DID
   * @param {object} pubKey Public Key to be rotated (Vec<u8>)
   * @param {number} typ Public Key type
   * @returns {Promise} Result of the transaction
   */
  async rotateKeyType(did, pubKey, typ) {
    return this.dids.rotateKeyType(this.exec, this.keypair, did, pubKey, typ);
  }

  /**
   * Change DID owner.
   *
   * @param {string} did DID
   * @param {string} newOwner New owner's Account (AccountId)
   * @returns {Promise} Result of the transaction
   */
  async changeOwner(did, newOwner) {
    return this.dids.changeOwner(this.exec, this.keypair, did, newOwner);
  }

  /**
   * Assign a Credential for a DID
   *
   * @param {string} did DID
   * @param {object} credential Credential Hash (Vec<u8>)
   * @returns {Promise} Result of the transaction
   */
  async assignCredential(did, credential) {
    return this.dids.assignCredential(this.exec, this.keypair, did, credential);
  }

  /**
   * Change Legal Name or Tax Id of a DID
   * Only the promoter account can do this operation
   *
   * @param {string} did DID
   * @param {object} legalName New Legal Name (if null will not be changed)
   * @param {object} taxId New Tax Id (if null will not be changed)
   * @returns {Promise} Result of the transaction
   */
  async changeLegalNameOrTaxId(did, legalName, taxId) {
    return this.dids.changeLegalNameOrTaxId(this.exec, this.keypair, did, legalName, taxId);
  }

  /**
   * Change DID Info
   * Only the owner account is allowed to do it
   *
   * @param {string} did DID
   * @param {object} info Object containing, optionally the following members
   * name New Name (if null will not be changed)
   * address New address Id (if null or undefined will not be changed)
   * postalCode New postal code (if null or undefined will not be changed)
   * city New city (if null or undefined will not be changed)
   * countryCode New country code (if null or undefined will not be changed)
   * phoneNumber New phone number (if null or undefined will not be changed)
   * website New website (if null or undefined will not be changed)
   * endpoint New endpoint (if null or undefined will not be changed)
   * @returns {Promise} Result of the transaction
   */
  async changeInfo(did, info) {
    if (info.name === undefined) { info.name = null; }
    if (info.address === undefined) { info.address = null; }
    if (info.postalCode === undefined) { info.postalCode = null; }
    if (info.city === undefined) { info.city = null; }
    if (info.countryCode === undefined) { info.countryCode = null; }
    if (info.phoneNumber === undefined) { info.phoneNumber = null; }
    if (info.website === undefined) { info.website = null; }
    if (info.endpoint === undefined) { info.endpoint = null; }
    return this.dids.changeInfo(this.exec,
      this.keypair,
      did,
      info.name,
      info.address,
      info.postalCode,
      info.city,
      info.countryCode,
      info.phoneNumber,
      info.website,
      info.endpoint);
  }

  /**
   * Remove a Credential for a DID
   *
   * @param {string} did DID
   * @param {object} credential Credential Hash (Vec<u8>)
   * @returns {Promise} Result of the transaction
   */
  async removeCredential(did, credential) {
    return this.dids.removeCredential(this.exec, this.keypair, did, credential);
  }

  /**
   * Remove DID.
   *
   * @param {string} did DID
   * @returns {Promise} Result of the transaction
   */
  async removeDid(did) {
    return this.dids.removeDid(this.exec, this.keypair, did);
  }

  /**
   * Get Public Key from Did.
   *
   * @param {string} did DID
   * @returns {Promise} of Transaction
   */
  async getDidData(did) {
    const data = await this.dids.getDidData(this.exec, did);
    data.legal_name = hexToString(data.legal_name);
    data.tax_id = hexToString(data.tax_id);
    return data;
  }

  /**
   * Get Owner Account of a DID.
   *
   * @param {string} did DID
   * @returns {string} Public Key in hex format
   */
  async getOwnerFromDid(did) {
    return this.dids.getOwnerFromDid(this.exec, did);
  }

  /**
   * Get DID from Owner Account.
   *
   * @param {string} owner DID
   * @returns {string} DID
   */
  async getDidFromOwner(owner = null) {
    const execOwner = owner == null ? this.keypair.address : owner;
    return this.dids.getDidFromOwner(this.exec, execOwner);
  }

  /**
   * Get Public Key from Did.
   * Assumes Key Type = 0
   *
   * @param {string} did DID
   * @param {number} typ Public Key type
   * @returns {string} Actual Key
   */
  async getActualDidKey(did, typ = 0) {
    return this.dids.getActualDidKey(this.exec, did, typ);
  }

  /**
   * Get Public Key of specific type from Did.
   *
   * @param {string} did DID
   * @param {number} typ Public Key type
   * @returns {string} Actual Key
   */
  async getActualDidKeyType(did, typ) {
    return this.dids.getActualDidKeyType(this.exec, did, typ);
  }

  /**
   * Retrieves the Hash of a Did Document for a DID
   *
   * @param {string} did DID
   * @returns {string} hash in Base64 format
   */
  async getDidDocHash(did) {
    return this.dids.getDidDocHash(this.exec, did);
  }

  /**
   * Adds a CID.
   * DID to assign the CID. By default is Null and the CID
   * will be assigned to the DID of the sender transaction account
   *
   * @param {string} cid CID
   * @param {string} did DID to assign the new CID (Either null or Must exists)
   * @param {number} max_hids DID to assign the new CID (Must exists)
   * @returns {Promise} of transaction
   */
  async addCid(cid, did = null, max_hids = 0) {
    return this.dids.addCid(this.exec, this.keypair, cid, did, max_hids);
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
  async deleteCid(cid, did = null) {
    return this.dids.deleteCid(this.exec, this.keypair, cid, did);
  }

  /**
   * Get all CIDs.
   * Get the whole CIDs collection, including deleted.
   *
   * @returns {Array} array of CIDs
   */
  async getCIDs() {
    return this.dids.getCIDs(this.exec);
  }

  /**
   * Get all valid CIDs.
   * Get all CIDs that are not deleted.
   *
   * @returns {Array} array of CIDs
   */
  async getValidCIDs() {
    return this.dids.getValidCIDs(this.exec);
  }

  /**
   * Get CID by key.
   * Get CID data is key exists, else return null.
   * Because is an ordered array, we use a binary search
   *
   * @param {string} cid CID
   * @returns {string} CID struct or null
   */
  async getCIDByKey(cid) {
    return this.dids.getCIDByKey(this.exec, cid);
  }

  /**
   * Get all valid CIDs that belongs to a DID.
   * Get a collections of CID data that belongs to a DID.
   * (Can be empty)
   *
   * @param {string} did DID to search
   * @returns {object} CID array
   */
  async getCIDsByDID(did) {
    return this.dids.getCIDsByDID(this.exec, did);
  }

  /**
   * Starts a Process.
   * This must be the first call when a recipe o process is being executed
   * all other execution subprocesses, steps or documents depends on it
   * DID is the DID of the executor of the process
   * Hash is the hash of the process root node
   *
   * @param {string} did DID
   * @param {string} hash Process node hash
   * @returns {Promise} of transaction
   */
  async startProcess(did, hash) {
    return this.process.startProcess(this.exec, this.keypair, did, hash);
  }

  /**
   * Starts a SubProcess.
   * A SubProcess This must be the first call when a recipe o process is being executed
   * all other execution subprocesses, steps or documents depends on it
   * DID is the DID of the executor of the process
   * Hash is the hash of the process root node
   *
   * @param {string} did DID
   * @param {string} hash Process node hash
   * @param {string} parentHash Has of the parent Process or SubProcess
   * @returns {Promise} of transaction
   */
  async startSubprocess(did, hash, parentHash) {
    return this.process.startSubprocess(this.exec, this.keypair, did, hash, parentHash);
  }

  /**
   * Starts a Step.
   * A SubProcess This must be the first call when a recipe o process is being executed
   * all other execution subprocesses, steps or documents depends on it
   * DID is the DID of the executor of the process
   * Hash is the hash of the process root node
   *
   * @param {string} did DID
   * @param {string} hash Process node hash
   * @param {string} parentHash Has of the parent Process or SubProcess
   * @returns {Promise} of transaction
   */
  async startStep(did, hash, parentHash) {
    return this.process.startStep(this.exec, this.keypair, did, hash, parentHash);
  }

  /**
   * Adds a Document.
   * A SubProcess This must be the first call when a recipe o process is being executed
   * all other execution subprocesses, steps or documents depends on it
   * DID is the DID of the executor of the process
   * Hash is the hash of the process root node
   *
   * @param {string} did DID
   * @param {string} hash Process node hash
   * @param {string} parentHash Has of the parent Process or SubProcess
   * @returns {Promise} of transaction
   */
  async addDocument(did, hash, parentHash) {
    return this.process.addDocument(this.exec, this.keypair, did, hash, parentHash);
  }

  /**
   * Adds an Attachment to a Document.
   * A SubProcess This must be the first call when a recipe o process is being executed
   * all other execution subprocesses, steps or documents depends on it
   * DID is the DID of the executor of the process
   * Hash is the hash of the process root node
   *
   * @param {string} did DID
   * @param {string} hash Process node hash
   * @param {string} parentDocHash Has of the parent Process or SubProcess
   * @returns {Promise} of transaction
   */
  async addAttachment(did, hash, parentDocHash) {
    return this.process.addAttachment(this.exec, this.keypair, did, hash, parentDocHash);
  }

  /**
   * Set the Token ID and cost for processes.
   *
   * @param {number} tokenid Token's Id
   * @param {number} cost Cost to be burned by process node
   * @returns {Promise} of transaction
   */
  async setTokenAndCostForProcess(tokenid, cost) {
    return this.process.setTokenAndCostForProcess(this.exec, this.keypair, tokenid, cost);
  }

  /**
   * Get the Token id and cost of process data
   *
   * @returns {Promise} of transaction
   */
  async getTokenIdAndCostProcessData() {
    return this.process.getTokenIdAndCostProcessData(this.exec);
  }

  /**
   * Revokes a node and all its subprocess tree components.
   * A SubProcess This must be the first call when a recipe o process is being executed
   * all other execution subprocesses, steps or documents depends on it
   * DID is the DID of the executor of the process
   * Hash is the hash of the process root node
   *
   * @param {string} hash Process node hash
   * @returns {Promise} of transaction
   */
  async revoke(hash) {
    return this.process.revoke(this.exec, this.keypair, hash);
  }

  /**
   * Obtain the process node data
   *
   * @param {string} hash Process node hash
   * @returns {Promise} of transaction
   */
  async getProcessNode(hash) {
    return this.process.getProcessNode(this.exec, hash);
  }

  /**
   * Resolve the path from root to given node.
   * A SubProcess This must be the first call when a recipe o process is being executed
   * all other execution subprocesses, steps or documents depends on it
   * DID is the DID of the executor of the process
   * Hash is the hash of the process root node
   *
   * @param {string} hash Process node hash
   * @returns {Promise} of transaction
   */
  async pathTo(hash) {
    return this.process.pathTo(this.exec, this.keypair, hash);
  }

  /**
   * Giving any node of a process tree, resolves
   * to the full process tree.
   * A SubProcess This must be the first call when a recipe o process is being executed
   * all other execution subprocesses, steps or documents depends on it
   * DID is the DID of the executor of the process
   * Hash is the hash of the process root node
   *
   * @param {string} hash Process node hash
   * @returns {Promise} of transaction
   */
  async getFullProcessTree(hash) {
    return this.process.getFullProcessTree(this.exec, this.keypair, hash);
  }

  // Functions deling with tokens

  /**
   * Issue a new class of fungible tokens from a public origin.
   * This new token class has no tokens initially and its owner is the origin.
   * The origin must be Signed (Keypair) and the sender must have sufficient funds free.
   * Funds of sender are reserved by `TokenDeposit`.
   *
   * Parameters:
   * - `id`: The identifier of the new token. This must not be currently in use to identify an existing token.
   * - `admin`: The admin of this class of tokens. The admin is the initial address of each member of the token class's admin team.
   * - `minBalance`: The minimum balance of this new token that any single account must have.
   *    If an account's balance is reduced below this, then it collapses to zero.
   *
   * @param {number} id The identifier of the new token.
   * @param {object} admin The admin of this class of tokens.
   * @param {number} minBalance The minimum balance.
   * @returns {Promise} of transaction
   */
  async createToken(id, admin, minBalance) {
    return this.tokens.createToken(this.exec, this.keypair, id, admin, minBalance);
  }

  async createNewToken(id, admin, minBalance) {
    return this.tokens.createNewToken(this.exec, this.keypair, id, admin, minBalance);
  }

  /**
   * Issue a new class of fungible tokens from a privileged origin.
   * This new token class has no tokens initially.
   * The origin must conform to `ForceOrigin`.
   * Unlike `create`, no funds are reserved.
   *
   * - `id`: The identifier of the new token. This must not be currently in use to identify an existing token.
   * - `owner`: The owner of this class of tokens. The owner has full superuser permissions over this token,
   *    but may later change and configure the permissions using `transfer_ownership`and `set_team`.
   * - `isSufficient`: Controls that the account should have sufficient tokens free.
   * - `minBalance`: The minimum balance of this new token that any single account must have.
   *    If an account's balance is reduced below this, then it collapses to zero.
   *
   * @param {number} id The identifier of the new token.
   * @param {object} owner The owner of this class of tokens.
   * @param {bool} isSufficient Controls that the account should have sufficient tokens free.
   * @param {number} minBalance The minimum balance.
   * @returns {Promise} of transaction
   */
  async forceCreateToken(id, owner, isSufficient, minBalance) {
    return this.tokens.forceCreateToken(this.exec, this.keypair, id, owner, isSufficient, minBalance);
  }

  /**
   * Destroy a class of fungible tokens.
   * The origin must conform to `ForceOrigin` or must be Signed and the sender must be the
   * owner of the token `id`.
   *
   * - `id`: The identifier of the token to be destroyed. This must identify an existing token.
   *   Emits `Destroyed` event when successful.
   * - `witness`: The identifier of the token to be destroyed. This must identify an existing token.
   *
   * @param {number} id The identifier of the token.
   * @param {object} witness The identifier of the token to be destroyed.
   * @returns {Promise} of transaction
   */
  async destroyToken(id, witness) {
    return this.tokens.destroyToken(this.exec, this.keypair, id, witness);
  }

  /**
   * Mint tokens of a particular class.
   * The origin must be Signed and the sender must be the Issuer of the token `id`.
   * - `id`: The identifier of the token to have some amount minted.
   * - `beneficiary`: The account to be credited with the minted tokens.
   * - `amount`: The amount of the token to be minted.
   *
   * @param {number} id The identifier of the token.
   * @param {object} beneficiary The account to be credited with the minted tokenss.
   * @param {number} amount The amount of the token to be minted.
   * @returns {Promise} of transaction
   */
  async mintToken(id, beneficiary, amount) {
    return this.tokens.mintToken(this.exec, this.keypair, id, beneficiary, amount);
  }

  /**
   * Reduce the balance of `who` by as much as possible up to `amount` tokens of `id`.
   * Origin must be Signed and the sender should be the Manager of the token `id`.
   * Bails with `BalanceZero` if the `who` is already dead.
   *
   * - `id`: The identifier of the token to have some amount burned.
   * - `who`: The account to be debited from.
   * - `amount`: The maximum amount by which `who`'s balance should be reduced.
   *
   *    Modes: Post-existence of `who`; Pre & post Zombie-status of `who`.
   *
   * @param {number} id The identifier of the token.
   * @param {object} who The account to be debited from.
   * @param {number} amount The maximum amount by which `who`'s balance should be reduced.
   * @returns {Promise} of transaction
   */
  async burnToken(id, who, amount) {
    return this.tokens.burnToken(this.exec, this.keypair, id, who, amount);
  }

  /**
   * Move some tokens from the sender account to another.
   *
   * - `id`: The identifier of the token to have some amount transferred.
   * - `target`: The account to be credited.
   * - `amount`: The amount by which the sender's balance of tokens should be reduced
   * - `target`'s balance increased. The amount actually transferred may be slightly greater in
   *    the case that the transfer would otherwise take the sender balance above zero but below
   *    the minimum balance. Must be greater than zero.
   *
   * Modes: Pre-existence of `target`; Post-existence of sender; Prior & post zombie-status
   * of sender; Account pre-existence of `target`.
   *
   * @param {number} id The identifier of the token.
   * @param {object} target The account to be credited.
   * @param {number} amount The amount by which the sender's balance of tokens should be reduced.
   * @returns {Promise} of transaction
   */
  async transferToken(id, target, amount) {
    return this.tokens.transferToken(this.exec, this.keypair, id, target, amount);
  }

  /**
   * Move some tokens from the sender account to another, keeping the sender account alive.
   *
   * - `id`: The identifier of the token to have some amount transferred.
   * - `target`: The account to be credited.
   * - `amount`: The amount by which the sender's balance of tokens should be reduced
   * - `target`'s balance increased. The amount actually transferred may be slightly greater in
   *    the case that the transfer would otherwise take the sender balance above zero but below
   *    the minimum balance. Must be greater than zero.
   * Modes: Pre-existence of `target`; Post-existence of sender; Prior & post zombie-status
   * of sender; Account pre-existence of `target`.
   *
   * @param {number} id The identifier of the token.
   * @param {object} target The amount actually transferred may be slightly greater.
   * @param {number} amount The amount actually transferred.
   * @returns {Promise} of transaction
   */
  async transferTokenKeepAlive(id, target, amount) {
    return this.tokens.transferTokenKeepAlive(this.exec, this.keypair, id, target, amount);
  }

  /**
   * Move some tokens from one account to another.
   * The sender should be the Admin of the token `id`.
   *
   * - `id`: The identifier of the token to have some amount transferred.
   * - `source`: The account to be debited.
   * - `dest`: The account to be credited.
   * - `amount`: The amount by which the `source`'s balance of tokens should be reduced and
   * - `dest`'s balance increased. The amount actually transferred may be slightly greater in
   * the case that the transfer would otherwise take the `source` balance above zero but
   * below the minimum balance. Must be greater than zero.
   * Modes: Pre-existence of `dest`; Post-existence of `source`; Prior & post zombie-status
   * of `source`; Account pre-existence of `dest`.
   *
   * @param {number} id The identifier of the token.
   * @param {object} source The account to be debited.
   * @param {object} dest The account to be credited.
   * @param {number} amount The amount by which the `source`'s balance of tokens should be reduced.
   * @returns {Promise} of transaction
   */
  async forceTransferToken(id, source, dest, amount) {
    return this.tokens.forceTransferToken(this.exec, this.keypair, id, source, dest, amount);
  }

  /**
   * Disallow further unprivileged transfers from an account.
   * Sender should be the Freezer of the token `id`.
   *
   * - `id`: The identifier of the token to be frozen.
   * - `who`: The account to be frozen.
   *
   * @param {number} id The identifier of the token.
   * @param {string} who The account to be frozen.
   * @returns {Promise} of transaction
   */
  async freezeAccountForToken(id, who) {
    return this.tokens.freezeAccountForToken(this.exec, this.keypair, id, who);
  }

  /**
   * Allow unprivileged transfers from an account again.
   * Sender should be the Admin of the token `id`.
   *
   * - `id`: The identifier of the token to be frozen.
   * - `who`: The account to be unfrozen.
   *
   * @param {number} id The identifier of the token.
   * @param {object} who The account to be unfrozen.
   * @returns {Promise} of transaction
   */
  async unfrozenAccountForToken(id, who) {
    return this.tokens.unfrozenAccountForToken(this.exec, this.keypair, id, who);
  }

  /**
   * Disallow further unprivileged transfers for the token class.
   * Sender should be the Freezer of the token `id`.
   *
   * - `id`: The identifier of the token to be frozen.
   *
   * @param {number} id The identifier of the token.
   * @returns {Promise} of transaction
   */
  async freezeToken(id) {
    return this.tokens.freezeToken(this.exec, this.keypair, id);
  }

  /**
   * Allow unprivileged transfers for the token again.
   * Sender should be the Admin of the token `id`.
   *
   * - `id`: The identifier of the token to be frozen.
   *
   * @param {number} id The identifier of the token.
   * @returns {Promise} of transaction
   */
  async unfrozenToken(id) {
    return this.tokens.unfrozenToken(this.exec, this.keypair, id);
  }

  /**
   * Change the Owner of a token.
   * Sender should be the Owner of the token `id`.
   *
   * - `id`: The identifier of the token.
   * - `owner`: The new Owner of this token.
   *
   * @param {number} id The identifier of the token.
   * @param {object} owner The new Owner of this token.
   * @returns {Promise} of transaction
   */
  async transferTokenOwnership(id, owner) {
    return this.tokens.transferTokenOwnership(this.exec, this.keypair, id, owner);
  }

  /**
   * Change the Issuer, Admin and Freezer of a token.
   * Sender should be the Owner of the token `id`.
   *
   * - `id`: The identifier of the token to be frozen.
   * - `issuer`: The new Issuer of this token.
   * - `admin`: The new Admin of this token.
   * - `freezer`: The new Freezer of this token.
   *
   * @param {number} id The identifier of the token.
   * @param {object} issuer The new Issuer of this token.
   * @param {object} admin The new Admin of this token.
   * @param {object} freezer The new Freezer of this toke.
   * @returns {Promise} of transaction
   */
  async setTokenTeam(id, issuer, admin, freezer) {
    return this.tokens.setTokenTeam(this.exec, this.keypair, id, issuer, admin, freezer);
  }

  /**
   * Set the metadata for a token.
   * Sender should be the Owner of the token `id`.
   *
   * Funds of sender are reserved according to the formula:
   * `MetadataDepositBase + MetadataDepositPerByte * (name.len + symbol.len)` taking into
   * account any already reserved funds.
   *
   * - `id`: The identifier of the token to update.
   * - `name`: The user friendly name of this token. Limited in length by `StringLimit`.
   * - `symbol`: The exchange symbol for this token. Limited in length by `StringLimit`.
   * - `decimals`: The number of decimals this token uses to represent one unit.
   *
   * @param {number} id The identifier of the token.
   * @param {string} name The user friendly name of this token. Limited in length by `StringLimit.
   * @param {string} symbol The exchange symbol for this token. Limited in length by `StringLimit`n.
   * @param {number} decimals The number of decimals this token uses to represent one unit.
   * @returns {Promise} of transaction
   */
  async setTokenMetadata(id, name, symbol, decimals) {
    return this.tokens.setTokenMetadata(this.exec, this.keypair, id, name, symbol, decimals);
  }

  /**
   * Clear the metadata for a token.
   * Sender should be the Owner of the token `id`.
   *
   * Any deposit is freed for the token owner.
   *
   * - `id`: The identifier of the token to clear.
   *
   * @param {number} id The identifier of the token.
   * @returns {Promise} of transaction
   */
  async clearTokenMetadata(id) {
    return this.tokens.clearTokenMetadata(this.exec, this.keypair, id);
  }

  /**
   * Force the metadata for a token to some value.
   *
   * Any deposit is left alone.
   *
   * - `id`: The identifier of the token to update.
   * - `name`: The user friendly name of this token. Limited in length by `StringLimit`.
   * - `symbol`: The exchange symbol for this token. Limited in length by `StringLimit`.
   * - `decimals`: The number of decimals this token uses to represent one unit.
   *
   * @param {number} id The identifier of the token.
   * @param {atring} name The user friendly name of this token. Limited in length by `StringLimit`.
   * @param {string} symbol The exchange symbol for this token. Limited in length by `StringLimit`.
   * @param {number} decimals The number of decimals this token uses to represent one unit.
   * @param {bool} isFrozen The identifier of the token.
   * @returns {Promise} of transaction
   */
  async forceSetTokenMetadata(id, name, symbol, decimals, isFrozen) {
    return this.tokens.forceSetTokenMetadata(this.exec, this.keypair, id, name, symbol, decimals, isFrozen);
  }

  /**
   * Clear the metadata for a token.
   *
   * Any deposit is returned.
   *
   * - `id`: The identifier of the token to clear.
   *
   * @param {number} id The identifier of the token.
   * @returns {Promise} of transaction
   */
  async forceClearTokenMetadata(id) {
    return this.tokens.forceClearTokenMetadata(this.exec, this.keypair, id);
  }

  /**
   * Alter the attributes of a given token.
   *
   * - `id`: The identifier of the token.
   * - `owner`: The new Owner of this token.
   * - `issuer`: The new Issuer of this token.
   * - `admin`: The new Admin of this token.
   * - `freezer`: The new Freezer of this token.
   * - `min_balance`: The minimum balance of this token that any single account must
   *    have. If an account's balance is reduced below this, then it collapses to zero.
   * - `is_sufficient`: Whether a non-zero balance of this token is deposit of sufficient
   *    value to account for the state bloat associated with its balance storage. If set to
   * - `true`, then non-zero balances may be stored without a `consumer` reference (and thus
   *    an ED in the Balances pallet or whatever else is used to control user-account state
   *    growth).
   * - `is_frozen`: Whether this token class is frozen except for permissioned/admin
   *    instructions.
   *
   * @param {number} id The identifier of the token.
   * @param {object} owner The new Owner of this token.
   * @param {object} issuer The new Issuer of this token.
   * @param {object} admin The new Admin of this token.
   * @param {object} freezer The new Freezer of this token.
   * @param {number} minBalance The minimum balance of this token.
   * @param {bool} isSufficient Whether a non-zero balance of this token is deposit of sufficient.
   * @param {bool} isFrozen Whether this token class is frozen except for permissioned/admin instructions.
   * @returns {Promise} of transaction
   */
  async forceTokenStatus(id, owner, issuer, admin, freezer, minBalance, isSufficient, isFrozen) {
    return this.tokens.forceTokenStatus(this.exec, this.keypair, id, owner, issuer, admin, freezer, minBalance, isSufficient, isFrozen);
  }

  /**
   * Approve an amount of token for transfer by a delegated third-party account.
   *
   * Ensures that `TokenApprovalDeposit` worth of `Currency` is reserved from signing account
   * for the purpose of holding the approval. If some non-zero amount of tokens is already
   * approved from signing account to `delegate`, then it is topped up or unreserved to
   * meet the right value.
   *
   * NOTE: The signing account does not need to own `amount` of tokens at the point of
   * making this call.
   *
   * - `id`: The identifier of the token.
   * - `delegate`: The account to delegate permission to transfer token.
   * - `amount`: The amount of token that may be transferred by `delegate`. If there is
   *    already an approval in place, then this acts additively.
   *
   * @param {number} id The identifier of the token.
   * @param {object} delegate The account to delegate permission to transfer token.
   * @param {number} amount The amount of token that may be transferred by `delegate`.
   * @returns {Promise} of transaction
   */
  async approveTokenTransfer(id, delegate, amount) {
    return this.tokens.approveTokenTransfer(this.exec, this.keypair, id, delegate, amount);
  }

  /**
   * Cancel all of some token approved for delegated transfer by a third-party account.
   *
   * Origin must be Signed and there must be an approval in place between signer and `delegate`.
   *
   * Unreserves any deposit previously reserved by `approve_transfer` for the approval.
   *
   * - `id`: The identifier of the token.
   * - `delegate`: The account delegated permission to transfer token.
   *
   * @param {number} id The identifier of the token.
   * @param {object} delegate The account delegated permission to transfer token.
   * @returns {Promise} of transaction
   */
  async cancelApprovalTokenTransfer(id, delegate) {
    return this.tokens.cancelApprovalTokenTransfer(this.exec, this.keypair, id, delegate);
  }

  /**
   * Cancel all of some token approved for delegated transfer by a third-party account.
   * Origin must be either ForceOrigin or Signed origin with the signer being the Admin
   * account of the token `id`.
   *
   * Unreserves any deposit previously reserved by `approve_transfer` for the approval.
   *
   * - `id`: The identifier of the token.
   * - `delegate`: The account delegated permission to transfer token.
   *
   * @param {number} id The identifier of the token.
   * @param {object} owner The new Owner of this token.
   * @param {object} delegate The account delegated permission to transfer token.
   * @returns {Promise} of transaction
   */
  async forceCancelApprovalTokenTransfer(id, owner, delegate) {
    return this.tokens.forceCancelApprovalTokenTransfer(this.exec, this.keypair, id, owner, delegate);
  }

  /**
   * Transfer some token balance from a previously delegated account to some third-party
   * account.
   * Origin must be Signed and there must be an approval in place by the `owner` to the
   * signer.
   *
   * If the entire amount approved for transfer is transferred, then any deposit previously
   * reserved by `approve_transfer` is unreserved.
   *
   * - `id`: The identifier of the token.
   * - `owner`: The account which previously approved for a transfer of at least `amount` and
   *    from which the token balance will be withdrawn.
   * - `destination`: The account to which the token balance of `amount` will be transferred.
   * - `amount`: The amount of tokens to transfer.
   *
   * @param {number} id The identifier of the token.
   * @param {object} owner The account which previously approved for a transfer of at least `amount`.
   * @param {object} destination The account to which the token balance of `amount` will be transferred.
   * @param {number} amount The amount of tokens to transfer.
   * @returns {Promise} of transaction
   */
  async transferTokenApproval(id, owner, destination, amount) {
    return this.tokens.transferTokenApproval(this.exec, this.keypair, id, owner, destination, amount);
  }

  /**
   * Get Token details data.
   *
   * @param {object} exec Executor class.
   * @param {string} id TokenId
   * @returns {Promise} of Transaction
   */
  async getTokenDetails(id) {
    return this.tokens.getTokenDetails(this.exec, id);
  }

  /**
   * Get Token metadata.
   *
   * @param {object} exec Executor class.
   * @param {string} id TokenId
   * @returns {Promise} of Transaction
   */
  async getTokenMetadata(id) {
    return this.tokens.getTokenMetadata(this.exec, id);
  }

  /**
   * Get Account Token data.
   *
   * @param {string} id TokenId
   * @param {string} who Account
   * @returns {Promise} of Transaction
   */
  async getAccountTokenData(id, who) {
    return this.tokens.getAccountTokenData(this.exec, id, who);
  }

  /**
   * Functions dealing with Non-fungible tokens with classes
   */

  /**
   * Issue a new class of non-fungible assets from a public origin.
   * This new asset class has no assets initially and its owner is the origin.
   *
   * The origin must be Signed and the sender must have sufficient funds free.
   *
   * `AssetDeposit` funds of sender are reserved.
   *
   * Parameters:
   * - `classid`: The identifier of the new asset class. This must not be currently in use.
   * - `admin`: The admin of this class of assets. The admin is the initial address of each
   *    member of the asset class's admin team.
   *
   * Emits `Created` event when successful.
   *
   * @param {number} classid The identifier of the new class of tokens.
   * @param {object} admin The admin of this class of tokens.
   * @returns {Promise} of transaction
   */
  async createNFTClass(classid, admin) {
    return this.classNFTs.createNFTClass(this.exec, this.keypair, classid, admin);
  }

  /**
   * Issue a new class of non-fungible assets from a privileged origin.
   * This new asset class has no assets initially.
   *
   * The origin must conform to `ForceOrigin`.
   *
   * Unlike `create`, no funds are reserved.
   *
   * - `classid`: The identifier of the new asset. This must not be currently in use.
   * - `owner`: The owner of this class of assets. The owner has full superuser permissions
   *    over this asset, but may later change and configure the permissions using
   *    `transferOwnership` and `setTeam`.
   *
   * Emits `ForceCreated` event when successful.
   *
   * @param {number} classid The identifier of the new class of tokens.
   * @param {object} owner The admin of this class of tokens.
   * @param {bool} freeHolding The free Holdinfg of this class of tokens.
   * @returns {Promise} of transaction
   */
  async forceCreateNFTClass(classid, owner, freeHolding) {
    return this.classNFTs.forceCreateNFTClass(this.exec, this.keypair, classid, owner, freeHolding);
  }

  /**
   * Destroy a class of non-fungible assets.
   * The origin must conform to `ForceOrigin` or must be `Signed` and the sender must be the
   * owner of the asset `class`.
   *
   * - `classid`: The identifier of the asset class to be destroyed.
   * - `witness`: Information on the instances minted in the asset class. This must be correct.
   *
   * Emits `Destroyed` event when successful.
   *
   * @param {number} classid The identifier of the new class of tokens.
   * @param {object} witness Information on the instances minted in the asset class.
   * @returns {Promise} of transaction
   */
  async destroyNFTClass(classid, witness) {
    return this.classNFTs.destroyNFTClass(this.exec, this.keypair, classid, witness);
  }

  /**
   * Mint an asset instance of a particular class.
   *
   * The origin must be Signed and the sender must be the Issuer of the asset `class`.
   *
   * - `classid`: The class of the asset to be minted.
   * - `instanceid`: The instance value of the asset to be minted.
   * - `owner`: The initial owner of the minted asset.
   *
   * Emits `Issued` event when successful.
   *
   * @param {number} classid The identifier of the new class of tokens.
   * @param {object} instanceid The instance value of the asset to be minted.
   * @param {object} owner The initial owner of the minted asset.
   * @returns {Promise} of transaction
   */
  async mintNFTInstance(classid, instanceid, owner) {
    return this.classNFTs.mintNFTInstance(this.exec, this.keypair, classid, instanceid, owner);
  }

  /**
   * Destroy a single asset instance.
   *
   * Origin must be Signed and the sender should be the Admin of the asset `class`.
   *
   * - `classid`: The class of the asset to be burned.
   * - `instanceid`: The instance of the asset to be burned.
   * - `check_owner`: If `Some` then the operation will fail with `WrongOwner` unless the
   *   asset is owned by this value.
   *
   * Emits `Burned` with the actual amount burned.
   *
   * @param {number} classid The identifier of the new class of tokens.
   * @param {object} instanceid The instance value of the asset to be minted.
   * @param {object} checkOwner Checks Owner.
   * @returns {Promise} of transaction
   */
  async burnNFTInstance(classid, instanceid, checkOwner) {
    return this.classNFTs.burnNFTInstance(this.exec, this.keypair, classid, instanceid, checkOwner);
  }

  /**
   * Move an asset from the sender account to another.
   *
   * Origin must be Signed and the signing account must be either:
   * - the Admin of the asset `class`;
   * - the Owner of the asset `instance`;
   * - the approved delegate for the asset `instance` (in this case, the approval is reset).
   *
   * Arguments:
   * - `classid`: The class of the asset to be transferred.
   * - `instanceid`: The instance of the asset to be transferred.
   * - `dest`: The account to receive ownership of the asset.
   *
   * Emits `Transferred`.
   *
   * @param {number} classid The identifier of the new class of tokens.
   * @param {object} instanceid The instance value of the asset to be minted.
   * @param {object} dest The account to receive ownership of the asset.
   * @returns {Promise} of transaction
   */
  async transferNFTInstance(classid, instanceid, dest) {
    return this.classNFTs.transferNFTInstance(this.exec, this.keypair, classid, instanceid, dest);
  }

  /**
   * Reevaluate the deposits on some assets.
   *
   * Origin must be Signed and the sender should be the Owner of the asset `class`.
   *
   * - `classid`: The class of the asset to be frozen.
   * - `instances`: The instances of the asset class whose deposits will be reevaluated.
   *
   * NOTE: This exists as a best-effort function. Any asset instances which are unknown or
   * in the case that the owner account does not have reservable funds to pay for a
   * deposit increase are ignored. Generally the owner isn't going to call this on instances
   * whose existing deposit is less than the refreshed deposit as it would only cost them,
   * so it's of little consequence.
   *
   * It will still return an error in the case that the class is unknown of the signer is
   * not permitted to call it.
   *
   * @param {number} classid The identifier of the new class of tokens.
   * @param {object} instances The instances of the asset class whose deposits will be reevaluated.
   * @returns {object} true
   */
  async redepositNFTInstances(classid, instances) {
    return this.classNFTs.redepositNFTInstances(this.exec, this.keypair, classid, instances);
  }

  /**
   * Disallow further unprivileged transfer of an asset instance.
   *
   * Origin must be Signed and the sender should be the Freezer of the asset `class`.
   *
   * - `classid`: The class of the asset to be frozen.
   * - `instanceid`: The instance of the asset to be frozen.
   *
   * Emits `Frozen`.
   *
   * @param {number} classid The class of the asset to be frozen.
   * @param {object} instanceid The instance of the asset to be frozen.
   * @returns {Promise} of transaction
   */
  async freezeNFTInstance(classid, instanceid) {
    return this.classNFTs.freezeNFTInstance(this.exec, this.keypair, classid, instanceid);
  }

  /**
   * Re-allow unprivileged transfer of an asset instance.
   *
   * Origin must be Signed and the sender should be the Freezer of the asset `class`.
   *
   * - `classid`: The class of the asset to be thawed.
   * - `instanceid`: The instance of the asset to be thawed.
   *
   * Emits `Thawed`.
   *
   * @param {number} classid The class of the asset to be frozen.
   * @param {object} instanceid The instance of the asset to be frozen.
   * @returns {Promise} of transaction
   */
  async unfrozenNFTInstance(classid, instanceid) {
    return this.classNFTs.unfrozenNFTInstance(this.exec, this.keypair, classid, instanceid);
  }

  /**
   * Disallow further unprivileged transfers for a whole asset class.
   *
   * Origin must be Signed and the sender should be the Freezer of the asset `class`.
   *
   * - `classid`: The asset class to be frozen.
   *
   * Emits `ClassFrozen`.
   *
   * @param {number} classid The class of the asset to be frozen.
   * @returns {Promise} of transaction
   */
  async freezeNFTClass(classid) {
    return this.classNFTs.freezeNFTClass(this.exec, this.keypair, classid);
  }

  /**
   * Re-allow unprivileged transfers for a whole asset class.
   *
   * Origin must be Signed and the sender should be the Admin of the asset `class`.
   *
   * - `classid`: The class to be thawed.
   *
   * Emits `ClassThawed`.
   *
   * @param {number} classid The class of the asset to be frozen.
   * @returns {Promise} of transaction
   */
  async unfrozenNFTClass(classid) {
    return this.classNFTs.unfrozenNFTClass(this.exec, this.keypair, classid);
  }

  /**
   * Change the Owner of an asset class.
   *
   * Origin must be Signed and the sender should be the Owner of the asset `class`.
   *
   * - `classid`: The asset class whose owner should be changed.
   * - `owner`: The new Owner of this asset class.
   *
   * Emits `OwnerChanged`.
   *
   * @param {number} classid The class of the asset to be tranferred.
   * @param {object} owner The new Owner of this asset class.
   * @returns {Promise} of transaction
   */
  async transferOwnershipOfNFTClass(classid, owner) {
    return this.classNFTs.transferOwnershipOfNFTClass(this.exec, this.keypair, classid, owner);
  }

  /**
   * Change the Issuer, Admin and Freezer of an asset class.
   *
   * Origin must be Signed and the sender should be the Owner of the asset `class`.
   *
   * - `classid`: The asset class whose team should be changed.
   * - `issuer`: The new Issuer of this asset class.
   * - `admin`: The new Admin of this asset class.
   * - `freezer`: The new Freezer of this asset class.
   *
   * Emits `TeamChanged`.
   *
   * @param {number} classid The class of the asset to be frozen.
   * @param {object} issuer The new Issuer of this asset class.
   * @param {object} admin The new AdminOwner of this asset class.
   * @param {object} freezer The new Freezer of this asset class.
   * @returns {Promise} of transaction
   */
  async setTeamOfNFTClass(classid, issuer, admin, freezer) {
    return this.classNFTs.setTeamOfNFTClass(this.exec, this.keypair, classid, issuer, admin, freezer);
  }

  /**
   * Approve an instance to be transferred by a delegated third-party account.
   *
   * Origin must be Signed and must be the owner of the asset `instance`.
   *
   * - `classid`: The class of the asset to be approved for delegated transfer.
   * - `instanceid`: The instance of the asset to be approved for delegated transfer.
   * - `delegate`: The account to delegate permission to transfer the asset.
   *
   * Emits `ApprovedTransfer` on success.
   *
   * @param {number} classid The class of the asset to be frozen.
   * @param {object} instanceid The instance of the asset to be approved for delegated transfer..
   * @param {object} delegate The account to delegate permission to transfer the asset.
   * @returns {Promise} of transaction
   */
  async approveTransferOfNFTInstance(classid, instanceid, delegate) {
    return this.classNFTs.approveTransferOfNFTInstance(this.exec, this.keypair, classid, instanceid, delegate);
  }

  /**
   * Cancel the prior approval for the transfer of an asset by a delegate.
   *
   * Origin must be either:
   * - the `Force` origin;
   * - `Signed` with the signer being the Admin of the asset `class`;
   * - `Signed` with the signer being the Owner of the asset `instance`;
   *
   * Arguments:
   * - `classid`: The class of the asset of whose approval will be cancelled.
   * - `instanceid`: The instance of the asset of whose approval will be cancelled.
   * - `maybe_check_delegate`: If `Some` will ensure that the given account is the one to
   *    which permission of transfer is delegated.
   *
   * Emits `ApprovalCancelled` on success.
   *
   * @param {number} classid The class of the asset to be frozen.
   * @param {object} instanceid The instance of the asset to be approved for delegated transfer..
   * @param {object} maybeCheckDelegate Check delegate.
   * @returns {Promise} of transaction
   */
  async cancelApprovalOfTransferOfNFTInstance(classid, instanceid, maybeCheckDelegate) {
    return this.classNFTs.cancelApprovalOfTransferOfNFTInstance(this.exec, this.keypair, classid, instanceid, maybeCheckDelegate);
  }

  /**
   * Alter the attributes of a given asset.
   *
   * Origin must be `ForceOrigin`.
   *
   * - `classid`: The identifier of the asset.
   * - `owner`: The new Owner of this asset.
   * - `issuer`: The new Issuer of this asset.
   * - `admin`: The new Admin of this asset.
   * - `freezer`: The new Freezer of this asset.
   * - `free_holding`: Whether a deposit is taken for holding an instance of this asset
   *   class.
   * - `is_frozen`: Whether this asset class is frozen except for permissioned/admin
   * instructions.
   *
   * Emits `AssetStatusChanged` with the identity of the asset.
   *
   * @param {number} classid The class of the asset.
   * @param {object} owner The new Owner of this asset.
   * @param {object} issuer The new Owner of this asset.
   * @param {object} admin The new Owner of this asset.
   * @param {object} freezer The new Owner of this asset.
   * @param {object} freeHolding Free holding.
   * @param {object} isFrozen Frozen?.
   * @returns {Promise} of transaction
   */
  async forceTokenStatusOfNFTClass(classid, owner, issuer, admin, freezer, freeHolding, isFrozen) {
    return this.classNFTs.forceTokenStatusOfNFTClass(this.exec, this.keypair, classid, owner, issuer, admin, freezer, freeHolding, isFrozen);
  }

  /**
   * Set an attribute for an asset class or instance.
   *
   * Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
   * asset `class`.
   *
   * If the origin is Signed, then funds of signer are reserved according to the formula:
   * `MetadataDepositBase + DepositPerByte * (key.len + value.len)` taking into
   * account any already reserved funds.
   *
   * - `classid`: The identifier of the asset class whose instance's metadata to set.
   * - `maybeInstance`: The identifier of the asset instance whose metadata to set.
   * - `key`: The key of the attribute.
   * - `value`: The value to which to set the attribute.
   *
   * Emits `AttributeSet`.
   *
   * @param {number} classid The class of the asset.
   * @param {object} maybeInstance The identifier of the asset instance whose metadata to set.
   * @param {object} key The key of the attribute.
   * @param {object} value The value to which to set the attribute.
   * @returns {Promise} of transaction
   */
  async setAttributeOfNFT(classid, maybeInstance, key, value) {
    return this.classNFTs.setAttributeOfNFT(this.exec, this.keypair, classid, maybeInstance, key, value);
  }

  /**
   * Clear an attribute for an asset class or instance.
   *
   * Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
   * asset `class`.
   *
   * If the origin is Signed, then funds of signer are reserved according to the formula:
   * `MetadataDepositBase + DepositPerByte * (key.len + value.len)` taking into
   * account any already reserved funds.
   *
   * - `classid`: The identifier of the asset class whose instance's metadata to set.
   * - `maybeInstance`: The identifier of the asset instance whose metadata to set.
   * - `key`: The key of the attribute.
   * - `value`: The value to which to set the attribute.
   *
   * Emits `AttributeSet`.
   *
   * @param {number} classid The class of the asset.
   * @param {object} maybeInstance The identifier of the asset instance whose metadata to set.
   * @param {object} key The key of the attribute.
   * @returns {Promise} of transaction
   */
  async clearAttributeOfNFT(classid, maybeInstance, key) {
    return this.classNFTs.clearAttributeOfNFT(this.exec, this.keypair, classid, maybeInstance, key);
  }

  /**
   * Set the metadata for an asset instance.
   *
   * Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
   * asset `class`.
   *
   * If the origin is Signed, then funds of signer are reserved according to the formula:
   * `MetadataDepositBase + DepositPerByte * data.len` taking into
   * account any already reserved funds.
   *
   * - `classid`: The identifier of the asset class whose instance's metadata to set.
   * - `instanceid`: The identifier of the asset instance whose metadata to set.
   * - `data`: The general information of this asset. Limited in length by `StringLimit`.
   * - `isFrozen`: Whether the metadata should be frozen against further changes.
   *
   * Emits `MetadataSet`.
   *
   * @param {number} classid The class of the asset.
   * @param {number} instanceid The identifier of the asset instance whose metadata to set.
   * @param {object} data The general information of this asset. Limited in length by `StringLimit`.
   * @param {object} isFrozen Frozen?.
   * @returns {Promise} of transaction
   */
  async setMetadataOfNFTInstance(classid, instanceid, data, isFrozen) {
    return this.classNFTs.setMetadataOfNFTInstance(this.exec, this.keypair, classid, instanceid, data, isFrozen);
  }

  /**
   * Clear the metadata for an asset instance.
   *
   * Origin must be either `ForceOrigin` or Signed and the sender should be the Owner of the
   * asset `instance`.
   *
   * Any deposit is freed for the asset class owner.
   *
   * - `classid`: The identifier of the asset class whose instance's metadata to clear.
   * - `instanceid`: The identifier of the asset instance whose metadata to clear.
   *
   * Emits `MetadataCleared`.
   *
   * @param {number} classid The class of the asset.
   * @param {number} instanceid The identifier of the asset instance whose metadata to clear.
   * @returns {Promise} of transaction
   */
  async clearMetadataOfNFTInstance(classid, instanceid) {
    return this.classNFTs.clearMetadataOfNFTInstance(this.exec, this.keypair, classid, instanceid);
  }

  /**
   * Set the metadata for an asset class.
   *
   * Origin must be either `ForceOrigin` or `Signed` and the sender should be the Owner of
   * the asset `class`.
   *
   * If the origin is `Signed`, then funds of signer are reserved according to the formula:
   * `MetadataDepositBase + DepositPerByte * data.len` taking into
   * account any already reserved funds.
   *
   * - `classid`: The identifier of the asset whose metadata to update.
   * - `data`: The general information of this asset. Limited in length by `StringLimit`.
   * - `isFrozen`: Whether the metadata should be frozen against further changes.
   *
   * Emits `ClassMetadataSet`.
   *
   * @param {number} classid The class of the asset.
   * @param {object} data The general information of this asset. Limited in length by `StringLimit`.
   * @param {object} isFrozen Frozen?.
   * @returns {Promise} of transaction
   */
  async setMetadataOfNFTClass(classid, data, isFrozen) {
    return this.classNFTs.setMetadataOfNFTClass(this.exec, this.keypair, classid, data, isFrozen);
  }

  /**
   * Clear the metadata for an asset class.
   *
   * Origin must be either `ForceOrigin` or `Signed` and the sender should be the Owner of
   * the asset `class`.
   *
   * Any deposit is freed for the asset class owner.
   *
   * - `classid`: The identifier of the asset class whose metadata to clear.
   *
   * Emits `ClassMetadataCleared`.
   *
   * @param {number} classid The class of the asset.
   * @returns {Promise} of transaction
   */
  async clearMetadataOfNFTClass(classid) {
    return this.classNFTs.clearMetadataOfNFTClass(this.exec, this.keypair, classid);
  }

  /**
   * Get details of an NFT asset class..
   *
   * @param {string} classid NFT Class Id
   * @returns {object} Class Details
   */
  async getNFTClassDetails(classid) {
    return this.classNFTs.getNFTClassDetails(this.exec, classid);
  }

  /**
   * Chcks if an NFT instance is owned by an account.
   *
   * @param {string} who Account
   * @param {string} classid Class Id
   * @param {string} instanceid Instance Id
   * @returns {object} Class Details
   */
  async checkNFTOwnership(who, classid, instanceid) {
    return this.classNFTs.checkNFTOwnership(this.exec, who, classid, instanceid);
  }

  /**
   * Get all Non-Fungible Tokens of the system.
   *
   * @returns {object} Class Details
   */
  async getAllNFTs() {
    return this.classNFTs.getAllNFTs(this.exec);
  }

  /**
   * The assets held by any given account; set out this way so that assets owned by a single
   * account can be enumerated.
   *
   * @param {string} who Account
   * @returns {object} Class Details
   */
  async getNFTsFromAccount(who) {
    return this.classNFTs.getNFTsFromAccount(this.exec, who);
  }

  /**
   * The tokens in existence and their ownership details.
   *
   * @param {string} classid Class Id
   * @param {string} instanceid Instance Id
   * @returns {object} Class Details
   */
  async getNFTOwner(classid, instanceid) {
    return this.classNFTs.getNFTOwner(this.exec, classid, instanceid);
  }

  /**
   * Metadata of an asset class.
   *
   * @param {string} classid Class Id
   * @returns {object} Class Details
   */
  async getNFTClassMetadata(classid) {
    return this.classNFTs.classMetadataOf(this.exec, classid);
  }

  /**
   * Metadata of an asset instance.
   *
   * @param {string} classid Class Id
   * @param {string} instanceid Instance Id
   * @returns {object} Class Details
   */
  async getNFTInstanceMetadata(classid, instanceid) {
    return this.classNFTs.getNFTInstanceMetadata(this.exec, classid, instanceid);
  }

  /**
   * Attribute of an asset class/instance.
   *
   * @param {string} classid Class Id
   * @param {string} instanceid Instance Id
   * @param {string} key Attribute key
   * @returns {object} Class Details
   */
  async getNFTAttribute(classid, instanceid, key) {
    return this.classNFTs.getNFTAttribute(this.exec, classid, instanceid, key);
  }

  /**
   * Subscribe to register events
   *
   * @param {string} eventMethod Event to listen to
   * @returns {Promise} Result of the transaction
   */
  async wait4Event(eventMethod) {
    return this.exec.wait4Event(eventMethod);
  }
};
