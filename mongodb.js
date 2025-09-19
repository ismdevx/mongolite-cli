#!/usr/bin/env node
"use strict";

require("dotenv").config();
const colors = require("colors");
const { MongoClient } = require("mongodb");
const { createDB } = require("./Functions/createDB.js");
const { createUser } = require("./Functions/createUser.js");
const { changePassword, setUserRoles } = require("./Functions/authUser.js");
const { listUsers } = require("./Functions/listUsers.js");
const { deleteUser } = require("./Functions/deleteUser.js");
const { listCollections } = require("./Functions/listCollections.js");
const { deleteCollection } = require("./Functions/deleteCollection.js");
const { deleteDB } = require("./Functions/deleteDB.js");
const { listDB } = require("./Functions/listDB.js");
const { listAllUsers } = require("./Functions/allUsers.js");
const { dumpDB, dumpAllDatabases } = require("./Functions/dump.js");
const { importDB, importAllDatabases } = require("./Functions/import.js");

function usage() {
	console.log(
		[
			colors.cyan.bold("MongoDB Manager"),
			"",
			colors.yellow.bold("Usage:"),
			"",
			colors.green.bold("Database Operations:"),
			colors.white("  mongocli ") + colors.blue("create-db") + colors.gray(" <dbName> [collectionName]"),
			colors.white("  mongocli ") + colors.blue("list-db"),
			colors.white("  mongocli ") + colors.blue("delete-db") + colors.gray(" <dbName>"),
			"",
			colors.green.bold("User Management:"),
			colors.white("  mongocli ") + colors.blue("create-user") + colors.gray(" <dbName> <username> <password> [role1,role2,...]"),
			colors.white("  mongocli ") + colors.blue("setup") + colors.gray(" <dbName> <username> <password> [role1,role2,...]"),
			colors.white("  mongocli ") + colors.blue("change-password") + colors.gray(" <dbName> <username> <newPassword>"),
			colors.white("  mongocli ") + colors.blue("set-roles") + colors.gray(" <dbName> <username> <role1,role2,...>"),
			colors.white("  mongocli ") + colors.blue("list-users") + colors.gray(" <dbName>"),
			colors.white("  mongocli ") + colors.blue("delete-user") + colors.gray(" <dbName> <username>"),
			colors.white("  mongocli ") + colors.blue("all users"),
			"",
			colors.green.bold("Collection Operations:"),
			colors.white("  mongocli ") + colors.blue("list-collections") + colors.gray(" <dbName>"),
			colors.white("  mongocli ") + colors.blue("delete-collection") + colors.gray(" <dbName> <collectionName>"),
			"",
			colors.green.bold("Data Import/Export:"),
			colors.white("  mongocli ") + colors.blue("dump db") + colors.gray(" <dbName> [outDir] ") + colors.magenta("[--include-system-collections]"),
			colors.white("  mongocli ") + colors.blue("dump all") + colors.gray(" [outDir] ") + colors.magenta("[--include-system-dbs] [--include-system-collections]"),
			colors.white("  mongocli ") + colors.blue("import db") + colors.gray(" <dbName> <dir> ") + colors.magenta("[--drop] [--upsert]"),
			colors.white("  mongocli ") + colors.blue("import all") + colors.gray(" <rootDir> ") + colors.magenta("[--drop] [--upsert]"),
			"",
			colors.green.bold("Help:"),
			colors.white("  mongocli ") + colors.blue("help"),
			colors.white("  mongocli ") + colors.blue("-h"),
			colors.white("  mongocli ") + colors.blue("--help"),
			"",
			colors.green.bold("Utilities:"),
			colors.white("  mongocli ") + colors.blue("connection") + colors.gray(" <dbName> [--host <ip>] [--port <port>] [--user <username>]"),
			"",
			colors.yellow.bold("Environment Variables (optional):"),
			colors.cyan("  DB_HOST") + colors.gray(" (default: localhost)"),
			colors.cyan("  DB_PORT") + colors.gray(" (default: 27017)"),
			colors.cyan("  ADMIN_USERNAME, ADMIN_PASSWORD") + colors.gray(" (if auth is enabled)"),
			colors.cyan("  AUTH_DB") + colors.gray(" (default: admin)"),
		].join("\n")
	);
}

function getAdminUri() {
	const host = process.env.DB_HOST || "localhost";
	const port = process.env.DB_PORT || "27017";
	const adminUser = process.env.ADMIN_USERNAME;
	const adminPass = process.env.ADMIN_PASSWORD;
	const authSource = process.env.AUTH_DB || "admin";

	if (adminUser && adminPass) {
		return `mongodb://${encodeURIComponent(adminUser)}:${encodeURIComponent(
			adminPass
		)}@${host}:${port}/?authSource=${encodeURIComponent(authSource)}`;
	}

	// No credentials provided; connect without auth (e.g., local dev without security).
	return `mongodb://${host}:${port}/`;
}

function buildConnectionUri({ dbName, user, host, port, maskPassword } = {}) {
	const Host = host || process.env.DB_HOST || "localhost";
	const Port = port || process.env.DB_PORT || "27017";
	
	const cred = user ? `${encodeURIComponent(user)}:${maskPassword ? "<:password:>" : ""}@` : "";
	const dbSuffix = dbName ? `/${encodeURIComponent(dbName)}` : "/";

	return `mongodb://${cred}${Host}:${Port}${dbSuffix}`;
}

async function withClient(cb) {
	const uri = getAdminUri();
	const client = new MongoClient(uri, {
		serverSelectionTimeoutMS: 5000,
	});
	try {
		await client.connect();
		return await cb(client);
	} finally {
		await client.close().catch(() => {});
	}
}

async function main() {
	const [cmd, ...args] = process.argv.slice(2);
	if (!cmd) {
		usage();
		process.exit(1);
	}

	try {
		switch (cmd) {
			case "create-db": {
				const [dbName, collectionName] = args;
				if (!dbName) throw new Error("dbName is required");
				const result = await withClient((client) =>
					createDB(client, dbName, { collectionName })
				);
				const isPlaceholder = !!result.placeholder;
				if (result.created) {
					console.log(
						isPlaceholder
							? `Database '${dbName}' created with placeholder collection '${result.collection}'.`
							: `Database '${dbName}' created (collection '${result.collection}').`
					);
				} else {
					console.log(
						isPlaceholder
							? `Database '${dbName}' exists (placeholder '${result.collection}' present).`
							: `Database '${dbName}' already exists (collection '${result.collection}').`
					);
				}
				break;
			}
			case "list-db": {
				const dbs = await withClient((client) => listDB(client));
				if (!dbs.length) console.log("No databases found or insufficient privileges.");
				else dbs.forEach((n) => console.log(n));
				break;
			}

			case "all": {
				const [sub, ...rest] = args;
				if (sub === "users") {
					const users = await withClient((client) => listAllUsers(client));
					if (!users.length) console.log("No users found or insufficient privileges.");
					else users.forEach((u) => console.log(`${u.user}@${u.db}: ${u.roles.map(r=>r.role).join(',')}`));
					break;
				}
				usage();
				break;
			}
			case "create-user": {
				const [dbName, username, password, rolesCsv] = args;
				if (!dbName || !username || !password)
					throw new Error("dbName, username, and password are required");
				const roles = rolesCsv ? rolesCsv.split(",").map((s) => s.trim()) : undefined;
				const result = await withClient((client) =>
					createUser(client, dbName, username, password, roles)
				);
				console.log(
					result.created
						? `User '${username}' created on '${dbName}'.`
						: `User '${username}' updated on '${dbName}'.`
				);
				break;
			}
			case "dump": {
				const [sub, ...rest] = args;
				if (sub === "db") {
					const flags = rest.filter((a) => typeof a === "string" && a.startsWith("--"));
					const positional = rest.filter((a) => typeof a === "string" && !a.startsWith("--"));
					const includeSystemCollections = flags.includes("--include-system-collections");
					const [dbName, outDir] = positional;
					if (!dbName) throw new Error("dbName is required");
					const res = await withClient((client) => dumpDB(client, dbName, { outDir, includeSystemCollections }));
					const extra = (res.errors && res.errors.length) ? `, ${res.errors.length} collections failed` : "";
					console.log(`Dumped '${res.db}' to '${res.outDir}' (${res.collections.length} collections${extra}).`);
					break;
				}
				if (sub === "all") {
					const flags = rest.filter((a) => typeof a === "string" && a.startsWith("--"));
					const positional = rest.filter((a) => typeof a === "string" && !a.startsWith("--"));
					const includeSystemDbs = flags.includes("--include-system-dbs");
					const includeSystemCollections = flags.includes("--include-system-collections");
					const [outDir] = positional;
					const res = await withClient((client) => dumpAllDatabases(client, { outDir, includeSystemDbs, includeSystemCollections }));
					const skippedInfo = (res.skippedDbs && res.skippedDbs.length) ? `, skipped: ${res.skippedDbs.join(',')}` : "";
					const failedInfo = (res.failedDbs && res.failedDbs.length) ? `, failed: ${res.failedDbs.map(f=>f.db).join(',')}` : "";
					console.log(`Dumped ${res.dbs.length} databases to '${res.outDir}'${skippedInfo}${failedInfo}.`);
					break;
				}
				usage();
				break;
			}
			case "import": {
				const [sub, ...rest] = args;
				const flags = rest.filter((a) => typeof a === "string" && a.startsWith("--"));
				const wantsDrop = flags.includes("--drop");
				const wantsUpsert = flags.includes("--upsert");
				const positional = rest.filter((a) => typeof a === "string" && !a.startsWith("--"));
				if (sub === "db") {
					const [dbName, dir] = positional;
					if (!dbName || !dir) throw new Error("Usage: import db <dbName> <dir> [--drop] [--upsert]");
					const res = await withClient((client) => importDB(client, dbName, dir, { drop: wantsDrop, upsert: wantsUpsert }));
					console.log(`Imported '${res.db}' from '${res.dir}' (${res.collections.length} collections).`);
					break;
				}
				if (sub === "all") {
					const [rootDir] = positional;
					if (!rootDir) throw new Error("Usage: import all <rootDir> [--drop] [--upsert]");
					const res = await withClient((client) => importAllDatabases(client, rootDir, { drop: wantsDrop, upsert: wantsUpsert }));
					console.log(`Imported ${res.dbs.length} databases from '${res.rootDir}'.`);
					break;
				}
				usage();
				break;
			}
			case "setup": {
				const [dbName, username, password, rolesCsv] = args;
				if (!dbName || !username || !password)
					throw new Error("dbName, username, and password are required");
				const roles = rolesCsv ? rolesCsv.split(",").map((s) => s.trim()) : undefined;
				const output = await withClient(async (client) => {
					const dbRes = await createDB(client, dbName);
					const userRes = await createUser(client, dbName, username, password, roles);
					return { dbRes, userRes };
				});
				console.log(
					`DB: ${output.dbRes.created ? "created" : "exists"}; User: ${
						output.userRes.created ? "created" : "updated"
					}.`
				);
				break;
			}
					case "change-password": {
						const [dbName, username, newPassword] = args;
						if (!dbName || !username || !newPassword)
							throw new Error("dbName, username, and newPassword are required");
						await withClient((client) => changePassword(client, dbName, username, newPassword));
						console.log(`Password updated for '${username}' on '${dbName}'.`);
						break;
					}
					case "set-roles": {
						const [dbName, username, rolesCsv] = args;
						if (!dbName || !username || !rolesCsv)
							throw new Error("dbName, username, and roles are required");
						const roles = rolesCsv.split(",").map((s) => s.trim());
						await withClient((client) => setUserRoles(client, dbName, username, roles));
						console.log(`Roles set for '${username}' on '${dbName}': ${roles.join(",")}`);
						break;
					}
							case "list-users": {
								const [dbName] = args;
								if (!dbName) throw new Error("dbName is required");
								const users = await withClient((client) => listUsers(client, dbName));
								if (!users.length) console.log(`No users found on '${dbName}'.`);
								else users.forEach((u) => {
									const rolesStr = (u.roles || [])
										.map((r) => (r && r.db ? `${r.role}@${r.db}` : (r?.role || "")))
										.filter(Boolean)
										.join(',');
									console.log(`${u.user}: ${rolesStr}`);
								});
								break;
							}
							case "delete-user": {
								const [dbName, username] = args;
								if (!dbName || !username) throw new Error("dbName and username are required");
								const res = await withClient((client) => deleteUser(client, dbName, username));
								console.log(res.dropped ? `User '${username}' deleted from '${dbName}'.` : `User '${username}' not found on '${dbName}'.`);
								break;
							}
							case "list-collections": {
								const [dbName] = args;
								if (!dbName) throw new Error("dbName is required");
								const cols = await withClient((client) => listCollections(client, dbName));
								if (!cols.length) console.log(`No collections in '${dbName}'.`);
								else cols.forEach((c) => console.log(c));
								break;
							}
							case "delete-collection": {
								const [dbName, collectionName] = args;
								if (!dbName || !collectionName) throw new Error("dbName and collectionName are required");
								const res = await withClient((client) => deleteCollection(client, dbName, collectionName));
								console.log(res.dropped ? `Collection '${collectionName}' dropped from '${dbName}'.` : `Collection '${collectionName}' not found in '${dbName}'.`);
								break;
							}
							case "delete-db": {
								const [dbName] = args;
								if (!dbName) throw new Error("dbName is required");
								const res = await withClient((client) => deleteDB(client, dbName));
								console.log(res.dropped ? `Database '${dbName}' dropped.` : `Database '${dbName}' was not dropped.`);
								break;
							}
			case "connection": {
				const [dbName, ...rest] = args;
				if (!dbName) throw new Error("dbName is required");
				
				// Parse --host, --port, and --user flags
				const flags = {};
				for (let i = 0; i < rest.length; i++) {
					const arg = rest[i];
					if (arg === "--host" && rest[i + 1]) {
						flags.host = rest[i + 1];
						i++;
					} else if (arg === "--port" && rest[i + 1]) {
						flags.port = rest[i + 1];
						i++;
					} else if (arg === "--user" && rest[i + 1]) {
						flags.user = rest[i + 1];
						i++;
					}
				}
				
				// Use provided user or auto-detect a DB user
				let user = flags.user;
				if (!user) {
					try {
						const users = await withClient(async (client) => {
							const cmdRes = await client.db(dbName).command({ usersInfo: 1 });
							return (cmdRes && cmdRes.users) || [];
						});
						
						// Prefer dbOwner, then readWrite, then first
						const score = (u) => {
							const roles = (u.roles || []).map((r) => r.role || "");
							if (roles.includes("dbOwner")) return 3;
							if (roles.includes("readWrite")) return 2;
							return 1;
						};
						users.sort((a, b) => score(b) - score(a));
						if (users.length) user = users[0].user;
					} catch (_) {
						// Ignore errors and fall back to default behavior
					}
				}
				
				const uri = buildConnectionUri({
					dbName,
					user,
					host: flags.host,
					port: flags.port,
					maskPassword: true,
				});
				console.log(uri);
				break;
			}
			case "help":
			case "-h":
			case "--help":
				usage();
				break;
			default:
				usage();
				process.exit(1);
		}
	} catch (err) {
		console.error("Error:", err.message || err);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}

module.exports = { getAdminUri, withClient };

