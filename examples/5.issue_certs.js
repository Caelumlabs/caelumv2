const Caelum = require('../src/index')
const GOVERNANCE = 'wss://substrate.tabit.caelumapp.com'
const STORAGE = 'https://api.bigchaindb.caelumapp.com/api/v1/'
const orgJson = require('./orgs/5FcSnjrPBAHkzqgkEz4WtnRGwLHkhHYRjYBKsDHPcozNce7R.json')
const chalk = require('chalk')
const log = console.log

const main = async () => {
  const caelum = new Caelum(STORAGE, GOVERNANCE)
  const org = await caelum.importOrganization(orgJson, 'test')
  await org.loadInformation()
  await org.loadApplications()
  await org.loadCertificates()

  // Generalitat
  const tagProximitat = org.certificates[0].certificateId

  const did = '5CwHB365qYuyJLZEQDiPXSDUFATf4GY43Tfco7Y153tS6xZR'
  await org.issueCertificate(tagProximitat, did)
  // await org3.acceptCertificate(tagProximitat, issuer1.did)
  log('\n' + chalk.grey('Issue Empresa : ') + chalk.cyan(did))

  process.exit()
}

main()
