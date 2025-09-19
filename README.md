# WordPress Quick Setup Script

A powerful Node.js script that automates WordPress website setup for testing and development. Create fully configured WordPress sites with plugins, themes, and custom content in minutes.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your first WordPress site:**
   ```bash
   npm run setup
   ```

3. **Enter a site name when prompted** - the script handles everything else!

## ✨ What It Does

- **Downloads & installs WordPress** automatically
- **Creates databases** and imports SQL files
- **Installs plugins & themes** from multiple sources (WordPress.org, GitHub, local files)
- **Sets up Laravel Valet** for local development
- **Configures security & performance** settings
- **Copies existing sites** and creates templates
- **Supports Docker MySQL** for easy database management

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | Create a new WordPress site |
| `npm run config` | Edit configuration file |
| `npm run list` | List all your websites |
| `npm run copy` | Copy an existing site |
| `npm run templates` | List available templates |

## ⚙️ Configuration

The script creates a `config.json` file on first run. Key settings include:

- **Database**: MySQL connection, Docker support
- **WordPress**: Version, admin user, site settings
- **Plugins/Themes**: Auto-install from WordPress.org, GitHub, or local files
- **Development**: Debug mode, error reporting
- **Security**: Hardening options, file permissions
- **Performance**: Caching, compression, optimization

## 📋 Prerequisites

Install these tools before using the script:

- **Node.js** (v14+)
- **WP-CLI**: `curl -O https://raw.githubusercontent.com/wp-cli/wp-cli/gh-pages/phar/wp-cli.phar && chmod +x wp-cli.phar && sudo mv wp-cli.phar /usr/local/bin/wp`
- **MySQL** server or Docker
- **Laravel Valet**: `composer global require laravel/valet && valet install`
- **Git** (for GitHub installations)

## 🎯 Common Use Cases

### Basic WordPress Site
```bash
npm run setup
# Enter site name → Done!
```

### E-commerce Site with WooCommerce
```json
{
  "plugins": {
    "wordpressOrg": ["woocommerce", "yoast-seo", "elementor"]
  },
  "themes": {
    "activate": "storefront"
  }
}
```

### Development Site with Debugging
```json
{
  "development": {
    "enableDebug": true,
    "debugLog": true
  },
  "security": {
    "disableFileEditing": false
  }
}
```

### Copy Existing Site
```bash
npm run copy /path/to/existing/site new-site-name
```

## 🔧 Advanced Commands

```bash
# Analyze existing WordPress site
node index.js analyze /path/to/site

# Create template from site
node index.js create-template /path/to/site

# Setup Docker MySQL
node index.js docker-mysql

# Verbose output for debugging
node index.js setup --verbose

# Dry run (test without changes)
node index.js setup --dry-run
```

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| WP-CLI not found | Install WP-CLI and ensure it's in PATH |
| MySQL connection failed | Check credentials in config.json |
| Valet not working | Run `valet restart` |
| Permission errors | Check file permissions on ~/Server |
| Docker issues | Ensure Docker is running, check `docker ps` |

## 📁 File Structure

```
wp-script/
├── index.js              # Main script
├── config.json           # Your configuration (auto-created)
├── config.example.json   # Example configuration
└── package.json          # Dependencies
```

## 📖 Full Documentation

For complete configuration options and advanced features, see `config.example.json` which contains all available settings with detailed comments.

---

**Need help?** Enable verbose mode with `--verbose` flag or check the troubleshooting section above.
