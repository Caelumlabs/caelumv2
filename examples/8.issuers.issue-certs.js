const Caelum = require('../src/index')
const caelum = new Caelum('https://api.bigchaindb.caelumapp.com/api/v1/')
const chalk = require('chalk')
const log = console.log
const jsonIssuer1 = require('./orgs/issuer1.json')
const jsonIssuer2 = require('./orgs/issuer2.json')
const jsonIssuer3 = require('./orgs/issuer3.json')
const jsonOrg1 = require('./orgs/org1.json')
const jsonOrg2 = require('./orgs/org2.json')
const jsonOrg3 = require('./orgs/org3.json')

const main = async () => {
  // BBHotels
  const org1 = await caelum.loadOrganization(jsonOrg1.createTxId, jsonOrg1.did)
  await org1.setKeys(jsonOrg1.mnemonic)

  // Petit L.
  const org2 = await caelum.loadOrganization(jsonOrg2.createTxId, jsonOrg2.did)
  await org2.setKeys(jsonOrg2.mnemonic)

  // Xarcuteria
  const org3 = await caelum.loadOrganization(jsonOrg3.createTxId, jsonOrg3.did)
  await org3.setKeys(jsonOrg3.mnemonic)

  // Generalitat
  const issuer1 = await caelum.loadOrganization(jsonIssuer1.createTxId, jsonIssuer1.did)
  await issuer1.setKeys(jsonIssuer1.mnemonic)
  await issuer1.loadCertificates()
  const tagProximitat = issuer1.certificates[0].certificateId

  await issuer1.issueCertificate(tagProximitat, org3.did, 'issued')
  await org3.acceptCertificate(tagProximitat, issuer1.did)
  log('\n' + chalk.grey('Issue Empresa : ') + chalk.cyan(issuer1.did))

  // Federació
  const issuer2 = await caelum.loadOrganization(jsonIssuer2.createTxId, jsonIssuer2.did)
  await issuer2.setKeys(jsonIssuer2.mnemonic)
  await issuer2.loadCertificates()
  const tagCovid = issuer2.certificates[0].certificateId
  await issuer2.issueCertificate(tagCovid, org1.did, 'issued')
  await org1.acceptCertificate(tagCovid, issuer2.did)
  await issuer2.issueCertificate(tagCovid, org2.did, 'issued')
  await issuer2.issueCertificate(tagCovid, org3.did, 'issued')
  log('\n' + chalk.grey('Issue Empresa : ') + chalk.cyan(issuer2.did))

  // Viladecans
  const issuer3 = await caelum.loadOrganization(jsonIssuer3.createTxId, jsonIssuer3.did)
  await issuer3.setKeys(jsonIssuer3.mnemonic)
  await issuer3.loadCertificates()
  const tagVilawatt = issuer3.certificates[0].certificateId
  await issuer3.issueCertificate(tagVilawatt, org1.did, 'issued')
  await issuer3.issueCertificate(tagVilawatt, org2.did, 'issued')
  await issuer3.issueCertificate(tagVilawatt, org3.did, 'issued')
  await org3.acceptCertificate(tagVilawatt, issuer3.did)
  log('\n' + chalk.grey('Issue Empresa : ') + chalk.cyan(issuer3.did))

  process.exit()
}

main()
