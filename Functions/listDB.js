"use strict";

/**
 * List database names visible to the connected user.
 * @param {import('mongodb').MongoClient} client
 * @returns {Promise<string[]>}
 */
async function listDB(client) {
	if (!client || typeof client.db !== "function") {
		throw new Error("A connected MongoClient instance is required");
	}
	const adminDb = client.db().admin();
	const { databases } = await adminDb.listDatabases({ nameOnly: true });
	return (databases || []).map((d) => d.name);
}

module.exports = { listDB };

