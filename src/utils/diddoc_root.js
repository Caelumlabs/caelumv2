module.exports = {
  '@context': ['https://w3c-ccg.github.io/did-spec/contexts/did-v0.11.jsonld'],
  id: 'did:caelum:root',
  assertionMethod: [
    {
      '@id': 'did:caelum:root#key-1',
      type: 'Ed25519VerificationKey2018',
      controller: 'did:caelum:root',
      publicKeyBase58: '7drRHv9SHnewxGqKCRU8UfbvAqqD1a6deAcooswjbMkp'
    }
  ]
}
