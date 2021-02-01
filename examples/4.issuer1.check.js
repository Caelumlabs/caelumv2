const Caelum = require('../src/index')
const caelum = new Caelum('https://api.bigchaindb.caelumapp.com/api/v1/')
const chalk = require('chalk')
const log = console.log
const orgJson = require('./orgs/issuer1.json')

const main = async () => {
  // Add basic DID and applications.
  const org = await caelum.loadOrganization(orgJson.createTxId, orgJson.did)
  await org.loadCertificates()
  await org.setKeys(orgJson.mnemonic)

  log('\n' + chalk.grey('Empresa : ') + chalk.cyan('Caelum Labs'))
  log(chalk.grey(' - DID  : ') + chalk.magenta(org.did))
  const cert = org.certificates[0]
  log(chalk.grey(' - CID  : ') + chalk.magenta(cert.certificateId))
  log(chalk.grey(' - Title  : ') + chalk.magenta(cert.subject.title))
  process.exit()
}

main()
