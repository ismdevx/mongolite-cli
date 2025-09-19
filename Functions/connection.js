"use strict";

require("dotenv").config();
const { MongoClient } = require("mongodb");
const { getAdminUri } = require("../mongodb");

function buildConnectionUri({ dbName, user, pass, host, port, authSource, noAuthSource, useAdmin, maskPassword } = {}) {
	const Host = host || process.env.DB_HOST || "localhost";
	const Port = port || process.env.DB_PORT || "27017";
	const envDbUser = process.env.DB_USERNAME;
	const envDbPass = process.env.DB_PASSWORD;
	const envAdminUser = process.env.ADMIN_USERNAME;
	const envAdminPass = process.env.ADMIN_PASSWORD;
	const User = (user ?? (useAdmin ? envAdminUser : envDbUser)) || "";
	const Pass = (pass ?? (useAdmin ? envAdminPass : envDbPass)) || "";
	let AuthSource = authSource || process.env.AUTH_DB || "";

			const hasCreds = !!(User && Pass);
			const hasUser = !!User;
			const shouldMask = !!maskPassword || (hasUser && !Pass);
	// If creds provided but no authSource, default:
	// - admin: AUTH_DB or 'admin'
	// - db user: the provided dbName
	if (hasCreds && !AuthSource) {
		AuthSource = useAdmin ? (process.env.AUTH_DB || "admin") : (dbName || "");
	}

			const cred = (hasUser && (hasCreds || shouldMask))
				? `${encodeURIComponent(User)}:${shouldMask ? "<:password:>" : encodeURIComponent(Pass)}@`
				: "";
	const dbSuffix = dbName ? `/${encodeURIComponent(dbName)}` : "/";

		const params = new URLSearchParams();
			const suppressAuthSource = (noAuthSource === undefined) ? true : !!noAuthSource;
		if ((hasCreds || shouldMask) && AuthSource && !suppressAuthSource) params.set("authSource", AuthSource);

	const query = params.toString();
	const qs = query ? `?${query}` : "";

	return `mongodb://${cred}${Host}:${Port}${dbSuffix}${qs}`;
}

function parseArgs(argv) {
	const positional = [];
	const flags = {};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a.startsWith("--")) {
			const key = a.slice(2);
			const next = argv[i + 1];
			if (next && !next.startsWith("--")) {
				flags[key] = next;
				i++;
			} else {
				flags[key] = true;
			}
		} else {
			positional.push(a);
		}
	}
	return { positional, flags };
}

if (require.main === module) {
		(async () => {
		const { positional, flags } = parseArgs(process.argv.slice(2));
		const [dbName] = positional;
		const useAdmin = !!(flags["use-admin"] || flags.useAdmin || (!dbName));

			// Sanitize flags without values
			let user = (flags.user === true ? undefined : flags.user);
			let pass = (flags.pass === true ? undefined : flags.pass);

		// If no user provided and we have a dbName, try to auto-detect a DB user
		if (!user && dbName) {
			try {
				const uri = getAdminUri();
				const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
				await client.connect();
				try {
					const cmdRes = await client.db(dbName).command({ usersInfo: 1 });
					const users = (cmdRes && cmdRes.users) || [];
					// Prefer dbOwner, then readWrite, then first
					const score = (u) => {
						const roles = (u.roles || []).map((r) => r.role || "");
						if (roles.includes("dbOwner")) return 3;
						if (roles.includes("readWrite")) return 2;
						return 1;
					};
					users.sort((a, b) => score(b) - score(a));
					if (users.length) user = users[0].user;
				} finally {
					await client.close().catch(() => {});
				}
			} catch (_) {
				// Ignore errors and fall back to env/flags behavior
			}
		}

			const uri = buildConnectionUri({
			dbName,
			user,
			pass,
			host: flags.host,
			port: flags.port,
			authSource: flags["auth-db"] || flags.authdb || flags.authSource,
				noAuthSource: !(flags["include-authsource"] || flags.includeAuthSource),
			useAdmin,
				maskPassword: !!(flags["mask-password"] || flags.mask || flags.template || (!!dbName && !!user)),
		});
		console.log(uri);
	})();
}

module.exports = { buildConnectionUri };

