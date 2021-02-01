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
  const did = await org.saveOrganization('Ajuntament de Viladecans', 'B67101519', 'ES', 'tabit')

  log('\n' + chalk.grey('Empresa : ') + chalk.cyan('Ajuntament de Viladecans'))
  log(chalk.grey(' - DID  : ') + chalk.magenta(did))
  log(chalk.grey(' - TxID : ') + chalk.magenta(org.createTxId))
  log(chalk.grey(' - Genesis : ') + chalk.magenta(org.keys.mnemonic))

  const cid = await org.addCertificate({
    title: 'Eficiencia Energètica - Comerç Vilawatt',
    description: 'Els serveis o empreses identificats amb aquest distintiu han certificat que compleixen els requisits legals, ambientals i de qualitat següents, obligatoris. ',
    url: 'https://www.viladecans.cat/ca',
    logo: 'https://i.ibb.co/k222RrP/vilawatt.png',
    learningAchievement: `-  Certificat de compliment de les obligacions tributàries 
      -  Certifiquen que disposen d’un servei de prevenció de riscos laborals i d'un altre de vigilància de la salut 
      -  Declaració de política ambiental corporativa 
      -  Certificat de compliment de les obligacions amb la Seguretat Social 
      -  Pòlissa vigent de responsabilitat civil en aquelles activitats en les quals sigui obligatòria 
      -  Valoracions satisfactòries de cinc clients en els últims quatre anys o Pla de viabilitat (elaborat en els últims dos anys) per a empreses de nova creació`
  })

  log(chalk.grey(' - CID : ') + chalk.magenta(cid))
  const json = JSON.stringify({
    did: did,
    createTxId: org.createTxId,
    mnemonic: org.keys.mnemonic
  })
  fs.writeFile('./orgs/issuer3.json', json, 'utf8', () => {
    process.exit()
  })
}

main()
