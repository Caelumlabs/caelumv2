const Caelum = require('../src/index')
const GOVERNANCE = 'wss://substrate.tabit.caelumapp.com'
const STORAGE = 'https://api.bigchaindb.caelumapp.com/api/v1/'
const orgJson = require('./orgs/5FcSnjrPBAHkzqgkEz4WtnRGwLHkhHYRjYBKsDHPcozNce7R.json')
const chalk = require('chalk')
const log = console.log

const logTags = (certs) => {
  for (const cert of certs) {
    log(chalk.grey(' - Tag : ') + chalk.magenta(cert.certificate.subject.title) +
      ' - ' + (cert.status === 'issued' ? chalk.green(cert.status) : chalk.red(cert.status)) +
      ' - ' + (cert.accepted === 'accepted' ? chalk.green(cert.accepted) : chalk.red(cert.accepted)))
  }
}

const main = async () => {
  const did = '5CwHB365qYuyJLZEQDiPXSDUFATf4GY43Tfco7Y153tS6xZR'
  const caelum = new Caelum(STORAGE, GOVERNANCE)
  const org = await caelum.loadOrganization(did)
  await org.loadInformation()
  await org.loadCertificates()
  let tags = await org.searchCertificates()
  log('\n' + chalk.grey('Empresa : ') + chalk.cyan(org.subject.legalName))
  logTags(tags)
  process.exit()
}

main()
