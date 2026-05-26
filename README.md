# Blockchain Blueprint

A JavaScript implementation of a blockchain with proof-of-work mining and AES-192 data encryption.

## Files

### Library modules (not runnable directly)

| File | Purpose |
|------|---------|
| `src/blockchain.js` | Core `Block` and `Blockchain` classes with SHA-256 hashing, proof-of-work mining, and chain validation. Imported by the tests and demo scripts. |
| `src/cryptoUtils.js` | AES-192-CBC `encryptData` and `decryptData` functions with password-derived keys via `scrypt`. Imported by tests. |
| `src/cryptoUtils-1.js` | Improved version of `cryptoUtils.js`. Uses AES-256-GCM (authenticated encryption), a random salt, and a random IV generated fresh on every call. Bundles salt + IV + auth tag + ciphertext into a single hex string. Drop-in replacement with the same `encryptData` / `decryptData` interface. |
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

<br>
