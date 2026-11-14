// User accounts, stored in <dataDir>/users.json (same approach as store.js for reports).
import fs from 'fs/promises';
import path from 'path';
import { config } from './config.js';

const file = () => path.join(config.dataDir, 'users.json');

async function readAll() {
  try {
    return JSON.parse(await fs.readFile(file(), 'utf8'));
  } catch {
    return [];
  }
}

async function writeAll(all) {
  await fs.mkdir(config.dataDir, { recursive: true });
  await fs.writeFile(file(), JSON.stringify(all, null, 2));
}

// Public view of a user: never includes the password hash.
export const publicUser = ({ passwordHash, ...rest }) => rest;

export async function findUserByEmail(email) {
  const key = String(email).trim().toLowerCase();
  return (await readAll()).find((u) => u.email === key) || null;
}

export async function findUserById(id) {
  return (await readAll()).find((u) => u.id === id) || null;
}

export async function createUser(user) {
  const all = await readAll();
  const key = user.email.trim().toLowerCase();
  if (all.some((u) => u.email === key)) {
    const e = new Error('An account with this email already exists.');
    e.status = 409;
    throw e;
  }
  const record = { ...user, email: key };
  all.push(record);
  await writeAll(all);
  return record;
}
