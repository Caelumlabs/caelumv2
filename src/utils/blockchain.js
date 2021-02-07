'use strict'

/**
 * Javascript Class to interact with Database.
 */
module.exports = class BlockchainInterface {
  constructor () {
    if (!this.connect) {
      /* istanbul ignore next */
      throw new Error('Blockchain must have function `connect`!')
    } else if (!this.setKeyring) {
      /* istanbul ignore next */
      throw new Error('Blockchain must have function `setKeyring`!')
    } else if (!this.disconnect) {
      /* istanbul ignore next */
      throw new Error('Blockchain must have function `disconnect`!')
    } else if (!this.registerDid) {
      /* istanbul ignore next */
      throw new Error('Blockchain must have function `registerDid`!')
    } else if (!this.getActualDidKey) {
      /* istanbul ignore next */
      throw new Error('Blockchain must have function `getActualDidKey`!')
    } else if (!this.registerDidDocument) {
      /* istanbul ignore next */
      throw new Error('Blockchain must have function `registerDidDocument`!')
    } else if (!this.getDidDocHash) {
      /* istanbul ignore next */
      throw new Error('Blockchain must have function `getDidDocHash`!')
    } else if (!this.rotateKey) {
      /* istanbul ignore next */
      throw new Error('Blockchain must have function `rotateKey`!')
    }
  }
}
