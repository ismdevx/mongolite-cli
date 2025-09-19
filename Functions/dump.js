"use strict";

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { EJSON } = require("bson");

function sanitize(name) {
	return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function ensureDir(dir) {
	await fsp.mkdir(dir, { recursive: true });
}

async function dumpCollection(db, collectionName, outDir) {
	const filePath = path.join(outDir, `${sanitize(collectionName)}.ndjson`);
	await ensureDir(outDir);
	const ws = fs.createWriteStream(filePath, { encoding: "utf8" });
	const cursor = db.collection(collectionName).find({}, { batchSize: 1000 });
	let count = 0;
	for await (const doc of cursor) {
		ws.write(EJSON.stringify(doc) + "\n");
		count++;
	}
	await new Promise((resolve, reject) => {
		ws.end(() => resolve());
		ws.on("error", reject);
	});
	return { collection: collectionName, file: filePath, count };
}

/**
 * Dump a single database into an output directory as NDJSON files (one per collection).
 * @param {import('mongodb').MongoClient} client
 * @param {string} dbName
 * @param {{ outDir?: string, includeSystemCollections?: boolean }} [options]
 * @returns {Promise<{db: string, outDir: string, collections: Array<{collection: string, file: string, count: number}>, errors: Array<{collection: string, error: string}>}>}
 */
async function dumpDB(client, dbName, options = {}) {
	if (!client || typeof client.db !== "function") {
		throw new Error("A connected MongoClient instance is required");
	}
	if (!dbName) throw new Error("dbName is required");
	const rootOut = path.resolve(options.outDir || "dump");
	const dbOutDir = path.join(rootOut, sanitize(dbName));
	await ensureDir(dbOutDir);
	const db = client.db(dbName);
	const includeSystemCollections = !!options.includeSystemCollections;
	const collections = await db.listCollections({}, { nameOnly: true }).toArray();
	const results = [];
	const errors = [];
	for (const c of collections) {
		if (!includeSystemCollections && typeof c.name === "string" && c.name.startsWith("system.")) {
			continue;
		}
		try {
			const res = await dumpCollection(db, c.name, dbOutDir);
			results.push(res);
		} catch (err) {
			errors.push({ collection: c.name, error: (err && err.message) || String(err) });
		}
	}
	return { db: dbName, outDir: dbOutDir, collections: results, errors };
}

/**
 * Dump all databases into subdirectories under the output directory.
 * @param {import('mongodb').MongoClient} client
 * @param {{ outDir?: string, includeSystemDbs?: boolean, includeSystemCollections?: boolean }} [options]
 * @returns {Promise<{outDir: string, dbs: Array<{db: string, outDir: string, collections: Array<{collection: string, file: string, count: number}>, errors: Array<{collection: string, error: string}>}>, skippedDbs: string[], failedDbs: Array<{db: string, error: string}>}>}
 */
async function dumpAllDatabases(client, options = {}) {
	if (!client || typeof client.db !== "function") {
		throw new Error("A connected MongoClient instance is required");
	}
	const rootOut = path.resolve(options.outDir || "dump");
	await ensureDir(rootOut);
	const adminDb = client.db().admin();
	const { databases } = await adminDb.listDatabases({ nameOnly: true });
	const SYSTEM_DB_SET = new Set(["admin", "local", "config"]);
	const includeSystemDbs = !!options.includeSystemDbs;
	const includeSystemCollections = !!options.includeSystemCollections;
	const dbs = [];
	const skippedDbs = [];
	const failedDbs = [];
	for (const d of databases || []) {
		const name = d.name;
		if (!includeSystemDbs && SYSTEM_DB_SET.has(name)) {
			skippedDbs.push(name);
			continue;
		}
		try {
			const res = await dumpDB(client, name, { outDir: rootOut, includeSystemCollections });
			dbs.push(res);
		} catch (err) {
			failedDbs.push({ db: name, error: (err && err.message) || String(err) });
		}
	}
	return { outDir: rootOut, dbs, skippedDbs, failedDbs };
}

module.exports = { dumpDB, dumpAllDatabases };

