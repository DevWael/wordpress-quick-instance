# WordPress Quick Setup Script

A powerful Node.js script for quickly spinning up WordPress websites for testing purposes. This script automates the entire process of setting up a WordPress site with custom content, plugins, themes, and configurations.

## Features

- 🚀 **Quick WordPress Setup**: Download and install WordPress with a single command
- 🗄️ **Database Management**: Create databases, import SQL files, and perform search-replace operations
- 🔌 **Plugin Management**: Install plugins from WordPress.org, local files, GitHub, or ZIP files
- 🎨 **Theme Management**: Install themes from multiple sources with automatic activation
- 📁 **Content Import**: Copy existing uploads and media files
- 🔧 **Valet Integration**: Automatic Laravel Valet setup for local development
- ⚙️ **Highly Configurable**: Extensive configuration options for every aspect of the setup
- 🔒 **Security Features**: Built-in security hardening options
- 🚀 **Performance Optimization**: Caching, compression, and optimization settings
- 📦 **Backup System**: Automatic backup creation and management
- 🛠️ **Development Tools**: Debug settings, error reporting, and development features

## Prerequisites

Before using this script, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **WP-CLI** (WordPress Command Line Interface)
- **MySQL** server
- **Laravel Valet** (for local development)
- **Git** (for GitHub plugin/theme installations)

### Installing Prerequisites

#### WP-CLI
```bash
curl -O https://raw.githubusercontent.com/wp-cli/wp-cli/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp
```

#### Laravel Valet
```bash
composer global require laravel/valet
valet install
```

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Make the script executable (optional):
```bash
chmod +x index.js
```

## Configuration

The script uses a comprehensive configuration system. On first run, it will create a default `config.json` file. You can customize this file to match your needs.

### Quick Start

1. Run the script for the first time to generate the default config:
```bash
npm start
```

2. Edit the `config.json` file to customize your setup:
```bash
npm run config
```

3. Run the setup command:
```bash
npm start setup
```

### Configuration Options

The configuration file includes the following sections:

#### Server Configuration
- **path**: Where to create websites (default: `~/Server`)
- **createSubdirectories**: Create year/month subdirectories
- **backupExisting**: Backup existing sites before overwriting
- **backupPath**: Where to store backups

#### Database Configuration
- **host**: MySQL host (default: `localhost`)
- **user**: MySQL username (default: `root`)
- **password**: MySQL password
- **port**: MySQL port (default: `3306`)
- **charset**: Database charset (default: `utf8mb4`)
- **collate**: Database collation (default: `utf8mb4_unicode_ci`)
- **prefix**: WordPress table prefix (default: `wp_`)
- **createUser**: Create dedicated database user
- **userPrefix**: Prefix for database user names
- **grantPrivileges**: Database privileges to grant

#### WordPress Configuration
- **version**: WordPress version to install (default: `latest`)
- **locale**: WordPress locale (default: `en_US`)
- **adminUser**: Admin username (default: `admin`)
- **adminEmail**: Admin email address
- **adminPassword**: Admin password
- **siteTitle**: Site title
- **siteDescription**: Site description
- **timezone**: Site timezone
- **dateFormat**: Date format
- **timeFormat**: Time format
- **usePermalinks**: Enable pretty permalinks
- **permalinkStructure**: Permalink structure
- **disableComments**: Disable comments by default
- **memoryLimit**: PHP memory limit
- **maxExecutionTime**: PHP max execution time

#### Plugins Configuration
- **sources**: Available plugin sources (`wordpress.org`, `local`, `github`, `zip`)
- **wordpressOrg**: List of WordPress.org plugins to install
- **local**: List of local plugin paths
- **github**: List of GitHub repositories
- **zip**: List of ZIP file paths
- **activateAll**: Activate all installed plugins
- **updateAfterInstall**: Update plugins after installation
- **removeDefault**: Remove default plugins

#### Themes Configuration
- **sources**: Available theme sources (`wordpress.org`, `local`, `github`, `zip`)
- **wordpressOrg**: List of WordPress.org themes to install
- **local**: List of local theme paths
- **github**: List of GitHub repositories
- **zip**: List of ZIP file paths
- **activate**: Theme to activate
- **updateAfterInstall**: Update themes after installation
- **removeDefault**: Remove default themes

#### Content Configuration
- **uploads**: Uploads folder configuration
- **sql**: SQL file import configuration
- **searchReplace**: Search and replace settings

#### Development Tools
- **enableDebug**: Enable WordPress debug mode
- **debugLog**: Enable debug logging
- **scriptDebug**: Enable script debugging
- **saveQueries**: Save database queries
- **disableFileEditing**: Disable file editing in admin

#### Valet Configuration
- **enabled**: Enable Valet setup
- **linkAfterSetup**: Link site after setup
- **secure**: Enable HTTPS
- **park**: Park directory instead of linking
- **proxy**: Use proxy instead of link
- **domain**: Custom domain extension

#### Security Configuration
- **changeTablePrefix**: Change default table prefix
- **removeVersionInfo**: Remove version information
- **hideLoginErrors**: Hide login error messages
- **disableXmlRpc**: Disable XML-RPC
- **disableFileEditing**: Disable file editing
- **removeReadmeFiles**: Remove readme files

#### Performance Configuration
- **enableCaching**: Enable caching
- **cacheType**: Cache type (`object`, `file`, `redis`, `memcached`)
- **enableCompression**: Enable compression
- **optimizeImages**: Optimize images
- **minifyCss**: Minify CSS
- **minifyJs**: Minify JavaScript

#### Custom Configuration
- **wpConfig**: Custom wp-config.php lines
- **htaccess**: Custom .htaccess rules
- **functions**: Custom functions.php code
- **hooks**: Custom command hooks

#### Advanced Options
- **skipWordPressDownload**: Skip WordPress download
- **skipDatabaseCreation**: Skip database creation
- **skipPluginInstallation**: Skip plugin installation
- **skipThemeInstallation**: Skip theme installation
- **skipUploadsCopy**: Skip uploads copy
- **skipValetSetup**: Skip Valet setup
- **skipSearchReplace**: Skip search-replace
- **forceOverwrite**: Force overwrite existing sites
- **verbose**: Enable verbose output
- **dryRun**: Show what would be done without doing it

## Usage

### Basic Usage

```bash
# Set up a new WordPress website
npm start setup

# Or use the direct command
node index.js setup
```

### Advanced Usage

```bash
# Open config file for editing
npm start config

# List all websites in ~/Server
npm start list

# Show help
npm start --help
```

### Command Line Options

```bash
# Set up with specific options
node index.js setup --config=/path/to/config.json

# Verbose output
node index.js setup --verbose

# Dry run (show what would be done)
node index.js setup --dry-run
```

## Examples

### Example 1: Basic Setup

1. Create a basic WordPress site:
```bash
npm start setup
```

2. Enter website name when prompted
3. The script will create a WordPress site with default settings

### Example 2: Custom Configuration

1. Edit the config file:
```bash
npm start config
```

2. Configure your preferences:
```json
{
  "database": {
    "user": "root",
    "password": "your_password"
  },
  "plugins": {
    "wordpressOrg": ["elementor", "yoast-seo", "woocommerce"]
  },
  "themes": {
    "activate": "astra"
  },
  "sql": {
    "source": "/path/to/your/database.sql",
    "oldUrl": "http://example.com"
  }
}
```

3. Run the setup:
```bash
npm start setup
```

### Example 3: Development Setup

For a development environment with debugging enabled:

```json
{
  "development": {
    "enableDebug": true,
    "debugLog": true,
    "scriptDebug": true,
    "saveQueries": true
  },
  "security": {
    "disableFileEditing": false,
    "disablePluginEditor": false,
    "disableThemeEditor": false
  },
  "advanced": {
    "verbose": true
  }
}
```

### Example 4: Production-like Setup

For a production-like environment:

```json
{
  "development": {
    "enableDebug": false,
    "debugLog": false,
    "scriptDebug": false
  },
  "security": {
    "disableFileEditing": true,
    "removeVersionInfo": true,
    "hideLoginErrors": true,
    "disableXmlRpc": true
  },
  "performance": {
    "enableCaching": true,
    "enableCompression": true
  }
}
```

## File Structure

```
wp-script/
├── index.js              # Main script file
├── package.json          # Node.js dependencies
├── config.json           # Configuration file (created on first run)
├── config.example.json   # Example configuration file
└── README.md            # This file
```

## Troubleshooting

### Common Issues

1. **WP-CLI not found**
   - Make sure WP-CLI is installed and in your PATH
   - Test with: `wp --info`

2. **MySQL connection failed**
   - Check your MySQL credentials in the config file
   - Ensure MySQL server is running
   - Test connection: `mysql -u root -p`

3. **Valet not working**
   - Make sure Laravel Valet is installed and running
   - Test with: `valet status`
   - Restart Valet: `valet restart`

4. **Permission errors**
   - Check file permissions on the server directory
   - Ensure the script has write permissions

5. **Plugin/Theme installation failed**
   - Check internet connection
   - Verify plugin/theme names are correct
   - Check file paths for local installations

### Debug Mode

Enable verbose output to see detailed information:

```bash
node index.js setup --verbose
```

Or set in config:
```json
{
  "advanced": {
    "verbose": true
  }
}
```

### Dry Run

Test what the script would do without making changes:

```bash
node index.js setup --dry-run
```

Or set in config:
```json
{
  "advanced": {
    "dryRun": true
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section
2. Enable verbose mode for detailed output
3. Check the configuration file
4. Create an issue with detailed information

## Changelog

### Version 1.0.0
- Initial release
- Basic WordPress setup functionality
- Plugin and theme management
- Database import and search-replace
- Valet integration
- Comprehensive configuration system
- Backup functionality
- Security and performance options
