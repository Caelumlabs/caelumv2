const Caelum = require('../src/index')
const caelum = new Caelum('https://api.bigchaindb.caelumapp.com/api/v1/')
const chalk = require('chalk')
const log = console.log
const fs = require('fs')

const main = async () => {
  // Add basic DID and applications.
  const org = await caelum.newOrganization()
  await org.setKeys()
  await org.addApplication('diddocument')
  await org.addApplication('applications')
  await org.addApplication('verified')
  const did = await org.saveOrganization('Generalitat de Catalunya', 'B67101519', 'ES', 'tabit')

  log('\n' + chalk.grey('Empresa : ') + chalk.cyan('Generalitat de Catalunya'))
  log(chalk.grey(' - DID  : ') + chalk.magenta(did))
  log(chalk.grey(' - TxID : ') + chalk.magenta(org.createTxId))
  log(chalk.grey(' - Genesis : ') + chalk.magenta(org.keys.mnemonic))
  // log(chalk.grey(' - Idspace : ') + chalk.magenta(newWallet.mnemonic))

  const json = JSON.stringify({
    did: did,
    createTxId: org.createTxId,
    mnemonic: org.keys.mnemonic
  })
  fs.writeFile('./orgs/issuer1.json', json, 'utf8', () => {
    process.exit()
  })
}

main()
