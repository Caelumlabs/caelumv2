const Caelum = require('../src/index')
const caelum = new Caelum('https://api.bigchaindb.caelumapp.com/api/v1/')
const chalk = require('chalk')
const log = console.log

const addCaelum = async () => {
  // Add basic DID and applications.
  const org = await caelum.newOrganization()
  await org.setKeys()
  await org.addApplication('diddocument')
  await org.addApplication('applications')
  await org.addApplication('verified')
  const did = await org.saveOrganization()

  // Save information. Add Info.
  await org.setSubject({ legalName: 'Caelum Corp', network: 'tabit', countryCode: 'ES', taxID: 'B67474304'})
  await org.saveInformation()

  /*
  // Add first certificate
  await org.addCertificate({
    title: 'Caelum Provider',
    description: 'Know provider',
    url: 'https://caelumlabs.com',
    logo: 'https://caelumlabs.com/wp-content/uploads/2019/05/caelumlabs-logo.svg',
    learningAchievement: 'To be working with Caelum Labs'
  })
  */
  log('\n' + chalk.grey('Empresa : ') + chalk.cyan('Caelum Labs'))
  log(chalk.grey(' - DID  : ') + chalk.magenta(did))
  log(chalk.grey(' - TxID : ') + chalk.magenta(org.createTxId))
  log(chalk.grey(' - Keys : ') + chalk.magenta(org.keys.mnemonic))
}

const addProv1 = async () => {
  // Add basic DID and applications.
  const org = await caelum.newOrganization()
  await org.setKeys()
  await org.addApplication('diddocument')
  await org.addApplication('applications')
  await org.addApplication('verified')
  const did = await org.saveOrganization()

  // Save information. Add Info.
  await org.setSubject({ legalName: 'BCN developers', network: 'tabit', countryCode: 'ES', taxID: 'B67474304'})
  await org.saveInformation()

  log('\n' + chalk.grey('Empresa : ') + chalk.cyan('BCN developers'))
  log(chalk.grey(' - DID  : ') + chalk.magenta(did))
  log(chalk.grey(' - TxID : ') + chalk.magenta(org.createTxId))
  log(chalk.grey(' - Keys : ') + chalk.magenta(org.keys.mnemonic))
}
const main = async () => {
  await addCaelum()
  // await addProv1()
  process.exit()
}

main()
