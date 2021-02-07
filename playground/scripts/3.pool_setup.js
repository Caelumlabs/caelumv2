// Utils.
const utils = require('../utils/index')

// Caelum Lib.
const Caelum = require('../../src/index')
const Blockchain = require('../../src/utils/substrate')

// Constants
const GOVERNANCE = 'wss://substrate.tabit.caelumapp.com'
const STORAGE = 'https://api.bigchaindb.caelumapp.com/api/v1/'

const poolInfo = require('../certificates/pool.org.json')

// Main function.
const setup = async (password) => {
  // Connect Caelum-SDK & Create a new Root Organization. Governanace Level 0
  const caelum = new Caelum(STORAGE, GOVERNANCE)
  const pool = await caelum.importOrganization(poolInfo, password)
  await pool.loadInformation()

  const peerDid = 'holder'
  const admin = await pool.addMember(peerDid, 'admin')

  const cid = await pool.addCertificate({
    title: 'Comerç de proximitat',
    description: "Aquest segell s'otorga a establiments que s'abasteixen o comercialitzen productes locals i de proximitat respectant els criteris de km 0. El Govern de Catalunya ha creat una acreditació específica i gratuïta per a la venda de proximitat de productes agroalimentaris. Aquest nou segell, regulat pel Decret 24/2013, de 8 de gener, respon a la demanda creixent dels productors agraris d'obtenir un reconeixement específic per a aquest tipus de comercialització.",
    url: 'https://gencat.cat',
    logo: 'https://i.ibb.co/5hJQQGR/proximitat.jpg',
    learningAchievement: 'Els productors han de comunicar la seva adhesió al sistema de venda de proximitat mitjançant la declaració única agrària (DUN), on trobaran un apartat específic per a fer-ho.'
  })

  console.log(cid)
}

/**
* Main
**/
const main = async () => {
  utils.start()
  const password = await utils.ask('Password')
  await setup(password)
  utils.end()
}
main()
