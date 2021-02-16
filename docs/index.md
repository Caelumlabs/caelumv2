## Welcome to Caelum
We are building ecosystems to allow interoperability between organizations in a zero-trust environment.

# Ecosystem
Every ecosystem has three different participants

- Governance
- Storage
- Idspace

# caelum
Caelum is a mix of different Blockchain technologies
- Substrate: Governance and Interoperability
- BigchainDB: Public Storage and SSI
- Idspace: container in the cloud with the SSI Process Manager software. One for every organization.

One ecosystem has these elements

- Governor
- Trust Agents
- Organizations

## Governor
It’s the root of Authority in the ecosystem. It’s designed to disappear in time when the ecosystem grows to be replaced by community governance.

## Trust Agents
Nodes in the ecosystem with an Idspace. They are organizations with the capacity to add more organizations to the ecosystem.
## Organizations
Nodes in the ecosystem with an Idspace. They are organizations with our Caelum interoperable process manager.
It is also possible to create pools of Organizations inside one Idspace.

# Create our first organization
When an idspace for one organization it’s deployed it will add a basic asset structure in BigchainDB with these assets:
- Information: address, certificates accepted...
- DidDoc: DID document for this organization.
- Certificates: Certificates issuable by this organization.
- Verified (only Trust Agents): DIDs verified by this organization

```javascript
const Caelum = require("caelum")
const caelum = new Caelum('http://localhost:9984/api/v1/')
await caelum.newKeys()

const org = await caelum.newOrganization({
   legalName: ‘Your company SL’,
   taxID: ’valid_taxID’,
   countryCode: 'ES'
 })

// If no parameters will add a new set of keys.
// You can also set a mnemonic : await org.serKeys('passphrase or mnemonic (bip39)')
await org.serKeys()

```

# Cryptography
We base caelum in polkadot cryptography libraries.

# Test
Launch first the docker with bigchainDB
```shell
./scripts/bigchaindb
yarn run test
```

[Next Step - Governance](playground/docs/governance.md)
