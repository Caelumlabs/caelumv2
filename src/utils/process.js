/* eslint-disable no-async-promise-executor */

const Utils = require('./utils');
const { bufferToU8a } = require('@polkadot/util');

// Debug
const debug = require('debug')('did:debug:sub');
/**
 * Functions dealing with receipes and processes.
 */
module.exports = class Process {
  /**
   * Starts a Process.
   * This must be the first call when a recipe o process is being executed
   * all other execution subprocesses, steps or documents depends on it
   * DID is the DID of the executor of the process
   * Hash is the hash of the process root node
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} did DID
   * @param {string} hash Process node hash
   * @returns {Promise} of transaction
   */
  async startProcess(exec, keypair, did, hash) {
    // Convert hash string to hex
    const hexHash = Utils.base64ToHex(hash);
    // Convert did string to hex
    const transaction = await exec.api.tx.idSpace.startProcess(hexHash, did);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Starts a SubProcess.
   * A SubProcess This must be the first call when a recipe o process is being executed
   * all other execution subprocesses, steps or documents depends on it
   * DID is the DID of the executor of the process
   * Hash is the hash of the process or subprocess parent
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} did DID
   * @param {string} hash Process node hash
   * @param {string} parentHash Has of the parent Process or SubProcess
   * @returns {Promise} of transaction
   */
  async startSubprocess(exec, keypair, did, hash, parentHash) {
    // Convert hash string to hex
    const hexHash = Utils.base64ToHex(hash);
    // Convert hash string to hex
    const parentHexHash = Utils.base64ToHex(parentHash);
    const transaction = await exec.api.tx.idSpace.startSubprocess(hexHash, did, parentHexHash);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Starts a Step.
   * A Step This must be the first call when a recipe o process is being executed
   * all other execution subprocesses, steps or documents depends on it
   * DID is the DID of the executor of the process
   * Hash is the hash of the process or subprocess parent
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} did DID
   * @param {string} hash Process node hash
   * @param {string} parentHash Has of the parent Process or SubProcess
   * @returns {Promise} of transaction
   */
  async startStep(exec, keypair, did, hash, parentHash) {
    // Convert hash string to hex
    const hexHash = Utils.base64ToHex(hash);
    // Convert hash string to hex
    const parentHexHash = Utils.base64ToHex(parentHash);
    const transaction = await exec.api.tx.idSpace.startStep(hexHash, did, parentHexHash);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Adds a Documet to anode (Process, SubProcess or Step)..
   * A Step This must be the first call when a recipe o process is being executed
   * all other execution subprocesses, steps or documents depends on it
   * DID is the DID of the executor of the process
   * Hash is the hash of the process or subprocess parent
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} did DID
   * @param {string} hash Process node hash
   * @param {string} parentHash Has of the parent Process or SubProcess
   * @returns {Promise} of transaction
   */
  async addDocument(exec, keypair, did, hash, parentHash) {
    // Convert hash string to hex
    const hexHash = Utils.base64ToHex(hash);
    // Convert hash string to hex
    const parentHexHash = Utils.base64ToHex(parentHash);
    const transaction = await exec.api.tx.idSpace.addDocument(hexHash, did, parentHexHash);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Adds an Attachment to a  Document.
   * A Step This must be the first call when a recipe o process is being executed
   * all other execution subprocesses, steps or documents depends on it
   * DID is the DID of the executor of the process
   * Hash is the hash of the process or subprocess parent
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} did DID
   * @param {string} hash Process node hash
   * @param {string} parentHash Has of the parent Process or SubProcess
   * @returns {Promise} of transaction
   */
  async addAttachment(exec, keypair, did, hash, parentHash) {
    // Convert hash string to hex
    const hexHash = Utils.base64ToHex(hash);
    // Convert hash string to hex
    const parentHexHash = Utils.base64ToHex(parentHash);
    const transaction = await exec.api.tx.idSpace.addAttachment(hexHash, did, parentHexHash);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Set the Token ID and cost for processes.
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {number} tokenid Token's Id
   * @param {number} cost Cost to be burned by process node
   * @returns {Promise} of transaction
   */
  async setTokenAndCostForProcess(exec, keypair, tokenid, cost) {
    const transaction = await exec.api.tx.idSpace.setTokenAndCostForProcess(tokenid, cost);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Revokes a node and all its process subtree.
   * A Step This must be the first call when a recipe o process is being executed
   * all other execution subprocesses, steps or documents depends on it
   * DID is the DID of the executor of the process
   * Hash is the hash of the process or subprocess parent
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} hash Process node hash
   * @returns {Promise} of transaction
   */
  async revoke(exec, keypair, hash) {
    // Convert hash string to hex
    const hexHash = Utils.base64ToHex(hash);
    const transaction = await exec.api.tx.idSpace.revoke(hexHash);
    return await exec.execTransaction(keypair, transaction);
  }

  /**
   * Resolve the full path from root to the provided node hash
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} hash Process node hash
   * @returns {Promise} of transaction
   */
  async pathTo(exec, keypair, hash) {
    // Convert hash string to hex
    const hexHash = Utils.base64ToHex(hash);
    const transaction = await exec.api.tx.idSpace.pathTo(hexHash);
    await exec.execTransaction(keypair, transaction);
    const pathEvent = await exec.wait4Event('ProcessPath');
    const path = [];
    pathEvent[1].split('x')[1].match(/.{1,2}/g).forEach((el) => path.push(String.fromCharCode(parseInt(el, 16))));
    return JSON.parse(path.join(''));
  }

  /**
   * Resolves to the full process tree
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} hash Process node hash
   * @returns {Promise} of transaction
   */
  async getFullProcessTree(exec, keypair, hash) {
    // Convert hash string to hex
    const hexHash = Utils.base64ToHex(hash);
    const transaction = await exec.api.tx.idSpace.getFullProcessTree(hexHash);
    await exec.execTransaction(keypair, transaction);
    const pathEvent = await exec.wait4Event('ProcessPath');
    const path = [];
    pathEvent[1].split('x')[1].match(/.{1,2}/g).forEach((el) => path.push(String.fromCharCode(parseInt(el, 16))));
    return JSON.parse(path.join(''));
  }

  /**
   * Obtain the process node data
   *
   * @param {object} exec Executor class.
   * @param {string} hash Process node hash
   * @returns {Promise} of transaction
   */
  async getProcessNode(exec, hash) {
    // Convert hash string to hex
    const hexHash = Utils.base64ToHex(hash);
    return await exec.api.query.idSpace.processTree(hexHash);
  }

  /**
   * Get the Token id and cost of process data
   *
   * @param {object} exec Executor class.
   * @returns {Promise} of transaction
   */
  async getTokenIdAndCostProcessData(exec) {
    return await exec.api.query.idSpace.tokenAndCostForProcess();
  }
};
