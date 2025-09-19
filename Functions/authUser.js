"use strict";
const { resolveRoles } = require("./roleUtils");

/**
 * Change a user's password on a specific database.
 * Requires appropriate privileges (userAdmin or higher) on the target DB.
 * @param {import('mongodb').MongoClient} client
 * @param {string} dbName
 * @param {string} username
 * @param {string} newPassword
 * @returns {Promise<{ok: number, user: string, db: string}>}
 */
async function changePassword(client, dbName, username, newPassword) {
  if (!client || typeof client.db !== "function") {
    throw new Error("A connected MongoClient instance is required");
  }
  if (!dbName || !username || !newPassword) {
    throw new Error("dbName, username, and newPassword are required");
  }

  const db = client.db(dbName);
  await db.command({ updateUser: username, pwd: newPassword });
  return { ok: 1, user: username, db: dbName };
}

/**
 * Set user roles on a specific database. Overwrites role assignments.
 * @param {import('mongodb').MongoClient} client
 * @param {string} dbName
 * @param {string} username
 * @param {Array<{role: string, db: string}>|string[]|number[]} roles
 * @returns {Promise<{ok: number, user: string, db: string, roles: any[]}>}
 */
async function setUserRoles(client, dbName, username, roles) {
  if (!client || typeof client.db !== "function") {
    throw new Error("A connected MongoClient instance is required");
  }
  if (!dbName || !username) {
    throw new Error("dbName and username are required");
  }
  if (!Array.isArray(roles) || roles.length === 0) {
    throw new Error("roles must be a non-empty array");
  }

  const db = client.db(dbName);
  const resolvedRoles = resolveRoles(roles, dbName);
  await db.command({ updateUser: username, roles: resolvedRoles });
  return { ok: 1, user: username, db: dbName, roles: resolvedRoles };
}

module.exports = { changePassword, setUserRoles };
