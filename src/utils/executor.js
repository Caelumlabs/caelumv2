/* eslint-disable no-async-promise-executor */
'use strict'
const BlockchainInterface = require('./blockchain')
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api')
const Utils = require('./utils')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const { bufferToU8a } = require('@polkadot/util')
const SubstrateBlockchainTypes = require('./types')
const util = require('util')

// Debug
var debug = require('debug')('did:debug:sub')
/**
 * Executes transactions against Substrate blockchain.
 */
module.exports = class Executor {
  /**
   * Constructor
   *
   * @param {string} server Web Sockets Provider, e.g. 'ws://127.0.0.1:9944/'
   */
  constructor (server) {
    this.providerWS = server
    this.api = false
  }

  /**
   * Connect with the Blockchain.
   *
   * @returns {boolean} success
   */
  async connect () {
    debug('connecting to ' + this.providerWS)

    this.provider = new WsProvider(this.providerWS)

    // Get the types defined
    const types = SubstrateBlockchainTypes
    types.provider = this.provider
    this.api = await ApiPromise.create(types)

    await cryptoWaitReady()

    const [chain, nodeName, nodeVersion] = await Promise.all([
      this.api.rpc.system.chain(),
      this.api.rpc.system.name(),
      this.api.rpc.system.version()
    ])

    debug(`Connected to chain ${chain} - ${nodeName} v${nodeVersion}`)
    return this.api
  }

  /**
   * Disconnect from Blockchain.
   */
  disconnect () {
    this.provider.unsubscribe()
    this.provider.disconnect()
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
          if (event.section === 'idSpace' && event.method === eventMethod) {
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
  async execTransaction (keypair, transaction) {
    return new Promise(async (resolve) => {
      let result = true
      await transaction.signAndSend(keypair, ({ status, events }) => {
        debug('Status -> ', this.getStatus(status))
        events.forEach(({ event: { method, section } }) => debug('Section ', section, 'Method ', method ))
        if (status.isInBlock || status.isFinalized) {
          const errors = events.filter(({ event: { method, section } }) =>
            section === 'system' && method === 'ExtrinsicFailed'
          )
          if (errors.length > 0) {
            errors.forEach(({ event: { data: [error, info] } }) => {
              if (error.isModule) {
                const { documentation, method, section } = this.api.registry.findMetaError(error.asModule)
                console.log(`${section}.${method}: ${documentation.join(' ')}`)
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

  getStatus (status) {
  if (status.isFuture) { return 'Is Future'}
  if (status.isReady) {return 'Is Ready'}
  if (status.isBroadcast) { return 'Is broadcast'}
  if (status.isInBlock) { return 'Is Inblock'}
  if (status.isRetracted) {return 'Is retracted'}
  if (status.isFinalityTimeout) { return 'Is FinalityTimeout'}
  if (status.isFinalized) {return 'Is finalized'}
  if (status.isUsurped) { return 'Is Usurped'}
  if (status.isDropped) {return 'Is dropped'}
  if (status.isInvalid) {return 'Is invalid'}
  return 'Else'
  }

  errorType (error) {
  if (error.isOther) { return 'isOther' }
  if (error.isCannotLookup) { return 'isCannotLookup' }
  if (error.isBadOrigin) { return 'isBadOrigin' }
  if (error.isModule) { return 'isModule' }
  if (error.isConsumerRemaining) { return 'isConsumerRemaining' }
  if (error.isNoProviders) { return 'isNoProviders' }
  if (error.isToken) { return 'isToken' }
  if (error.isArithmetic) { return 'isArithmetic' }
  return 'Other'
  }

  async executeTransaction (keypair, transaction) {
      return new Promise(async (resolve) => {
        await transaction
              .signAndSend(keypair, ({ status, events, dispatchError }) => {
              // status would still be set, but in the case of error we can shortcut
              // to just check it (so an error would indicate InBlock or Finalized)
              if (dispatchError) {
                console.log('DispatchError')
                if (dispatchError.isModule) {
                  // for module errors, we have the section indexed, lookup
                  const decoded = this.api.registry.findMetaError(dispatchError.asModule);
                  const { documentation, name, section } = decoded;

                  console.log(`${section}.${name}: ${documentation.join(' ')}`);
                } else {
                  // Other, CannotLookup, BadOrigin, no extra info
                  console.log(dispatchError.toString());
                }
                resolve(false)
              }
              console.log('No dispatch error')
              resolve(true)
        })
      })
  }
}
