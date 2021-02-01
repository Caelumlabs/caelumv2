const Caelum = require('../src/index')
const caelum = new Caelum('https://api.bigchaindb.caelumapp.com/api/v1/')
const chalk = require('chalk')
const log = console.log
const orgJson = require('./orgs/issuer1.json')

const main = async () => {
  // Add basic DID and applications.
  const org = await caelum.loadOrganization(orgJson.createTxId, orgJson.did)
  await org.setKeys(orgJson.mnemonic)

  log('\n' + chalk.grey('Empresa : ') + chalk.cyan('Caelum Labs'))
  log(chalk.grey(' - DID  : ') + chalk.magenta(org.did))
  log(chalk.grey(' - TxID : ') + chalk.magenta(org.createTxId))
  log(chalk.grey(' - Genesis : ') + chalk.magenta(org.keys.mnemonic))
  process.exit()
}

main()