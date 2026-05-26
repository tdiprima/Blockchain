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

## cryptoUtils-1.js

`src/cryptoUtils-1.js` is created. Here's a summary of every change and why:

| Problem in Original | Fix in `-1.js` |
|---|---|
| `salt = "salt"` — fixed string | `crypto.randomBytes(32)` — fresh random salt every call |
| `iv = Buffer.alloc(16, 0)` — all zeros | `crypto.randomBytes(12)` — fresh random IV every call |
| `aes-192-cbc` — no tamper detection | `aes-256-gcm` — throws on tampered data, stronger key |
| Salt not stored, so decryption required knowing it separately | Salt + IV + auth tag prepended to ciphertext in one hex string |
| Streaming event API (`cipher.on("data")`) — unnecessarily complex | `cipher.update()` + `cipher.final()` — simpler synchronous style |

<br>
