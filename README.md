# WordPress Quick Setup Script

A powerful Node.js script for quickly spinning up WordPress websites for testing purposes. This script automates the entire process of setting up a WordPress site with custom content, plugins, themes, and configurations.

This script is fully vipecoded by CursorAI.

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
- 🐳 **Docker Support**: Full Docker MySQL container support with automatic setup
- 📋 **Site Templates**: Pre-configured WordPress site templates for different use cases
- 🔍 **Site Analysis**: Analyze existing WordPress sites to detect configuration and URLs
- 📋 **Site Copying**: Copy existing WordPress sites to create new installations
- 📊 **Template Creation**: Create templates from existing WordPress sites
- 🔧 **Interactive Template Builder**: Build custom templates interactively
- 📧 **Email Configuration**: SMTP settings and email functionality
- 🔄 **Advanced Search & Replace**: Multiple search-replace operations with regex support
- 🎯 **Multisite Support**: WordPress multisite installation and configuration
- 🔐 **Admin User Management**: Automatic admin user creation and password management
- 📈 **Database Optimization**: Automatic database optimization and repair after import

## Prerequisites

Before using this script, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **WP-CLI** (WordPress Command Line Interface)
- **MySQL** server (or Docker for containerized MySQL)
- **Laravel Valet** (for local development)
- **Git** (for GitHub plugin/theme installations)
- **Docker** (optional, for containerized MySQL setup)

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

#### Docker (Optional)
```bash
# macOS (using Homebrew)
brew install docker

# Or download Docker Desktop from https://www.docker.com/products/docker-desktop
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
npm run setup
```

### Configuration Options

The configuration file includes the following sections:

#### Server Configuration
- **path**: Where to create websites (default: `~/Server`)
- **createSubdirectories**: Create year/month subdirectories
- **backupExisting**: Backup existing sites before overwriting
- **backupPath**: Where to store backups

#### Database Configuration
- **host**: MySQL host (default: `127.0.0.1`)
- **user**: MySQL username (default: `root`)
- **password**: MySQL password
- **port**: MySQL port (default: `3307`)
- **charset**: Database charset (default: `utf8mb4`)
- **collate**: Database collation (default: `utf8mb4_unicode_ci`)
- **prefix**: WordPress table prefix (default: `wp_`)
- **createUser**: Create dedicated database user
- **userPrefix**: Prefix for database user names
- **grantPrivileges**: Database privileges to grant
- **docker**: Docker MySQL configuration
  - **enabled**: Enable Docker MySQL (default: `true`)
  - **containerName**: Docker container name (default: `mysql_docker`)
  - **image**: MySQL Docker image (default: `mysql:8.0`)
  - **port**: External port mapping (default: `3307`)
  - **rootPassword**: Root password for Docker MySQL
  - **dataVolume**: Docker volume name for data persistence
  - **network**: Docker network (default: `bridge`)

#### WordPress Configuration
- **version**: WordPress version to install (default: `latest`)
- **locale**: WordPress locale (default: `en_US`)
- **multisite**: Enable WordPress multisite (default: `false`)
- **multisiteType**: Multisite type - `subdirectories` or `subdomains` (default: `subdirectories`)
- **adminUser**: Admin username (default: `admin`)
- **adminEmail**: Admin email address
- **adminPassword**: Admin password
- **siteTitle**: Site title
- **siteDescription**: Site description
- **privacy**: Site privacy setting (default: `public`)
- **timezone**: Site timezone (default: `UTC`)
- **dateFormat**: Date format (default: `F j, Y`)
- **timeFormat**: Time format (default: `g:i a`)
- **startOfWeek**: Start of week (default: `1`)
- **usePermalinks**: Enable pretty permalinks (default: `true`)
- **permalinkStructure**: Permalink structure (default: `/%postname%/`)
- **disableComments**: Disable comments by default (default: `true`)
- **disableTrackbacks**: Disable trackbacks (default: `true`)
- **disablePingbacks**: Disable pingbacks (default: `true`)
- **autoUpdateCore**: Enable automatic core updates (default: `false`)
- **autoUpdatePlugins**: Enable automatic plugin updates (default: `false`)
- **autoUpdateThemes**: Enable automatic theme updates (default: `false`)
- **memoryLimit**: PHP memory limit (default: `256M`)
- **maxExecutionTime**: PHP max execution time (default: `300`)
- **maxInputVars**: PHP max input variables (default: `3000`)
- **uploadMaxFilesize**: Maximum upload file size (default: `64M`)
- **postMaxSize**: Maximum POST size (default: `64M`)

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
  - **afterSetup**: Commands to run after setup
  - **beforeSetup**: Commands to run before setup
  - **afterDatabaseImport**: Commands to run after database import
  - **afterSearchReplace**: Commands to run after search-replace

#### Templates Configuration
- **enabled**: Enable template system (default: `true`)
- **default**: Default template to use
- **list**: Available templates with custom configurations
  - Each template can override any configuration option
  - Templates can include custom WordPress settings, plugins, themes, uploads, and SQL configurations

#### Email Configuration
- **enabled**: Enable email functionality (default: `false`)
- **smtp**: SMTP server configuration
  - **host**: SMTP host (default: `localhost`)
  - **port**: SMTP port (default: `587`)
  - **secure**: Use secure connection (default: `false`)
  - **auth**: Authentication settings
    - **user**: SMTP username
    - **pass**: SMTP password
- **from**: From email address
- **to**: To email address

#### Advanced Options
- **skipWordPressDownload**: Skip WordPress download (default: `false`)
- **skipDatabaseCreation**: Skip database creation (default: `false`)
- **skipPluginInstallation**: Skip plugin installation (default: `false`)
- **skipThemeInstallation**: Skip theme installation (default: `false`)
- **skipUploadsCopy**: Skip uploads copy (default: `false`)
- **skipValetSetup**: Skip Valet setup (default: `false`)
- **skipSearchReplace**: Skip search-replace (default: `false`)
- **forceOverwrite**: Force overwrite existing sites (default: `false`)
- **verbose**: Enable verbose output (default: `false`)
- **dryRun**: Show what would be done without doing it (default: `false`)
- **parallelDownloads**: Number of parallel downloads (default: `3`)
- **timeout**: Request timeout in milliseconds (default: `30000`)
- **retries**: Number of retry attempts (default: `3`)

## Usage

### NPM Run Commands

This script provides convenient npm run commands for all operations:

| Command | Description |
|---------|-------------|
| `npm run setup` | Set up a new WordPress website |
| `npm run config` | Open config file for editing |
| `npm run list` | List all websites in ~/Server |
| `npm run templates` | List all available templates |
| `npm run copy` | Copy an existing WordPress site |

### Basic Usage

```bash
# Set up a new WordPress website
npm run setup

# Or use the direct command
node index.js setup
```

### Advanced Usage

```bash
# Open config file for editing
npm run config

# List all websites in ~/Server
npm run list

# List all available templates
npm run templates

# Copy an existing WordPress site
npm run copy <source-path> <new-site-name>

# Show help
npm start --help
```

### Additional Commands (Direct CLI)

For advanced operations, you can use the CLI directly:

```bash
# Create a template from existing site
node index.js create-template <site-path>

# Create a new template interactively
node index.js create-template-interactive

# Analyze a WordPress site
node index.js analyze <site-path>

# Check URLs in a WordPress site
node index.js check-urls <website-name>

# Update admin email
node index.js update-admin-email <website-name> <new-email>

# Setup Docker MySQL
node index.js docker-mysql
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
npm run setup
```

2. Enter website name when prompted
3. The script will create a WordPress site with default settings

### Example 2: Custom Configuration

1. Edit the config file:
```bash
npm run config
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
npm run setup
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

### Example 5: Docker MySQL Setup

For using Docker MySQL:

```json
{
  "database": {
    "docker": {
      "enabled": true,
      "containerName": "mysql_docker",
      "image": "mysql:8.0",
      "port": 3307,
      "rootPassword": "your_password",
      "dataVolume": "mysql_data"
    }
  }
}
```

### Example 6: Template Configuration

Create a custom template:

```json
{
  "templates": {
    "enabled": true,
    "default": "ecommerce",
    "list": {
      "ecommerce": {
        "name": "E-commerce Site",
        "description": "WooCommerce store with custom theme",
        "wordpress": {
          "siteTitle": "My Store",
          "siteDescription": "Professional e-commerce store"
        },
        "plugins": {
          "wordpressOrg": ["woocommerce", "yoast-seo", "elementor"],
          "activateAll": true
        },
        "themes": {
          "activate": "storefront"
        }
      }
    }
  }
}
```

### Example 7: Site Analysis and Copying

Analyze an existing site and copy it:

```bash
# Analyze a WordPress site
node index.js analyze /path/to/existing/site

# Copy the site to create a new one
npm run copy /path/to/existing/site new-site-name
```

### Example 8: Advanced Search & Replace

Configure multiple search-replace operations:

```json
{
  "sql": {
    "searchReplace": {
      "enabled": true,
      "caseSensitive": false,
      "regex": false,
      "dryRun": false,
      "additionalReplacements": [
        {
          "search": "https://oldsite.com",
          "replace": "https://newsite.com"
        },
        {
          "search": "oldsite.com",
          "replace": "newsite.com"
        }
      ]
    }
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

6. **Docker MySQL issues**
   - Ensure Docker is installed and running
   - Check if the MySQL container is running: `docker ps`
   - Start the container: `docker start mysql_docker`
   - Check container logs: `docker logs mysql_docker`

7. **Template not found**
   - Verify template name in configuration
   - Check if templates are enabled in config
   - Use `npm run templates` to list available templates

8. **Site analysis failed**
   - Ensure the site path exists and contains WordPress files
   - Check database connection settings
   - Verify wp-config.php is readable

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
- Docker MySQL support with automatic container setup
- WordPress site templates system
- Site analysis and copying functionality
- Interactive template creation
- Advanced search-replace with regex support
- WordPress multisite support
- Admin user management
- Database optimization and repair
- Email configuration with SMTP support
- Custom hooks and command execution
- Parallel downloads and retry mechanisms
- Comprehensive error handling and logging
