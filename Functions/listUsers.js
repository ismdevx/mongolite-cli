"use strict";

/**
 * List users on a specific database.
 * @param {import('mongodb').MongoClient} client
 * @param {string} dbName
 * @returns {Promise<Array<{user: string, roles: any[]}>>}
 */
async function listUsers(client, dbName) {
	if (!client || typeof client.db !== "function") {
		throw new Error("A connected MongoClient instance is required");
	}
	if (!dbName) throw new Error("dbName is required");
	const db = client.db(dbName);
	const res = await db.command({ usersInfo: 1 });
	return (res.users || []).map((u) => ({ user: u.user, roles: u.roles || [] }));
}

module.exports = { listUsers };

