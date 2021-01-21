const bip39 = require('bip39')
const driver = require('bigchaindb-driver')

/**
 * Javascript Class to interact with Zenroom.
 */
module.exports = class BigchainDB {
  /**
   * Calculate DID
   * @param {object} subject passphrase to be used to calculate DID (string or JSON)
   * @returns {string} DID
   */
  static async getKeys (subject) {
    return new Promise((resolve, reject) => {
      let passphrase

      if (typeof subject === 'boolean' && subject === false) {
        passphrase = bip39.generateMnemonic()
      } else if (typeof subject === 'object') {
        try { passphrase = JSON.stringify(subject) } catch { reject(new Error('calculateDid - Invalid JSON fomat')) }
      } else if (typeof subject === 'string' && subject.length > 10 && subject.length < 512) {
        passphrase = typeof subject === 'object' ? JSON.stringify(subject) : subject
      } else {
        reject(new Error('subject string should be larger than 10 characters and shorten than 255'))
      }
      bip39.mnemonicToSeed(passphrase)
        .then((bip39seed) => {
          const seed = bip39seed.slice(0, 32)
          const keyPair = new driver.Ed25519Keypair(new Uint8Array(seed))
          keyPair.seed = seed
          keyPair.mnemonic = passphrase
          resolve(keyPair)
        })
    })
  }

  /**
   * create App DID
   * @param {object} subject passphrase to be used to calculate DID (string or JSON)
   * @returns {string} DID
   */
  static async createApp (conn, keypair, assetdata) {
    return new Promise((resolve, reject) => {
      const metadata = {
        datetime: new Date().toString(),
        proof: ''
      }
      const tx = driver.Transaction.makeCreateTransaction(
        assetdata, metadata,
        [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(keypair.publicKey))], keypair.publicKey
      )
      const txSigned = driver.Transaction.signTransaction(tx, keypair.privateKey)
      conn.postTransactionCommit(txSigned)
        .then(async retrievedTx => {
          resolve(retrievedTx.id)
        })
        .catch(e => console.log(e))
    })
  }

  /**
   * Transfer an asset
   * @param {object} subject passphrase to be used to calculate DID (string or JSON)
   * @returns {string} DID
   */
  static async transferAsset (conn, txCreated, oldOwner, metadata, newOwner) {
    return new Promise((resolve) => {
      const updateInfo = {
        subject: metadata,
        datetime: new Date().toString()
      }
      const output = driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(newOwner.publicKey))
      const condition = [{ tx: txCreated, output_index: 0 }]
      try {
        const createTranfer = driver.Transaction.makeTransferTransaction(condition, [output], updateInfo)
        const signedTransfer = driver.Transaction.signTransaction(createTranfer, oldOwner.privateKey)
        conn.postTransactionCommit(signedTransfer)
          .then(async retrievedTx => {
            resolve(retrievedTx.id)
          })
          .catch(e => console.log(e))
      } catch (e) {
        console.log(e)
      }
    })
  }

  static async getTransaction (conn, txId) {
    return new Promise((resolve) => {
      conn.getTransaction(txId)
        .then(res => {
          resolve(res)
        })
    })
  }

  static async search (conn, search) {
    return new Promise((resolve) => {
      conn.searchAssets(search)
        .then(res => {
          resolve(res)
        })
    })
  }

  static async listTransactions (conn, assetId) {
    return new Promise((resolve) => {
      conn.listTransactions(assetId)
        .then(res => {
          resolve(res)
        })
    })
  }
}
