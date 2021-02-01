/* eslint-disable no-unused-vars */
const Caelum = require('../src/index')
const caelum = new Caelum('https://api.bigchaindb.caelumapp.com/api/v1/')
const chalk = require('chalk')
const log = console.log

const caelumLabs = {
  did: 'CnU8Yo6e1sXmHr4oo8uzLzB7PdYEerMfCHVaLgLDjxXb',
  createTxId: 'd45848ab869a37fc4ea85b441e5a519477e3981dfc2efd7d2d2b183bf38ef336',
  mnemonic: 'seven release open sample monkey finish hurdle joke what tattoo panel improve'
}

const develInfo = {
  did: 'CmcZXdW9f2xSQXBFP8GVQG2E23DYgHsZ78YxkW7jsBWD',
  createTxId: 'cff61a37ec13e761ea05dc53b4fea2188f616471df0d37021c836e18136dc899',
  mnemonic: 'dice symbol accuse soldier twice uniform fiber gasp distance veteran surprise review'
}

const logTags = (certs) => {
  for (const cert of certs) {
    log(chalk.grey(' - Tag : ') + chalk.magenta(cert.certificate.subject.title) +
      ' - ' + (cert.status === 'issued' ? chalk.green(cert.status) : chalk.red(cert.status)) +
      ' - ' + (cert.accepted === 'accepted' ? chalk.green(cert.accepted) : chalk.red(cert.accepted)))
  }
}

const main = async () => {
  // Add basic DID and applications.
  log(chalk.blue('\n====================\nOrg Update\n===================='))
 
  const labs = await caelum.loadOrganization(caelumLabs.createTxId, caelumLabs.did)
  console.log(labs.nodes)
  await labs.setKeys(caelumLabs.mnemonic)
  await labs.loadCertificates()
  // const tagProvider = labs.certificates[0].certificateId
  log('\n' + chalk.grey('Empresa : ') + chalk.cyan(labs.subject.legalName))

  /*
  // Issue a certificate.
  await labs.issueCertificate(tagProvider, develInfo.did, 'issued')
  */

  // await labs.setKeys('feature vast tool embark door chair album major tray find wine salon')
  // await labs.saveInformation()

  // await labs.setKeys('say page outside infant prevent gallery athlete light half hybrid void boil')
  // await labs.addHashingApp()

  /*
  const devel = await caelum.loadOrganization(develInfo.createTxId, develInfo.did)
  await devel.setKeys(develInfo.mnemonic)
  log('\n' + chalk.grey('Empresa : ') + chalk.cyan(devel.subject.legalName))
  // await devel.acceptCertificate(tagProvider, labs.did)
  const tags = await devel.searchCertificates()
  logTags(tags)
  */

  /*
  // Update - Basic Information
  await labs.setAddress({
    streetAddress: 'Reina Cristina 9, principal',
    addressLocality: 'Sitges',
    postalCode: '08001',
    addressRegion: 'Barcelona',
    addressCountry: 'Spain'
  })
  await labs.saveInformation()
  */

  /*
  // Update - Did Document
  const doc = caelum.newDidDoc('did:caelum:' + labs.did)
  doc.addService('api', 'serviceApi', 'http://localhost:2002')
  await labs.saveDidDocument(doc.subject)
  */


  process.exit()
}

main()
