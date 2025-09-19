"use strict";

const ROLE_MAP = {
  1: "read",
  2: "readWrite",
  3: "dbAdmin",
  4: "dbOwner",
  5: "userAdmin",
  6: "readAnyDatabase",
  7: "readWriteAnyDatabase",
  8: "dbAdminAnyDatabase",
  9: "userAdminAnyDatabase",
  10: "clusterMonitor",
  11: "clusterManager",
  12: "clusterAdmin",
  13: "hostManager",
  14: "backup",
  15: "restore",
  99: "root",
};

/**
 * Normalize roles into [{role, db}] objects.
 * Supports: numeric codes, role strings, and role@db syntax.
 * If no db specified, defaults to target db. For global roles like
 * readAnyDatabase/root, defaults to `admin` unless overridden by `authDb`.
 *
 * @param {Array<number|string>} roles
 * @param {string} dbName
 * @param {string} [authDb="admin"]
 * @returns {Array<{role: string, db: string}>}
 */
function resolveRoles(roles, dbName, authDb = "admin") {
  if (!Array.isArray(roles) || roles.length === 0) return [];
  const out = [];
  for (const r of roles) {
    if (typeof r === "number") {
      const role = ROLE_MAP[r];
      if (!role) throw new Error(`Unknown role code: ${r}`);
      const db = isGlobalRole(role) ? authDb : dbName;
      out.push({ role, db });
      continue;
    }
    if (typeof r === "string") {
      const code = Number(r);
      if (!Number.isNaN(code)) {
        const role = ROLE_MAP[code];
        if (!role) throw new Error(`Unknown role code: ${r}`);
        const db = isGlobalRole(role) ? authDb : dbName;
        out.push({ role, db });
        continue;
      }
      if (r.includes("@")) {
        const [role, db] = r.split("@");
        out.push({ role: role.trim(), db: (db || dbName).trim() });
        continue;
      }
      const db = isGlobalRole(r) ? authDb : dbName;
      out.push({ role: r, db });
      continue;
    }
    throw new Error("Role entries must be strings or numbers");
  }
  return out;
}

function isGlobalRole(role) {
  return (
    role === "root" ||
    role.endsWith("AnyDatabase") ||
    role.startsWith("cluster") ||
    role === "hostManager" ||
    role === "backup" ||
    role === "restore"
  );
}

module.exports = { resolveRoles, ROLE_MAP };
