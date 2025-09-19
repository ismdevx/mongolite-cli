"use strict";

/**
 * Check if a database exists by inspecting the server's databases list.
 * Note: listDatabases shows only DBs with data. A DB with no collections and
 * no data may not appear. As a fallback, we also check for any collections.
 * @param {import('mongodb').MongoClient} client
 * @param {string} dbName
 * @returns {Promise<boolean>}
 */
async function dbExists(client, dbName) {
  if (!client || typeof client.db !== "function") {
    throw new Error("A connected MongoClient instance is required");
  }
  if (!dbName) throw new Error("dbName is required");

  // Primary check: listDatabases
  try {
    const adminDb = client.db().admin();
    const { databases } = await adminDb.listDatabases({ nameOnly: true });
    if (Array.isArray(databases) && databases.some((d) => d.name === dbName)) {
      return true;
    }
  } catch (_) {
    // Ignore permission errors; fall through to collection check
  }

  // Fallback: check if any collections exist in the DB
  try {
    const db = client.db(dbName);
    const cursor = db.listCollections({}, { nameOnly: true });
    const hasAny = await cursor.hasNext();
    if (hasAny) return true;
  } catch (_) {}

  return false;
}

module.exports = { dbExists };
