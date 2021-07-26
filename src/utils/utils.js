'use strict'

class Utils {
  /**
   * Converts Hex to Base64
   *
   * @param {string} str source
   * @returns {object} Base64 encoded from Hex
   */
  static hexToBase64 (str) {
    return Buffer.from(str, 'hex').toString('utf8')
  }

  /**
   * Converts Base64 to Hex
   *
   * @param {string} str source
   * @returns {object} Hex encoded from Base64
   */
  static base64ToHex (str) {
    return Buffer.from(str, 'utf8').toString('hex')
  }

  /**
   * Converts to UTF8 Array
   *
   * @param {string} str source
   * @returns {object} UTF8 Array
   */
  static toUTF8Array (str) {
    const buffer = Buffer.from(str, 'utf8')
    return Array.prototype.slice.call(buffer, 0)
  }

  /**
   * Verify correct hex string
   *
   * @param {string} str source
   * @returns {bool} True if string is correct 
   */
  static verifyHexString (str) {
    let pattern = null
    if (str.slice(0, 2) === '0X') {
      pattern = /[A-F0-9]/gi
    } else {
      if (str.slice(0, 2) === '0x') {
        pattern = /[a-f0-9]/gi
      } else {
        return false
      }
    }
    const result = str.slice(2).match(pattern)
    if (result.length !== str.length - 2) {
      return false
    }
    return true
  }
}

module.exports = Utils
