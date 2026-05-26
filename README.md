# Blockchain Blueprint

A hands-on JavaScript blockchain implementation with SHA-256 proof-of-work mining and AES-192-CBC encryption — built to make core blockchain mechanics readable and testable.

## Why Blockchain Is Hard to Learn From

Most blockchain tutorials either skip the cryptography entirely or bury you in framework abstractions before you understand what's actually happening under the hood. It's hard to build intuition for tamper detection, block linking, and secure data storage when the mechanics are hidden.

## What This Does

This repo implements a blockchain from scratch in plain Node.js — no frameworks, no magic. Each block stores arbitrary data, computes a SHA-256 hash over its contents, and links to the previous block's hash. A proof-of-work miner increments a nonce until the hash meets a configurable difficulty target. A separate `cryptoUtils` module handles AES-192-CBC encryption and decryption using `scrypt`-derived keys, so sensitive data (like medical records) can be stored on-chain without being readable in plaintext. The chain validates itself by re-hashing every block and verifying the hash chain — any tampering breaks validation immediately.

## Example

```js
const { Block, Blockchain } = require("./src/blockchain");
const { encryptData, decryptData } = require("./src/cryptoUtils");

const chain = new Blockchain(); // difficulty: 4

const record = { patientId: "12345", diagnosis: "Common Cold" };
const encrypted = await encryptData(JSON.stringify(record), "my-secret");

chain.addBlock(new Block(1, Date.now(), encrypted));
// Block mined: 0000a3f8...

console.log(chain.isChainValid()); // true

chain.chain[1].data = "tampered";
console.log(chain.isChainValid()); // false
```

## Usage

**Prerequisites:** Node.js or [Bun](https://bun.sh/)

```bash
npm install
# or
bun install
```

**Run the demo:**

```bash
node blockchainTest.js
```

**Run the test suite (requires Bun):**

```bash
bun test
```

Tests cover hash calculation, proof-of-work mining, genesis block creation, block addition, chain validation, and tamper detection for both data and hash fields.

<br>
