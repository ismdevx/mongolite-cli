"use strict";

/**
 * List all users visible to the connected account across all databases.
 * Requires privileges on the admin database.
 * @param {import('mongodb').MongoClient} client
 * @returns {Promise<Array<{user: string, db: string, roles: any[]}>>}
 */
async function listAllUsers(client) {
	if (!client || typeof client.db !== "function") {
		throw new Error("A connected MongoClient instance is required");
	}
	const adminDb = client.db().admin();
	// Gather all database names (ensure 'admin' included)
	const { databases } = await adminDb.listDatabases({ nameOnly: true });
	const names = new Set(["admin", ...(databases || []).map((d) => d.name)]);

	const out = [];
	for (const name of names) {
		try {
			const res = await client.db(name).command({ usersInfo: 1 });
			const users = Array.isArray(res.users) ? res.users : [];
			for (const u of users) {
				out.push({ user: u.user, db: u.db, roles: u.roles || [] });
			}
		} catch (_) {
			// Skip DBs we cannot query due to permissions
		}
	}
	return out;
}

module.exports = { listAllUsers };

