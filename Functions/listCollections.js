"use strict";

/**
 * List collections in a database.
 * @param {import('mongodb').MongoClient} client
 * @param {string} dbName
 * @returns {Promise<string[]>}
 */
async function listCollections(client, dbName) {
	if (!client || typeof client.db !== "function") {
		throw new Error("A connected MongoClient instance is required");
	}
	if (!dbName) throw new Error("dbName is required");
	const db = client.db(dbName);
	const cols = await db.listCollections().toArray();
	return cols.map((c) => c.name);
}

module.exports = { listCollections };

