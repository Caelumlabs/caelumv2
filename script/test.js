const Caelum = require('../src/index')
const caelum = new Caelum('https://api.bigchaindb.caelumapp.com/api/v1/')
const apps = [{
  name: 'Information',
  applicationCategory: 1,
  version: 1
},
{
  name: 'DidDoc',
  applicationCategory: 2,
  version: 1
},
{
  name: 'Certificates',
  applicationCategory: 3,
  version: 1
},
{
  name: 'Verified',
  applicationCategory: 4,
  version: 1
}]

const newApps = async (org) => {
  for (let i = 0; i < apps.length; i++) {
    const app = await caelum.saveApplication(org, apps[i])
    console.log('Create Id: ' + app.createTxId)
  }
  await caelum.saveOrganization(org)
}

const loadApp = async (org, createId) => {
  const app = await caelum.loadApplication(org, createId)
  console.log(app)
}

const search = async () => {
  const s = 'integrity'
  const res = await caelum.search(s)
  console.log(res)
}

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
  const did = 'FS8wYezZvSQ6bf6dcDr1dYQVYsiwGn6ns2vv61kX9TAt'
  const createTxId = '3b70a8c07ef5efc164fbaecb2d17e2e1c4fe123861c8eb94bfdc95df392fcb70'
  const org = await caelum.loadOrganization(createTxId, did)
  await org.setKeys('crater equal delay slow adult today camera mango intact address age clap')
  // console.log('Organization', org)

  console.log('Application', org.applications[0].subject)

  // await loadApp(org, 'b7f07cf5da9640d8f4d57191ff04521bf3addc6e452864f1a0b6ad7f0705644a')
  // await search()
  process.exit()
}

main()
