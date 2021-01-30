const Caelum = require('../src/index')
const faker = require('faker')
const caelum = new Caelum('https://api.bigchaindb.caelumapp.com/api/v1/')

const main = async () => {
  console.log('main')
  // Add basic DID and applications.
  const org = await caelum.newOrganization()
  console.log('set Keys')
  await org.setKeys()
  await org.addApplication('diddocument')
  await org.addApplication('applications')
  await org.addApplication('verified')
  const did = await org.saveOrganization()

  // Save information. Add Doc.
  console.log('save Information')
  await org.saveInformation({
    legalName: "Xarcuteria Olivé",
    network: 'tabit',
    countryCode: 'ES',
    taxID: 'B67474304'
  })

  // Add first certificate
  /*
  console.log('Add certificate')
  await org.addCertificate({
    title: 'Eficiencia Energètica - Comerç Vilawatt',
    description: "Els serveis o empreses identificats amb aquest distintiu han certificat que compleixen els requisits legals, ambientals i de qualitat següents, obligatoris. ",
    url: 'http://www.vilawatt.cat/es',
    logo: 'http://www.vilawatt.cat/sites/default/files/styles/list_bookmark/public/bookmarks_2_3.png?itok=nfAUWVF-',
    learningAchievement: `
    -  Certificat de compliment de les obligacions tributàries 
    -  Certifiquen que disposen d’un servei de prevenció de riscos laborals i d'un altre de vigilància de la salut 
    -  Declaració de política ambiental corporativa 
    -  Certificat de compliment de les obligacions amb la Seguretat Social 
    -  Pòlissa vigent de responsabilitat civil en aquelles activitats en les quals sigui obligatòria 
    -  Valoracions satisfactòries de cinc clients en els últims quatre anys o Pla de viabilitat (elaborat en els últims dos anys) per a empreses de nova creació  })`
  })
  */
  console.log('DID : ' + did)
  console.log('createTxId : ' + org.createTxId)
  console.log('Keys : ', org.keys)
  process.exit()
}

main()
