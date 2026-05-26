# Blockchain Blueprint

A JavaScript implementation of a blockchain with proof-of-work mining and AES-192 data encryption.

## Files

### Library modules (not runnable directly)

| File | Purpose |
|------|---------|
| `src/blockchain.js` | Core `Block` and `Blockchain` classes with SHA-256 hashing, proof-of-work mining, and chain validation. Imported by the tests and demo scripts. |
| `src/cryptoUtils.js` | AES-192-CBC `encryptData` and `decryptData` functions with password-derived keys via `scrypt`. Imported by tests. |
| `src/myBlockchain/simpleBlockchain.js` | A self-contained copy of the `Block` and `Blockchain` classes (no external deps beyond Node's `crypto`). Used by `blockchainTest.js`. |

### Runnable scripts

**`src/myBlockchain/blockchainTest.js`** — Creates a blockchain, mines one block with `{ amount: 4 }` data, prints whether the chain is valid, and dumps the full chain as JSON.

```bash
node src/myBlockchain/blockchainTest.js
```

## Tests

Tests are written with [Bun's built-in test runner](https://bun.sh/docs/cli/test).

| File | What it covers |
|------|---------------|
| `test/blockchain.test.js` | Hash calculation, mining to a target difficulty, genesis block creation, adding blocks, chain validation, and tamper detection (data and hash). |
| `test/blockchain.73s7.js` | Alternative test suite for the same `Block`/`Blockchain` classes — covers `calculateHash`, `mineBlock`, `addBlock`, `isChainValid`, `createGenesisBlock`, and `getLatestBlock`. |
| `test/cryptoUtils.test.js` | Encrypts a JSON patient record with `encryptData`, decrypts it with `decryptData`, and asserts the round-trip result matches the original. |

### Run all tests

```bash
bun test
```

### Run a single test file

```bash
bun test test/blockchain.test.js
bun test test/blockchain.73s7.js
bun test test/cryptoUtils.test.js
```

### Run tests matching a name pattern

```bash
bun test --test-name-pattern "should validate the chain"
```

## cryptoUtils.js

Where'd it come from?  (This is from several years ago.)

My best guess: a tutorial or blog post about using blockchain for healthcare data — probably something like "building a secure blockchain for medical records with Node.js."

The clues:

- The medical record schema in the test (patientId, diagnosis, medication) matches that exact tutorial
genre
- The hardcoded salt "salt" and all-zero IV are hallmarks of simplified tutorial code — production crypto
would never do that
- The streaming cipher API (cipher.on("data"), cipher.on("end")) is a less common pattern; most tutorials
that use it are specifically demonstrating Node's built-in crypto module rather than reaching for a
library like sodium or node-forge
- The aes-192-cbc choice is oddly specific — 192-bit is rarely used; 256 is the standard. That specificity
 suggests it was copied from somewhere rather than written from scratch

Could also have been AI-generated for the same kind of demo. Either way, the zero IV and static salt mean it's purely illustrative — not safe for real data.

**Conclusion: I believe cryptoUtils.js was AI-generated in 2024.**

<br>
