const Caelum = require('../src/index')
const caelum = new Caelum('https://api.bigchaindb.caelumapp.com/api/v1/')
const chalk = require('chalk')
const log = console.log
const jsonOrg1 = require('./orgs/org1.json')
const jsonOrg2 = require('./orgs/org2.json')
const jsonOrg3 = require('./orgs/org3.json')

const logTags = (certs) => {
  for (const cert of certs) {
    log(chalk.grey(' - Tag : ') + chalk.magenta(cert.certificate.subject.title) +
      ' - ' + (cert.status === 'issued' ? chalk.green(cert.status) : chalk.red(cert.status)) +
      ' - ' + (cert.accepted === 'accepted' ? chalk.green(cert.accepted) : chalk.red(cert.accepted)))
  }
}

const main = async () => {
  // BBHotels
  const org1 = await caelum.loadOrganization(jsonOrg1.createTxId, jsonOrg1.did)
  await org1.setKeys(jsonOrg1.mnemonic)
  let tags = await org1.searchCertificates()
  log('\n' + chalk.grey('Empresa : ') + chalk.cyan(org1.subject.legalName))
  logTags(tags)

  // Petit L.
  const org2 = await caelum.loadOrganization(jsonOrg2.createTxId, jsonOrg2.did)
  await org2.setKeys(jsonOrg2.mnemonic)
  tags = await org2.searchCertificates()
  log('\n' + chalk.grey('Empresa : ') + chalk.cyan(org2.subject.legalName))
  logTags(tags)

  // Xarcuteria
  const org3 = await caelum.loadOrganization(jsonOrg3.createTxId, jsonOrg3.did)
  await org3.setKeys(jsonOrg3.mnemonic)
  tags = await org3.searchCertificates()
  log('\n' + chalk.grey('Empresa : ') + chalk.cyan(org3.subject.legalName))
  logTags(tags)

  process.exit()
}

main()
