"use strict";
const { resolveRoles } = require("./roleUtils");

/**
 * Create or update a DB user with roles.
 * Requires admin privileges on the target database.
 *
 * @param {import('mongodb').MongoClient} client Connected MongoClient
 * @param {string} dbName Target database name
 * @param {string} username Username to create/update
 * @param {string} password Password for the user
 * @param {Array<{role: string, db: string}> | string[] | number[]} [roles] Roles to grant (supports numeric codes; defaults to readWrite on target DB)
 * @returns {Promise<{ok: number, user: string, db: string, created: boolean}>}
 */
async function createUser(client, dbName, username, password, roles) {
	if (!client || typeof client.db !== "function") {
		throw new Error("A connected MongoClient instance is required");
	}
	if (!dbName) throw new Error("dbName is required");
	if (!username) throw new Error("username is required");
	if (!password) throw new Error("password is required");

	const db = client.db(dbName);

		const defaultRoles = [{ role: "readWrite", db: dbName }];
		const resolvedRoles = Array.isArray(roles) && roles.length > 0
			? resolveRoles(roles, dbName)
			: defaultRoles;

	const usersInfo = await db.command({ usersInfo: username });
	const exists = Array.isArray(usersInfo.users) && usersInfo.users.length > 0;

	if (exists) {
		await db.command({
			updateUser: username,
			pwd: password,
			roles: resolvedRoles,
		});
		return { ok: 1, user: username, db: dbName, created: false };
	}

	await db.command({
		createUser: username,
		pwd: password,
		roles: resolvedRoles,
	});
	return { ok: 1, user: username, db: dbName, created: true };
}

module.exports = { createUser };

