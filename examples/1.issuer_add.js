const Caelum = require('../src/index')
const chalk = require('chalk')
const log = console.log
const fs = require('fs')
const GOVERNANCE = 'wss://substrate.tabit.caelumapp.com'
const STORAGE = 'https://api.bigchaindb.caelumapp.com/api/v1/'
const Blockchain = require('../src/utils/substrate')
var Spinner = require('cli-spinner').Spinner;

const main = async () => {
  // Connect Caelum-SDK
  const caelum = new Caelum(STORAGE, GOVERNANCE)
  const spinner = new Spinner('Governance');
  const governance = new Blockchain(GOVERNANCE)
  await governance.connect()

  spinner.setSpinnerString('|/-\\');
  spinner.start();

  // Creates a new organization with new keys
  spinner.setSpinnerTitle('Governance : Step 1 of 6')
  // Load Root to sign the info.
  const org = await caelum.newOrganization(false, true)
  const orgSubject = {
    id: 'did:caelum:' + org.did,
    legalName: 'Caelum Innovation SL',
    taxID: 'B67101519',
    countryCode: 'ES',
    network: 'tabit'
  }

  await org.setSubject(orgSubject)

  // Add to Storage all user's information.
  spinner.setSpinnerTitle('Storage : Step 2 of 6')
  await org.addApplication('diddocument')
  await org.saveDidDocument('https://api.org1.tabit.caelumapp.com')

  spinner.setSpinnerTitle('Storage : Step 3 of 6')
  await org.addApplication('applications')

  spinner.setSpinnerTitle('Storage : Step 4 of 6')
  await org.addApplication('verified')

  spinner.setSpinnerTitle('Storage : Step 5 of 6')
  await org.saveOrganization(orgSubject)
  spinner.setSpinnerTitle('Storage : Step 6 of 6')

  // Now Root can save the organization to Governance.
  spinner.setSpinnerTitle('Governance : Register Did')
  governance.setKeyring('what unlock stairs benefit salad agent rent ask diamond horror fox aware')
  await governance.registerDid(org.did, org.keys.governance.address, 1000)

  spinner.setSpinnerTitle('Governance : Wait for the Block')
| await governance.wait4Event('DidRegistered')

  spinner.setSpinnerTitle('Governance : Send tokens')
  const amountTransfer = Blockchain.units * 500
  await governance.transferTokensNoFees(org.keys.governance.address, amountTransfer)

  spinner.setSpinnerTitle('Governance : Register createTxId')
  governance.setKeyring(org.keys.governance.mnemonic)
  await governance.registerDidDocument(org.did, org.createTxId)

  spinner.stop()


  log('\n' + chalk.grey('Empresa : ') + chalk.cyan('Caelum Innovation SL'))
  log(chalk.grey(' - DID  : ') + chalk.magenta(org.did))
  log(chalk.grey(' - TxID : ') + chalk.magenta(org.createTxId))
  const json = await org.export('test')
    console.log(json)
  fs.writeFile('./orgs/' + org.did + '.json', json, 'utf8', () => {
    process.exit()
  })
}

main()
