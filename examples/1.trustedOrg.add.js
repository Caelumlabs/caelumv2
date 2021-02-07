const Caelum = require('../src/index')
const chalk = require('chalk')
const log = console.log
const fs = require('fs')
const GOVERNANCE = 'wss://substrate.tabit.caelumapp.com'
const STORAGE = 'https://api.bigchaindb.caelumapp.com/api/v1/'
const rootInfo = require('./orgs/root.json')
var Spinner = require('cli-spinner').Spinner;

const main = async () => {
  // Connect Caelum-SDK
  const caelum = new Caelum(STORAGE, GOVERNANCE)
  const spinner = new Spinner('Governance');
  spinner.setSpinnerString('|/-\\');
  spinner.start();

  // Creates a new organization with new keys
  spinner.setSpinnerTitle('Governance : Step 1 of 6')
  const org = await caelum.newOrganization()
  const orgSubject = {
    id: 'did:caelum:' + org.did,
    legalName: 'Caelum Innovation SL',
    taxID: 'B67101519',
    countryCode: 'ES',
    network: 'tabit'
  }

  // Load Root to sign the info.
  const root = await caelum.newOrganization('root')
  await root.setKeys('governance', rootInfo.keys.governance.mnemonic)
  await root.setKeys('w3c', rootInfo.keys.w3c)
  const signedVC = await root.signDid(orgSubject)

  // Add to Storage all user's information.
  spinner.setSpinnerTitle('Storage : Step 2 of 6')
  await org.addApplication('diddocument')
  spinner.setSpinnerTitle('Storage : Step 3 of 6')
  await org.addApplication('applications')
  spinner.setSpinnerTitle('Storage : Step 4 of 6')
  await org.addApplication('verified')
  spinner.setSpinnerTitle('Storage : Step 5 of 6')
  await org.saveOrganization(signedVC)
  spinner.setSpinnerTitle('Storage : Step 6 of 6')

  // Now Root can save the organization to Governance.
  spinner.setSpinnerTitle('Governance : Register Did')
  spinner.stop()
  await root.register(org, 1000)

  log('\n' + chalk.grey('Empresa : ') + chalk.cyan('Caelum Innovation SL'))
  log(chalk.grey(' - DID  : ') + chalk.magenta(org.did))
  // log(chalk.grey(' - TxID : ') + chalk.magenta(org.createTxId))
  // log(chalk.grey(' - Idspace : ') + chalk.magenta(newWallet.mnemonic))
  const json = JSON.stringify({did: org.did, createTxId: org.createTxId, keys: org.keys})
  fs.writeFile('./orgs/' + org.did + '.json', json, 'utf8', () => {
    process.exit()
  })
}

main()
