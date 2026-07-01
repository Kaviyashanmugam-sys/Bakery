const crypto = require("crypto");

// Meta WhatsApp Flows encrypt every request/response between WhatsApp and your
// server. The pattern (per Meta's official spec) is:
//   1. WhatsApp generates a random AES-128 key per request, encrypts it with
//      YOUR RSA public key (RSA-OAEP/SHA-256), and sends it as encrypted_aes_key.
//   2. We decrypt that with our RSA PRIVATE key to recover the AES key.
//   3. The actual screen data (encrypted_flow_data) is AES-128-GCM encrypted
//      with that key + the given initial_vector. We decrypt it to get plain JSON.
//   4. Our JSON response must be AES-128-GCM encrypted with the SAME key, but
//      using the BIT-FLIPPED initial_vector, then base64-returned as plain text
//      (not wrapped in a JSON body).
//
// You generate the RSA key pair once (openssl) and upload the PUBLIC key in
// Meta App Dashboard -> WhatsApp -> Flows -> your flow -> Endpoint -> Public Key.
// The PRIVATE key stays only on your server, in .env (never commit it).

function decryptRequest(body, privateKeyPem, passphrase) {
  const { encrypted_flow_data, encrypted_aes_key, initial_vector } = body;

  const privateKey = crypto.createPrivateKey({
    key: privateKeyPem,
    passphrase: passphrase || undefined,
  });

  // Step 1: recover the per-request AES key
  const aesKey = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(encrypted_aes_key, "base64")
  );

  // Step 2: split ciphertext (body) from the trailing 16-byte GCM auth tag
  const flowDataBuffer = Buffer.from(encrypted_flow_data, "base64");
  const TAG_LENGTH = 16;
  const encryptedBody = flowDataBuffer.subarray(0, flowDataBuffer.length - TAG_LENGTH);
  const authTag = flowDataBuffer.subarray(flowDataBuffer.length - TAG_LENGTH);
  const iv = Buffer.from(initial_vector, "base64");

  const decipher = crypto.createDecipheriv("aes-128-gcm", aesKey, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encryptedBody), decipher.final()]);
  const decryptedJson = JSON.parse(decrypted.toString("utf-8"));

  return { decryptedBody: decryptedJson, aesKey, iv };
}

function encryptResponse(responseObject, aesKey, iv) {
  // Response must be encrypted with the SAME aes key but a bit-flipped IV
  const flippedIv = Buffer.from(iv.map((byte) => byte ^ 0xff));

  const cipher = crypto.createCipheriv("aes-128-gcm", aesKey, flippedIv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(responseObject), "utf-8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Meta expects a single base64 string: ciphertext + auth tag appended
  return Buffer.concat([encrypted, authTag]).toString("base64");
}

module.exports = { decryptRequest, encryptResponse };
