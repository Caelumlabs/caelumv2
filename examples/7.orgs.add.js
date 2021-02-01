const Caelum = require('../src/index')
const caelum = new Caelum('https://api.bigchaindb.caelumapp.com/api/v1/')
const chalk = require('chalk')
const log = console.log
const fs = require('fs')

const addOrg = async (index, legalName, taxID) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    const org = await caelum.newOrganization()
    await org.setKeys()
    await org.addApplication('diddocument')
    await org.addApplication('applications')
    await org.addApplication('verified')
    const did = await org.saveOrganization(legalName, taxID, 'ES', 'tabit')

    log('\n' + chalk.grey('Empresa : ') + chalk.cyan(legalName))
    log(chalk.grey(' - DID  : ') + chalk.magenta(did))

    const json = JSON.stringify({ did: did, createTxId: org.createTxId, mnemonic: org.keys.mnemonic })
    fs.writeFile('./orgs/org' + index + '.json', json, 'utf8', () => { resolve() })
  })
}

const main = async () => {
  await addOrg(1, 'B&B Hotel Barcelona Viladecans ', 'B66209693')
  await addOrg(2, 'El Petit Luxemburg', 'B61449831')
  await addOrg(3, 'Xarcuteria Olivé  ', 'B67474304')
  process.exit()
}

main()
