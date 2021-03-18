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

  const cid = await org.addCertificate({
    title: 'Comerç de proximitat',
    description: "Aquest segell s'otorga a establiments que s'abasteixen o comercialitzen productes locals i de proximitat respectant els criteris de km 0. El Govern de Catalunya ha creat una acreditació específica i gratuïta per a la venda de proximitat de productes agroalimentaris. Aquest nou segell, regulat pel Decret 24/2013, de 8 de gener, respon a la demanda creixent dels productors agraris d'obtenir un reconeixement específic per a aquest tipus de comercialització.",
    url: 'https://gencat.cat',
    logo: 'https://i.ibb.co/5hJQQGR/proximitat.jpg',
    learningAchievement: 'Els productors han de comunicar la seva adhesió al sistema de venda de proximitat mitjançant la declaració única agrària (DUN), on trobaran un apartat específic per a fer-ho.'
  })

  log('\n' + chalk.grey('Empresa : ') + chalk.cyan('Caelum Labs'))
  log(chalk.grey(' - DID : ') + chalk.magenta(org.did))
  log(chalk.grey(' - CID : ') + chalk.magenta(cid))
  process.exit()
}

main()
