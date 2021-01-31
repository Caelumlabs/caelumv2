/* eslint-disable no-unused-vars */
const Caelum = require('../src/index')
const caelum = new Caelum('https://api.bigchaindb.caelumapp.com/api/v1/')
const chalk = require('chalk')
const log = console.log

const issuers = {
  generalitat: {
    did: '9MB6SUdmTtP692kdnKNXebECWvHfJaz5QJFrmEjxJqcv',
    createTxId: '6a4c3abcb14b9dd0f5422c276083b5ed7114ae91a1f17c0d0e54bd8521e078c2',
    mnemonic: 'engage trade misery awful valve elbow visual cruel cargo trigger life stock'
  },
  federacio: {
    did: '8EfFoqDMPiti4MGtuJogxSJjfKQwLHZ3QKpmdAeLdzHd',
    createTxId: 'f6e3a3524156d1fcaa9f8572a7f472c9a70e3f9efdba3c35074475fcd4cf4695',
    mnemonic: 'carbon oblige country wild busy loop elite cave angle swing defy erode'
  },
  viladecans: {
    did: '2QN58iGmMroqJHmEqLr84BQbR1rvBfXNx6X3dBveEEYE',
    createTxId: 'accdd15be44011368a3ed992a71386a3335dd5968c5c40d7144d36547da70c58',
    mnemonic: 'punch rigid furnace beauty fruit seat concert anger lens wing easy another'
  }
}

const receivers = {
  bbhotel: {
    did: 'DRhWwRd15BvLrovSTmFqeUJS1SupuYAQeTfyKz1pB3iW',
    createTxId: '369d2c6c5b4631035560286ba4d8e2d351806926a7ea402e0953ccd3e1a17471',
    mnemonic: 'small goddess wild giraffe wire morning text clinic bright mixture clip damp'
  },
  luxemburg: {
    did: 'GCnFpdAoZYWBQj7EzaUKK9DjGg9Vh33ij4DRNHv4FsyX',
    createTxId: '07b870e26e60335df02903254dcca930c7e09aff41c7e220129691c1be2d1a31',
    mnemonic: 'marine opera milk water media design finish chef gift cactus evoke purse'
  },
  xarcuteria: {
    did: '6z2to5Wj9UmqtueyBWfGh7t9dB4fX7FDASku6CjiHJES',
    createTxId: '89149f5fee38eab9659eb3b0d6525bfbcd33ea265a40d647e76442682f0006bf',
    mnemonic: 'pact mouse glow winter fog sight trigger fringe cup cereal exotic credit'
  }
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
  log(chalk.blue('\n====================\nEmissors de Tags\n===================='))
  const generalitat = await caelum.loadOrganization(issuers.generalitat.createTxId, issuers.generalitat.did)
  await generalitat.setKeys(issuers.generalitat.mnemonic)
  await generalitat.loadCertificates()
  const tagProximitat = generalitat.certificates[0].certificateId
  // const listOfIssuedTags = await generalitat.getIssuedCertificates(tagProximitat)
  log('\n' + chalk.grey('Empresa : ') + chalk.cyan(generalitat.subject.legalName))
  log(chalk.grey('Emet TAG : ') + chalk.cyan(generalitat.certificates[0].subject.title))
  // console.log(generalitat.certificates[0])

  // Issue Tags
  // await generalitat.issueCertificate(tagProximitat, receivers.bbhotel.did, 'issued')
  // await generalitat.issueCertificate(tagProximitat, receivers.bbhotel.did, 'issued')
  // await generalitat.issueCertificate(tagProximitat, receivers.xarcuteria.did, 'issued')

  const federacio = await caelum.loadOrganization(issuers.federacio.createTxId, issuers.federacio.did)
  await federacio.setKeys(issuers.federacio.mnemonic)
  await federacio.loadCertificates()
  const tagCovid = federacio.certificates[0].certificateId
  // const listOfIssuedTags = await federacio.getIssuedCertificates(tagCovid)
  log('\n' + chalk.grey('Empresa : ') + chalk.cyan(federacio.subject.legalName))
  log(chalk.grey('Emet TAG : ') + chalk.cyan(federacio.certificates[0].subject.title))

  // Issue Tags
  // await federacio.issueCertificate(tagCovid, receivers.bbhotel.did, 'issued')
  // await federacio.issueCertificate(tagCovid, receivers.luxemburg.did, 'issued')
  // await federacio.issueCertificate(tagCovid, receivers.xarcuteria.did, 'issued')

  const viladecans = await caelum.loadOrganization(issuers.viladecans.createTxId, issuers.viladecans.did)
  await viladecans.setKeys(issuers.viladecans.mnemonic)
  await viladecans.loadCertificates()
  const tagVilawatt = viladecans.certificates[0].certificateId
  // const listOfIssuedTags = await viladecans.getIssuedCertificates(tagVilawatt)
  log('\n' + chalk.grey('Empresa : ') + chalk.cyan(viladecans.subject.legalName))
  log(chalk.grey('Emet TAG : ') + chalk.cyan(viladecans.certificates[0].subject.title))

  // await viladecans.issueCertificate(tagVilawatt, receivers.bbhotel.did, 'issued')
  // await viladecans.issueCertificate(tagVilawatt, receivers.luxemburg.did, 'issued')
  // await viladecans.issueCertificate(tagVilawatt, receivers.xarcuteria.did, 'issued')

  log(chalk.green('\n====================\nReceptors de Tags\n===================='))
  const bbhotel = await caelum.loadOrganization(receivers.bbhotel.createTxId, receivers.bbhotel.did)
  await bbhotel.setKeys(receivers.bbhotel.mnemonic)
  log('\n' + chalk.grey('Empresa : ') + chalk.cyan(bbhotel.subject.legalName))
  // await bbhotel.acceptCertificate(tagCovid, generalitat.did)
  let tags = await bbhotel.searchCertificates()
  logTags(tags)

  const luxemburg = await caelum.loadOrganization(receivers.luxemburg.createTxId, receivers.luxemburg.did)
  await luxemburg.setKeys(receivers.luxemburg.mnemonic)
  log('\n' + chalk.grey('Empresa : ') + chalk.cyan(luxemburg.subject.legalName))
  tags = await luxemburg.searchCertificates()
  logTags(tags)

  const xarcuteria = await caelum.loadOrganization(receivers.xarcuteria.createTxId, receivers.xarcuteria.did)
  await xarcuteria.setKeys(receivers.xarcuteria.mnemonic)
  log('\n' + chalk.grey('Empresa : ') + chalk.cyan(xarcuteria.subject.legalName))
  tags = await xarcuteria.searchCertificates()
  logTags(tags)

  process.exit()
}

main()
