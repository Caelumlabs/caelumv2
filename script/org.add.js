const Caelum = require('../src/index')
const caelum = new Caelum('https://api.bigchaindb.caelumapp.com/api/v1/')
const chalk = require('chalk')
const log = console.log

const transfer = async (org) => {
  const newWallet = await caelum.getKeys()
  console.log('Mnemonic : ' + newWallet.mnemonic)
  console.log('Idspace : ' + newWallet.publicKey)

  // Save information. Add Info.
  await org.setSubject({ legalName: 'Caelum Corp', network: 'tabit', countryCode: 'ES', taxID: 'B67474304'})
  await org.saveInformation(newWallet.publicKey)

  // New Diddocument
  const doc = caelum.newDidDoc(org.did)
  doc.addService('api', 'serviceApi', 'http://test.com')
  await org.saveDidDocument(doc.subject, newWallet.publicKey)

  // 3. Update and Transfer Verified DIDs to new Wallet
  await org.saveVerified(org.did, newWallet.publicKey)

  // 4. Craete First Application: hashing
  await org.addHashingApp(newWallet.publicKey, newWallet)
  return newWallet
}

const addCaelum = async () => {
  // Add basic DID and applications.
  const org = await caelum.newOrganization()
  await org.setKeys()
  console.log('Genesis : ' + org.keys.publicKey)
  await org.addApplication('diddocument')
  await org.addApplication('applications')
  await org.addApplication('verified')
  const did = await org.saveOrganization('Caelum Innovation SL', 'B67101519')

  const newWallet = await transfer(org)
  // await this.context.info.org.setKeys(this.context.info.wallet.mnemonic)

  log('\n' + chalk.grey('Empresa : ') + chalk.cyan('Caelum Labs'))
  log(chalk.grey(' - DID  : ') + chalk.magenta(did))
  log(chalk.grey(' - TxID : ') + chalk.magenta(org.createTxId))
  log(chalk.grey(' - Genesis : ') + chalk.magenta(org.keys.mnemonic))
  log(chalk.grey(' - Idspace : ') + chalk.magenta(newWallet.mnemonic))
}

const main = async () => {
  await addCaelum()
  process.exit()
}

main()
