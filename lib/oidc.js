'use strict';

const { Issuer, generators } = require('openid-client');
const crypto = require('crypto');
const { promisify } = require('util');

const generateKeyPairAsync = promisify(crypto.generateKeyPair);

let oidcClient = null;

async function getClient() {
  if (oidcClient) return oidcClient;

  const issuer = await Issuer.discover(process.env.ISSUER_BASE_URL);

  const config = {
    client_id: process.env.CLIENT_ID,
    redirect_uris: [`${process.env.BASE_URL}/callback`],
    response_types: ['code'],
  };

  if (process.env.CLIENT_SECRET) {
    config.client_secret = process.env.CLIENT_SECRET;
  }

  oidcClient = new issuer.Client(config);
  return oidcClient;
}

// Generate an EC P-256 private key for DPoP proof signing.
async function generateDpopKey() {
  const { privateKey } = await generateKeyPairAsync('ec', { namedCurve: 'P-256' });
  return privateKey;
}

// Serialize a crypto.KeyObject to JWK for session storage (requires Node >= 16).
function exportKey(keyObject) {
  return keyObject.export({ format: 'jwk' });
}

// Reconstruct a crypto.KeyObject from a stored JWK.
function importKey(jwk) {
  return crypto.createPrivateKey({ key: jwk, format: 'jwk' });
}

module.exports = { getClient, generators, generateDpopKey, exportKey, importKey };
