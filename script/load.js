const Caelum = require('../src/index')
const caelum = new Caelum('https://api.bigchaindb.caelumapp.com/api/v1/')

const main = async () => {
  /*
  const org = await caelum.newOrganization({
    taxID: 'B67101519',
    legalName: 'Lorena Caelum Labs',
    countryCode: 'ES'
  })
  await org.setKeys('crater equal delay slow adult today camera mango intact address age clap')
  await newApps(org)
  */
  const did = '2Rv4rpzPFkzk3toQdghbv2zW8c215CMusZpv1HCyMqjA'
  const createTxId = 'b728e1839a796ee27526f561b9f566accbf93bdaa6c5d1da27ff251bf8333c0'
  const org = await caelum.loadOrganization(createTxId, did)
  console.log(org)

  // await loadApp(org, 'b7f07cf5da9640d8f4d57191ff04521bf3addc6e452864f1a0b6ad7f0705644a')
  // await search()
  process.exit()
}

main()
