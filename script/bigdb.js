/* eslint-disable quote-props */
const bip39 = require('bip39')
const driver = require('bigchaindb-driver')

const API_PATH = 'https://api.bigchaindb.caelumapp.com/api/v1/'
const passphrase = 'coast swear around student dune involve poem gas bless park polar rely'

/**
 * Main
 */
async function main () {
  // Create a new keypair.
  const bip39seed = await bip39.mnemonicToSeed(passphrase)
  const seed = bip39seed.slice(0, 32)
  console.log('SEED: ' + typeof seed, seed)
  const alice = new driver.Ed25519Keypair(new Uint8Array(seed))
  console.log(alice)
  console.log(typeof alice.publicKey, alice.privateKey)
  const assetdata = {
    hash: {
      cid: '536561asnjkcdhsaic7293034',
      signature: '23767436427842678346723Lab',
      issuer: 'QmatASNEWYqJSV9mPxrNDyGrt2kGkk8H7L98pzo7ci1e1a'
    }
  }
  const metadata = {
    datetime: new Date().toString()
  }
  // Construct a transaction payload
  const tx = driver.Transaction.makeCreateTransaction(
    assetdata, metadata,
    // A transaction needs an output
    [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(alice.publicKey))], alice.publicKey
  )

  // Sign the transaction with private keys
  console.log(tx)
  const txSigned = driver.Transaction.signTransaction(tx, alice.privateKey)
  console.log(txSigned)
  // Send the transaction off to BigchainDB
  const conn = new driver.Connection(API_PATH)

  conn.postTransactionCommit(txSigned)
    .then(async retrievedTx => {
      console.log('Transaction', retrievedTx.id, 'successfully posted.')
      const res = await conn.searchAssets('536561asnjkcdhsaic7293034')
      console.log(res)
    })
    .catch(e => console.log(e))
}

main()
