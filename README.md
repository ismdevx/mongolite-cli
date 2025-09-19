<div align="center">

# 🍃 Mongolite CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Powerful colorful CLI for MongoDB: databases, users, roles, collections, dump/import – Local, VPS & Atlas.

 </div>

## ✨ Features
- 🎨 Colorized output
- 🗄️ Create / list / delete databases + existence check
- 👥 Create users, change passwords, reset roles
- 🎯 One-command bootstrap (`setup`)
- 🔑 Role assignment via names or numeric codes
- 📦 List & delete collections
- 💾 Dump/import single or all databases
- 🌐 Atlas / VPS / Local connection support
- 🔐 Auth & authSource handling
- 🔧 Connection and user auth testing
- 🛡️ Special character password support (quoted)
- 📊 Extended predefined role map
- 🚀 Global binaries: `mongocli`, `mongolite`, `mongolite-cli`
- ⚙️ `.env` or full URI configuration
- 🧪 Placeholder collection for new DB materialization
- 🧷 Minimal footprint, script-friendly
- 🌍 Cross‑platform

## 📦 Installation

### Clone and Install
```bash
git clone https://github.com/ismdevx/mongolite-cli.git
cd mongolite-cli
npm install
npm link
```

### Usage
```bash
mongocli <command> [arguments]
```
Aliases: `mongocli`, `mongolite`, `mongolite-cli`

## 🚀 Quick Start
```bash
cp .env.example .env
```
**Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=YourApp
```
**Local/VPS:**
```env
DB_HOST=localhost
DB_PORT=27017
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
AUTH_DB=admin
```
Special characters:
```env
ADMIN_PASSWORD="myP@ssw0rd#with!special%chars"
```
Create DB:
```bash
mongocli create-db myapp
```
Create user:
```bash
mongocli create-user myapp appuser strong_password readWrite
```
List:
```bash
mongocli list-db
```
Help:
```bash
mongocli help
```

## 🖥️ VPS Setup
```bash
mongocli setup admin admin "your_secure_password" root
mongocli connection --host your-vps-ip --port 27017 --user admin
```
Example with special chars:
```bash
mongocli setup admin admin "myP@ssw0rd#123!" root
```

## 🎯 Common Usage Examples
```bash
mongocli setup myapp app_user "secure_pass123" readWrite
mongocli dump db production ./backup/
mongocli import db development ./backup/production --drop
mongocli create-user reporting report_user "report_pass" read
mongocli set-roles reporting report_user read,dbAdmin
```

## 📚 Available Commands
### Database
```bash
mongocli create-db <dbName> [collectionName]
mongocli list-db
mongocli delete-db <dbName>
mongocli db-exists <dbName>
```
### Users
```bash
mongocli create-user <dbName> <username> <password> [role1,role2,...]
mongocli setup <dbName> <username> <password> [role1,role2,...]
mongocli change-password <dbName> <username> <newPassword>
mongocli set-roles <dbName> <username> <role1,role2,...>
mongocli list-users <dbName>
mongocli all users
mongocli delete-user <dbName> <username>
mongocli auth-user <dbName> <username> <password>
```
### Collections
```bash
mongocli list-collections <dbName>
mongocli delete-collection <dbName> <collectionName>
```
### Import / Export
```bash
mongocli dump db <dbName> [outDir] [--include-system-collections]
mongocli dump all [outDir] [--include-system-dbs] [--include-system-collections]
mongocli import db <dbName> <dir> [--drop] [--upsert]
mongocli import all <rootDir> [--drop] [--upsert]
```
### Utility
```bash
mongocli connection --host <host> --port <port> --user <user>
mongocli use-db <dbName>
mongocli help
```

## 🔧 Configuration
**Atlas URI:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=YourApp
```
**Individual Vars:**
```env
DB_HOST=localhost
DB_PORT=27017
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
AUTH_DB=admin
```
| Variable | Default | Description |
|----------|---------|-------------|
| MONGODB_URI | - | Full connection string (overrides others) |
| DB_HOST | localhost | Hostname |
| DB_PORT | 27017 | Port |
| ADMIN_USERNAME | - | Admin username |
| ADMIN_PASSWORD | - | Admin password |
| AUTH_DB | admin | Authentication database |

## MongoDB Roles
Database: `read`, `readWrite`, `dbAdmin`, `dbOwner`, `userAdmin`

Cluster: `readAnyDatabase`, `readWriteAnyDatabase`, `dbAdminAnyDatabase`, `userAdminAnyDatabase`, `clusterMonitor`, `clusterManager`, `clusterAdmin`

## � Security Considerations
1. Keep credentials in `.env`
2. Use strong unique passwords
3. Assign least privilege
4. Restrict network access

## 💡 Role Codes (Alternative Usage)
| Code | Role |
|------|------|
| 1 | read |
| 2 | readWrite |
| 3 | dbAdmin |
| 4 | dbOwner |
| 5 | userAdmin |
| 6 | readAnyDatabase |
| 7 | readWriteAnyDatabase |
| 8 | dbAdminAnyDatabase |
| 9 | userAdminAnyDatabase |
| 10 | clusterMonitor |
| 11 | clusterManager |
| 12 | clusterAdmin |
| 13 | hostManager |
| 14 | backup |
| 15 | restore |
| 99 | root |
Example:
```bash
mongocli create-user mydb appuser strong_password 2,3
mongocli set-roles mydb appuser 1
```

## 📝 Notes
- If admin creds set → authenticated connection
- Placeholder `test` collection created for new DB visibility

## ⭐ Support
If this project helps you, please star it ⭐

## 🤝 Contributing
1. Fork
2. Branch `feat/xyz`
3. Commit & push
4. Open PR

## 🐛 Issues
Use GitHub Issues for bugs & feature requests.

## 📄 License
MIT License (see `LICENSE`).

## � Alternative Usage
Run without global install:
```bash
node mongodb.js <command> [args]
```

### Clone and Install

```bash
git clone https://github.com/ismdevx/mongolite-cli.git
cd mongolite-cli
npm install
npm link
```

### Usage

After running `npm link`, you can use the global command:

```bash
mongocli <command> [arguments]
```

Alternative commands available:

- `mongocli` (recommended short form)
- `mongolite`
- `mongolite-cli`

## 🚀 Quick Start

### 1. Setup Environment (Optional)

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB connection details:

**For MongoDB Atlas (Cloud):**

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=YourApp
```

**For Local/VPS MongoDB:**

```env
DB_HOST=localhost
DB_PORT=27017
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
AUTH_DB=admin
```

**⚠️ Important:** If your password contains special characters (`#`, `!`, `@`, `%`, etc.), wrap it in quotes:

```env
ADMIN_PASSWORD="myP@ssw0rd#with!special%chars"
```

### 2. Create a Database

```bash
mongocli create-db myapp
```

### 3. Create a User

```bash
mongocli create-user myapp appuser strong_password readWrite
```

### 4. List Databases

```bash
mongocli list-db
```

### 5. View Help

```bash
mongocli help
```

## �️ VPS Setup

For VPS/Remote MongoDB server initial setup, create a root admin user with full permissions:

```bash
# Create root admin user with full cluster access
mongocli setup admin admin "your_secure_password" root

# Alternative: Use cluster admin role for full permissions
mongocli setup admin admin "your_secure_password" clusterAdmin

# Verify the admin user was created
mongocli list-users admin
```

**Recommended VPS Admin Roles:**

- `root` - MongoDB superuser with all privileges
- `clusterAdmin` - Full cluster administration access
- `userAdminAnyDatabase` - Manage users across all databases
- `dbAdminAnyDatabase` - Database administration across all databases

**Example with special characters in password:**

```bash
mongocli setup admin admin "myP@ssw0rd#123!" root
```

## �📚 Available Commands

### Database Operations

```bash
# Create a database with optional collection
mongocli create-db <dbName> [collectionName]

# List all databases
mongocli list-db

# Delete a database
mongocli delete-db <dbName>
```

### User Management

```bash
# Create a user with roles
mongocli create-user <dbName> <username> <password> [role1,role2,...]

# Setup database and user in one command
mongocli setup <dbName> <username> <password> [role1,role2,...]

# Change user password
mongocli change-password <dbName> <username> <newPassword>

# Set user roles (replaces existing roles)
mongocli set-roles <dbName> <username> <role1,role2,...>

# List users in a database
mongocli list-users <dbName>

# List all users across all databases
mongocli all users

# Delete a user
mongocli delete-user <dbName> <username>
```

### Collection Operations

```bash
# List collections in a database
mongocli list-collections <dbName>

# Delete a collection
mongocli delete-collection <dbName> <collectionName>
```

### Data Import/Export

```bash
# Dump a specific database
mongocli dump db <dbName> [outDir] [--include-system-collections]

# Dump all databases
mongocli dump all [outDir] [--include-system-dbs] [--include-system-collections]

# Import a database
mongocli import db <dbName> <dir> [--drop] [--upsert]

# Import all databases
mongocli import all <rootDir> [--drop] [--upsert]
```

### Utility Commands

```bash
# Test database connection
mongocli connection --host <hostname> --port <port> --user <username>

# Check if database exists
mongocli db-exists <dbName>

# Authenticate user
mongocli auth-user <dbName> <username> <password>

# Switch to a database (shows connection info)
mongocli use-db <dbName>
```

### Help

```bash
mongocli help
mongocli -h
mongocli --help
```

## 🔧 Configuration

### Connection Methods

**Method 1: MongoDB URI (Recommended for Atlas)**

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=YourApp
```

**Method 2: Individual Environment Variables (Local/VPS)**

```env
DB_HOST=localhost
DB_PORT=27017
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
AUTH_DB=admin
```

### Environment Variables

All environment variables are optional with sensible defaults:

| Variable         | Default     | Description                                           |
| ---------------- | ----------- | ----------------------------------------------------- |
| `MONGODB_URI`    | -           | Complete MongoDB connection string (Atlas/URI format) |
| `DB_HOST`        | `localhost` | MongoDB server hostname                               |
| `DB_PORT`        | `27017`     | MongoDB server port                                   |
| `ADMIN_USERNAME` | -           | Admin username (if auth enabled)                      |
| `ADMIN_PASSWORD` | -           | Admin password (if auth enabled)                      |
| `AUTH_DB`        | `admin`     | Authentication database                               |

**⚠️ Password Special Characters:** If your password contains special characters (`#`, `!`, `@`, `%`, etc.), wrap it in quotes:

```env
ADMIN_PASSWORD="myP@ssw0rd#with!special%chars"
```

### MongoDB Roles

You can specify user roles using standard MongoDB role names:

**Database-specific roles:**

- `read` - Read data from all non-system collections
- `readWrite` - Read and write data to all non-system collections
- `dbAdmin` - Database administration tasks
- `dbOwner` - Full access to the database
- `userAdmin` - Create and modify users and roles

**Cluster-wide roles:**

- `readAnyDatabase` - Read data from all databases
- `readWriteAnyDatabase` - Read and write data to all databases
- `dbAdminAnyDatabase` - Database admin tasks on all databases
- `userAdminAnyDatabase` - User admin tasks on all databases
- `clusterMonitor` - Monitor cluster
- `clusterManager` - Manage cluster
- `clusterAdmin` - Full cluster access

## 🔒 Security Considerations

1. **Environment Variables**: Store sensitive credentials in `.env` files, never commit them to version control
2. **Strong Passwords**: Use strong, unique passwords for database users
3. **Least Privilege**: Assign minimal required roles to users
4. **Network Security**: Ensure proper network configuration for remote MongoDB instances

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⭐ Support

If you find this project helpful, please consider giving it a star on GitHub! ⭐

Your support helps:

- 🚀 **Motivate development** of new features
- 📈 **Increase project visibility** for other developers
- 🎯 **Prioritize improvements** based on community interest
- 💝 **Show appreciation** for the time and effort invested
<div align="center">

# 🍃 Mongolite CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Powerful colorful CLI for MongoDB: databases, users, roles, collections, dump/import – Local, VPS & Atlas.

</div>

## ✨ Features
- 🎨 Colorized output
- 🗄️ Create / list / delete databases + existence check
- 👥 Create users, change passwords, reset roles
- 🎯 One-command bootstrap (`setup`)
- 🔑 Role assignment via names or numeric codes
- 📦 List & delete collections
- 💾 Dump/import single or all databases
- 🌐 Atlas / VPS / Local connection support
- 🔐 Auth & authSource handling
- 🔧 Connection and user auth testing
- 🛡️ Special character password support (quoted)
- 📊 Extended predefined role map
- 🚀 Global binaries: `mongocli`, `mongolite`, `mongolite-cli`
- ⚙️ `.env` or full URI configuration
- 🧪 Placeholder collection for new DB materialization
- 🧷 Minimal footprint, script-friendly
- 🌍 Cross‑platform
node mongodb.js <command> [arguments]
```
