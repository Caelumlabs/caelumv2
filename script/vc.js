const {extendContextLoader} = require('jsonld-signatures')
const vc = require('vc-js')
const {defaultDocumentLoader} = vc

const {Ed25519KeyPair, suites: {Ed25519Signature2018}} = require('jsonld-signatures');

const main = async () => {



 const keyPair = await Ed25519KeyPair.generate();
  keyPair.id = 'did:caelum:key:32213232131232131'; // See Key ID section
  //  keyPair.controller = 'https://example.com/i/carol'; // See Controller Document section

  const suite = new Ed25519Signature2018({
    verificationMethod: keyPair.id,
    key: keyPair
  });

  // Sample unsigned credential
  const credential = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "did:caelum:context"
    ],
    "id": "did:caelum:tag:2122323",
    "type": ["VerifiableCredential", "Tag"],
    "issuer": "did:caelum:2132323215454",
    "issuanceDate": "2010-01-01T19:23:24Z",
    "credentialSubject": {
      "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
      "description": "Test"
      // "name": "Example University",

      // "requirement": "HJKHH"
    }
  };

  const signedVC = await vc.issue({credential, suite, documentLoader});
  console.log(JSON.stringify(signedVC, null, 2));
}
main()
