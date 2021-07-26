const GOVERNANCE = 'ws://127.0.0.1:9944';
const debug = require('debug')('did:debug:load');
const Caelum = require('../src/index');

// Main function.
const load = async (did) => {
  const caelum = new Caelum(GOVERNANCE);
  await caelum.connect();

  debug(`Get Info ${did}`);
  const org = await caelum.getOrganizationFromDid(did);
  debug(`Org = ${org.data.legal_name}`);

  // Disconnect.
  await caelum.disconnect();
};

/*
* Main
*/
const main = async () => {
  await load(process.argv[2]);
};

main();
