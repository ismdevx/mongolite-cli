"use strict";

/**
 * Get a database reference by name.
 * @param {import('mongodb').MongoClient} client
 * @param {string} dbName
 * @returns {import('mongodb').Db}
 */
function useDB(client, dbName) {
	if (!client || typeof client.db !== "function") {
		throw new Error("A connected MongoClient instance is required");
	}
	if (!dbName || typeof dbName !== "string") {
		throw new Error("dbName must be a non-empty string");
	}
	return client.db(dbName);
}

module.exports = { useDB };

