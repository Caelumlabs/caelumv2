/* eslint-disable no-async-promise-executor */
'use strict'

// Debug
var debug = require('debug')('did:debug:sub')
/**
 * Functions dealing with token balance.
 */
module.exports = class Balance {
  /**
   * Balance of Tokens
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} address Address to send tokens to
   * @returns {*} balance and nonce
   */
  async addrState (exec, keypair, address) {
    return new Promise(async (resolve) => {
      const addressTo = (address === false) ? keypair.address : address
      const { nonce, data: balance } = await exec.api.query.system.account(addressTo)
      resolve({ balance, nonce })
    })
  }

  /**
   * Transfer Tokens
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} addrTo Address to send tokens to
   * @param {*} amount Amount of tokens
   * @returns {Promise} of sending tokens
   */
  async transferTokens (exec, keypair, addrTo, amount) {
    return new Promise(async (resolve) => {
      const unsub = await exec.api.tx.balances
        .transfer(addrTo, amount)
        .signAndSend(keypair, (result) => {
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
   * Transfer Tokens without paying fees
   *
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} addrTo Address to send tokens to
   * @param {*} amount Amount of tokens
   * @returns {Promise} of sending tokens
   */
  async transferTokensNoFees (exec, keypair, addrTo, amount) {
    return new Promise(async (resolve) => {
      const unsub = await exec.api.tx.balances
        .transferNoFees(addrTo, amount)
        .signAndSend(keypair, (result) => {
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
   * @param {object} exec Executor class.
   * @param {object} keypair Account's keypair
   * @param {string} addrTo Address to send tokens to
   * @returns {Promise} of sending tokens
   */
  async transferAllTokens (exec, keypair, addrTo) {
    const current = await this.addrState(exec, keypair, false)
    const amount = current.balance.free
    const info = await exec.api.tx.balances.transfer(addrTo, amount).paymentInfo(keypair)
    if (info.partialFee.sub(amount) > 0) {
      return this.transferTokens(exec, keypair, addrTo, info.partialFee.sub(amount))
    } 
    return this.transferTokens(exec, keypair, addrTo, amount.sub(info.partialFee))
  }
}
