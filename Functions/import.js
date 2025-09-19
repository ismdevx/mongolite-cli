"use strict";

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const readline = require("readline");
const { EJSON } = require("bson");

function isDir(p) {
  return fsp.stat(p).then((s) => s.isDirectory()).catch(() => false);
}

function isFile(p) {
  return fsp.stat(p).then((s) => s.isFile()).catch(() => false);
}

async function importCollection(db, collectionName, filePath, { drop = false, batchSize = 1000, upsert = false } = {}) {
  if (drop) {
    try { await db.collection(collectionName).drop(); } catch (_) {}
  }
  const coll = db.collection(collectionName);
  // Create collection if missing
  try { await db.createCollection(collectionName); } catch (_) {}

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  let buffer = [];
  let count = 0;

  async function flushBatch(docs) {
    if (!docs.length) return 0;
    if (upsert) {
      let ok = 0;
      for (const d of docs) {
        const filter = d && d._id != null ? { _id: d._id } : { _id: undefined };
        await coll.replaceOne(filter, d, { upsert: true });
        ok += 1;
      }
      return ok;
    } else {
      try {
        const res = await coll.insertMany(docs, { ordered: false });
        return res.insertedCount || docs.length; // fallback approximation
      } catch (err) {
        // If duplicate key errors occurred, retry one-by-one and skip only duplicates
        const writeErrors = err && (err.writeErrors || err.result?.result?.writeErrors);
        if (err?.code === 11000 || (Array.isArray(writeErrors) && writeErrors.length > 0)) {
          let ok = 0;
          for (const d of docs) {
            try {
              await coll.insertOne(d);
              ok += 1;
            } catch (e) {
              if (e?.code === 11000) {
                // skip duplicate
                continue;
              }
              throw e;
            }
          }
          return ok;
        }
        throw err;
      }
    }
  }
  for await (const line of rl) {
    if (!line.trim()) continue;
  const doc = EJSON.parse(line);
    buffer.push(doc);
    if (buffer.length >= batchSize) {
      count += await flushBatch(buffer);
      buffer = [];
    }
  }
  if (buffer.length) {
    count += await flushBatch(buffer);
  }
  return { collection: collectionName, file: filePath, count };
}

/**
 * Import a database from a directory of NDJSON files (one per collection).
 * @param {import('mongodb').MongoClient} client
 * @param {string} dbName
 * @param {string} dir
 * @param {{ drop?: boolean, batchSize?: number }} [options]
 * @returns {Promise<{db: string, dir: string, collections: Array<{collection: string, file: string, count: number}>}>}
 */
async function importDB(client, dbName, dir, options = {}) {
  if (!client || typeof client.db !== "function") throw new Error("A connected MongoClient instance is required");
  if (!dbName) throw new Error("dbName is required");
  if (!dir) throw new Error("dir is required");

  const absDir = path.resolve(dir);
  if (!(await isDir(absDir))) throw new Error(`Directory not found: ${absDir}`);

  const db = client.db(dbName);
  const entries = await fsp.readdir(absDir, { withFileTypes: true });
  const collections = entries
    .filter((e) => e.isFile() && e.name.endsWith(".ndjson"))
    .map((e) => ({ collection: e.name.replace(/\.ndjson$/, ""), file: path.join(absDir, e.name) }));

  const results = [];
  for (const c of collections) {
    const res = await importCollection(db, c.collection, c.file, options);
    results.push(res);
  }
  return { db: dbName, dir: absDir, collections: results };
}

/**
 * Import all databases from a root directory where each subfolder is a DB name.
 * @param {import('mongodb').MongoClient} client
 * @param {string} rootDir
 * @param {{ drop?: boolean, batchSize?: number }} [options]
 * @returns {Promise<{rootDir: string, dbs: Array<{db: string, dir: string, collections: any[]}>}>}
 */
async function importAllDatabases(client, rootDir, options = {}) {
  if (!client || typeof client.db !== "function") throw new Error("A connected MongoClient instance is required");
  if (!rootDir) throw new Error("rootDir is required");
  const absRoot = path.resolve(rootDir);
  if (!(await isDir(absRoot))) throw new Error(`Directory not found: ${absRoot}`);

  const entries = await fsp.readdir(absRoot, { withFileTypes: true });
  const dbDirs = entries.filter((e) => e.isDirectory());

  const out = [];
  for (const d of dbDirs) {
    const dbName = d.name;
    const dirPath = path.join(absRoot, dbName);
    const res = await importDB(client, dbName, dirPath, options);
    out.push(res);
  }
  return { rootDir: absRoot, dbs: out };
}

module.exports = { importDB, importAllDatabases };
