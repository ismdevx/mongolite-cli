# 🍃 Mongolite CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful and user-friendly CLI tool for managing MongoDB databases, users, collections, and data import/export operations with beautiful colorful output and comprehensive features.

## ✨ Features

- 🎨 **Colorful CLI interface** for better user experience
- 🗄️ **Database management** (create, list, delete)
- 👥 **User management** with role-based access control
- 📦 **Collection operations** (list, delete)
- 💾 **Data import/export** with advanced options
- 🔐 **Flexible authentication** support
- 🌐 **Local and remote** MongoDB instances
- ⚙️ **Environment configuration** support

## 📦 Installation

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
```env
DB_HOST=localhost
DB_PORT=27017
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
AUTH_DB=admin
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

## 📚 Available Commands

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

### Help
```bash
mongocli help
mongocli -h
mongocli --help
```

## 🔧 Configuration

### Environment Variables
All environment variables are optional with sensible defaults:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | MongoDB server hostname |
| `DB_PORT` | `27017` | MongoDB server port |
| `ADMIN_USERNAME` | - | Admin username (if auth enabled) |
| `ADMIN_PASSWORD` | - | Admin password (if auth enabled) |
| `AUTH_DB` | `admin` | Authentication database |

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

## 🚀 Usage Examples

### Basic Setup
```bash
# Create a new application database with a user
mongocli setup myapp app_user secure_password123 readWrite

# List what we created
mongocli list-db
mongocli list-users myapp
```

### Data Migration
```bash
# Dump production database
mongocli dump db production_db ./backups/

# Import to development
mongocli import db development_db ./backups/production_db --drop
```

### User Management
```bash
# Create admin user
mongocli create-user myapp admin_user admin_pass123 dbAdmin

# Create read-only user for reporting
mongocli create-user myapp report_user report_pass123 read

# Update user roles
mongocli set-roles myapp report_user read,dbAdmin
```

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues

If you encounter any issues or have feature requests, please [create an issue](https://github.com/ismdevx/mongolite-cli/issues) on GitHub.

## 🚀 Publishing to NPM

When ready to publish this package to npm:

1. Update the repository URL in `package.json`
2. Ensure you have an npm account
3. Run the following commands:

```bash
npm login
npm publish
```

After publishing, users will be able to install globally with:
```bash
npm install -g mongolite-cli
```

## 📊 Changelog

### v1.0.0
- Initial release
- Full database management capabilities
- User management with role-based access
- Data import/export functionality
- Colorful CLI interface
- Environment configuration support

## 💡 Role Codes (Alternative Usage)

You can pass roles by name or by code:
- 1: read
- 2: readWrite  
- 3: dbAdmin
- 4: dbOwner
- 5: userAdmin
- 6: readAnyDatabase
- 7: readWriteAnyDatabase
- 8: dbAdminAnyDatabase
- 9: userAdminAnyDatabase
- 10: clusterMonitor
- 11: clusterManager
- 12: clusterAdmin
- 13: hostManager
- 14: backup
- 15: restore
- 99: root

Examples with codes:
```bash
mongocli create-user mydb appuser strong_password 2,3
mongocli set-roles mydb appuser 1
```

## 📝 Notes

- If `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set, management commands connect with auth using `AUTH_DB` (default `admin`). Otherwise they connect without auth.
- Databases are created lazily in MongoDB. When you omit the collection name, we create a small placeholder `test` collection so the DB appears immediately. You can drop it later without side effects:

```bash
mongocli delete-collection mydb test
```

## 🔄 Alternative Usage

If you prefer not to use the global command, you can still use the direct Node.js approach:
```bash
node mongodb.js <command> [arguments]
```
