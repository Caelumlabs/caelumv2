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
}

module.exports = Utils
