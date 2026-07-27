/**
 * Seed script to create admin and demo accounts with proper password hashes.
 * Run with: node server/seed-accounts.mjs
 */
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

const accounts = [
  {
    openId: "admin_neopolis_001",
    name: "Achraf Khelil",
    email: "admin@neopolis.dev",
    password: "NeoAdmin2026!",
    role: "admin",
  },
  {
    openId: "demo_learner_001",
    name: "Apprenant Démo",
    email: "apprenant@neopolis.demo",
    password: "NeoDemo2026!",
    role: "user",
  },
];

async function main() {
  for (const account of accounts) {
    const hash = await bcrypt.hash(account.password, SALT_ROUNDS);
    console.log(`-- Account: ${account.email} (${account.role})`);
    console.log(`INSERT INTO users (openId, name, email, passwordHash, loginMethod, role, lastSignedIn, createdAt, updatedAt) VALUES ('${account.openId}', '${account.name}', '${account.email}', '${hash}', 'email', '${account.role}', NOW(), NOW(), NOW()) ON DUPLICATE KEY UPDATE passwordHash='${hash}', role='${account.role}', name='${account.name}';`);
    console.log("");
  }
}

main();
