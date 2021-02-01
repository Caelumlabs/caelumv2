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
  const did = await org.saveOrganization("Federació Intercomarcal d'Hosteleria, restauració i Turisme", 'B67101519', 'ES', 'tabit')

  log('\n' + chalk.grey('Empresa : ') + chalk.cyan("Federació Intercomarcal d'Hosteleria, restauració i Turisme"))
  log(chalk.grey(' - DID  : ') + chalk.magenta(did))
  log(chalk.grey(' - TxID : ') + chalk.magenta(org.createTxId))
  log(chalk.grey(' - Genesis : ') + chalk.magenta(org.keys.mnemonic))

  const cid = await org.addCertificate({
    title: 'Seguretat COVID',
    description: "S'atorgarà una vegada que les destinacions i les empreses adoptin i compleixin en la seva totalitat els protocols estandarditzats d'higiene, sanejament i distanciament físic emesos pel  la Federació Intercomarcal de Hosteleria, restauració i turisme per evitar el coronavirus.",
    url: 'http://www.fihr.cat/',
    logo: 'https://i.ibb.co/WFB7TRW/coronavirus.jpg',
    learningAchievement: `- Higiene diaria, desinfecció amb ozó diaria
      - Cursos de prevenció i riscos enfocat al covid.
      - Espais lliures de fum, i respecte dels aforaments i distancies marcades pel PROCICAT.`
  })

  log(chalk.grey(' - CID : ') + chalk.magenta(cid))


  const json = JSON.stringify({
    did: did,
    createTxId: org.createTxId,
    mnemonic: org.keys.mnemonic
  })
  fs.writeFile('./orgs/issuer2.json', json, 'utf8', () => {
    process.exit()
  })
}

main()
