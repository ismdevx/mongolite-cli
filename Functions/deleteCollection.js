"use strict";

/**
 * Delete a collection from a database if it exists.
 * @param {import('mongodb').MongoClient} client
 * @param {string} dbName
 * @param {string} collectionName
 * @returns {Promise<{ok: boolean, dropped: boolean}>}
 */
async function deleteCollection(client, dbName, collectionName) {
	if (!client || typeof client.db !== "function") {
		throw new Error("A connected MongoClient instance is required");
	}
	if (!dbName || !collectionName) {
		throw new Error("dbName and collectionName are required");
	}
	const db = client.db(dbName);
	const exists = await db.listCollections({ name: collectionName }).hasNext();
	if (!exists) return { ok: true, dropped: false };
	const res = await db.collection(collectionName).drop();
	return { ok: true, dropped: !!res };
}

module.exports = { deleteCollection };

