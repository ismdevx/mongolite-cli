"use strict";

const { MongoServerError } = require("mongodb");
const { dbExists } = require("./dbExists");

/**
 * Ensure a database exists by creating a collection if needed.
 * MongoDB creates databases lazily; creating a collection materializes it.
 *
 * @param {import('mongodb').MongoClient} client Connected MongoClient
 * @param {string} dbName Database name to create
 * @param {{collectionName?: string}} [options]
 * @returns {Promise<{created: boolean, exists?: boolean, dbName: string, collection: string|null, skipped?: boolean}>}
 */
async function createDB(client, dbName, options = {}) {
	if (!client || typeof client.db !== "function") {
		throw new Error("A connected MongoClient instance is required");
	}
	if (!dbName || typeof dbName !== "string") {
		throw new Error("dbName must be a non-empty string");
	}

	const requestedCollection = options.collectionName;
	const db = client.db(dbName);
	const existsBefore = await dbExists(client, dbName);

	// If no collection specified, create a lightweight placeholder to materialize the DB
	const targetCollection = requestedCollection || "test";
	const isPlaceholder = !requestedCollection;

	const existing = await db.listCollections({ name: targetCollection }).toArray();
	if (existing.length > 0) {
		return {
			created: false,
			exists: existsBefore || true,
			dbName,
			collection: targetCollection,
			placeholder: isPlaceholder || undefined,
		};
	}

	try {
		await db.createCollection(targetCollection);
		return {
			created: true,
			exists: existsBefore,
			dbName,
			collection: targetCollection,
			placeholder: isPlaceholder || undefined,
		};
	} catch (err) {
		if (err instanceof MongoServerError && err.codeName === "NamespaceExists") {
			return {
				created: false,
				exists: true,
				dbName,
				collection: targetCollection,
				placeholder: isPlaceholder || undefined,
			};
		}
		throw err;
	}
}

module.exports = { createDB };

