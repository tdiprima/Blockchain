The auth tag is the key concept to explain to beginners: GCM mode produces a short checksum at encryption
time. At decryption time, if even one byte of the ciphertext was changed, `decipher.final()` throws an error
 rather than silently returning garbage. CBC mode had no such protection.

---

The easiest way to understand the auth tag is:

> Encryption alone does NOT guarantee integrity.

It only guarantees secrecy.

So without authentication, attackers can modify encrypted data and the receiver may never know.

---

# CBC Mode Problem

With older modes like:

```text id="9ldw6v"
aes-192-cbc
```

decryption can still succeed even if ciphertext was altered.

Example:

Original plaintext:

```text id="vjv9j7"
transfer=100
```

Encrypted into ciphertext:

```text id="6x10vd"
8F A2 91 ...
```

Attacker flips some bits in transit.

Modified ciphertext:

```text id="9g09s9"
8F A2 92 ...
```

CBC will still try to decrypt it.

Result might become:

```text id="n7yfrt"
transfer=900
```

or:

```text id="d0cr8f"
tr@nsfer=?00
```

or random garbage.

The scary part:

❌ The system may NOT realize tampering happened.

That's the weakness.

---

# GCM Fixes This

GCM adds:

```text id="7n0l9j"
Authentication
```

in addition to encryption.

This is why GCM is called:

```text id="u7s9f5"
AEAD
Authenticated Encryption with Associated Data
```

---

# What the Auth Tag Actually Is

During encryption:

1. plaintext is encrypted
2. GCM computes a cryptographic integrity check
3. that check becomes the:

```text id="06e3vf"
auth tag
```

Think of it like:

```text id="39z1kx"
A tamper-evident seal
```

---

# Simplified Example

Suppose:

Plaintext:

```text id="40u3l2"
hello
```

After encryption:

```text id="hqimw8"
ciphertext = A1B2C3
authTag   = ZZ99
```

You send BOTH:

```text id="r7fdjm"
A1B2C3 + ZZ99
```

---

# During Decryption

GCM checks:

```text id="pd3lrb"
"Does this ciphertext still match the original auth tag?"
```

If YES:

✅ decrypt succeeds

If NO:

❌ decryption FAILS

Even ONE changed byte causes failure.

---

# What `decipher.final()` Does

In Node.js GCM mode:

```javascript id="zcf8z9"
decipher.final()
```

performs the authentication check.

If ciphertext was modified:

```javascript id="m0mjlwm"
Error: Unsupported state or unable to authenticate data
```

gets thrown.

That's GOOD.

It means:

```text id="72czgn"
Tampering detected.
```

---

# Why This Is Huge

Without authentication:

```text id="l1g9mu"
Encrypted garbage may look valid.
```

With GCM auth tags:

```text id="sg9dln"
Modified ciphertext is rejected entirely.
```

This prevents:

* bit-flipping attacks
* malicious modification
* corrupted data acceptance
* padding oracle-style problems

---

# Beginner Analogy

CBC encryption alone:

```text id="l4zavc"
Putting a message in a locked box.
```

Someone can still:

* smash it
* alter contents
* replace pages

and you might not notice.

---

GCM with auth tag:

```text id="jlwmvl"
Locked box + tamper-proof seal.
```

If seal is broken:

```text id="pqmvx0"
REJECT THE PACKAGE
```

---

# Tiny Node.js Example

## Encryption

```javascript id="xvndj8"
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

let encrypted = cipher.update("hello", "utf8", "hex");
encrypted += cipher.final("hex");

const authTag = cipher.getAuthTag();
```

Outputs:

```text id="ps7m07"
encrypted = "a1b2c3..."
authTag  = "ff991122..."
```

---

## Decryption

```javascript id="d8n9n9"
const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

decipher.setAuthTag(authTag);

let decrypted = decipher.update(encrypted, "hex", "utf8");
decrypted += decipher.final("utf8");
```

If ciphertext changed:

```javascript id="75pm0f"
decipher.final()
```

throws an error immediately.

That's the integrity protection happening.

<br>
