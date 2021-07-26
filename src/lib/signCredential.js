const Crypto = require('../utils/crypto');

const crypto = new Crypto(true);
const baseCredential = require('../credentials/credential.json');

/**
 * Creates the proof for the Credential and returns the Verifiable Credential
 *
 * @param {object} credential Credential to be signed
 * @param {object} signature Signature of the Credential
 * @param {string} issuer DID for the Identity issuing the credential
 * @param {string} type Encryption Type
 * @returns {*} signedCredential
 */
const signCredential = (credentialSubject, signer, issuer, type = '') => {
  const signedCredential = baseCredential;
  signedCredential.type = ['VerifiableCredential', credentialSubject['@type']];
  signedCredential.credentialSubject = credentialSubject;
  const signature = crypto.signMessage(JSON.stringify(credentialSubject), signer.keyPair);
  const date = new Date();
  signedCredential.issuer = issuer;
  signedCredential.issuanceDate = date.toISOString();
  signedCredential.proof.type = 'ed25519';
  signedCredential.proof.signature = crypto.u8aToHex(signature);
  // const serialized = dagCBOR.util.serialize(signedCredential)
  return signedCredential;
};

/**
 * Desserializes a Verifiable credential
 *
 * @param {string} serialized Serialized Credential
 * @returns {*} signedCredential
 */
const verifyCredential = (serialized, address) => {
  // const certificate = dagCBOR.util.deserialize(serialized)
  const credential = serialized;
  const signature = crypto.hexToU8a(credential.proof.signature);
  const check = crypto.checkSignature(JSON.stringify(credential.credentialSubject), signature, address);
  return { check, credential };
};

const keyPair = () => crypto.keyPair();

module.exports = { signCredential, verifyCredential, keyPair };
