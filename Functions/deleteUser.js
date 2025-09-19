"use strict";

/**
 * Delete (drop) a user from a database.
 * @param {import('mongodb').MongoClient} client
 * @param {string} dbName
 * @param {string} username
 * @returns {Promise<{ok: boolean, dropped: boolean}>}
 */
async function deleteUser(client, dbName, username) {
	if (!client || typeof client.db !== "function") {
		throw new Error("A connected MongoClient instance is required");
	}
	if (!dbName || !username) throw new Error("dbName and username are required");
	const db = client.db(dbName);
	const res = await db.command({ dropUser: username });
	return { ok: res.ok === 1, dropped: res.ok === 1 };
}

module.exports = { deleteUser };

