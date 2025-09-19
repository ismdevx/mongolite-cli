"use strict";

const { dbExists } = require("./dbExists");

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Drop a database.
 * @param {import('mongodb').MongoClient} client
 * @param {string} dbName
 * @returns {Promise<{ok: boolean, dropped: boolean}>}
 */
async function deleteDB(client, dbName) {
	if (!client || typeof client.db !== "function") {
		throw new Error("A connected MongoClient instance is required");
	}
	if (!dbName) throw new Error("dbName is required");
	const db = client.db(dbName);
	const res = await db.dropDatabase();
	let droppedFlag = typeof res.dropped === "string" ? true : !!res.dropped;
	// Verify by checking if the DB still exists; retry briefly to handle eventual consistency
	try {
		for (let i = 0; i < 20; i++) {
			const existsAfter = await dbExists(client, dbName);
			if (!existsAfter) {
				droppedFlag = true;
				break;
			}
			await sleep(250);
		}
	} catch (_) {
		// Ignore verification errors and fall back to server response
	}
	return { ok: res.ok === 1, dropped: droppedFlag };
}

module.exports = { deleteDB };

