#!/usr/bin/env node

const { Command } = require('commander');
const { prompt } = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');
const mysql = require('mysql2/promise');
const axios = require('axios');
const glob = require('glob');
const util = require('util');

const program = new Command();

// Configuration
const SERVER_PATH = path.join(require('os').homedir(), 'Server');
const CONFIG_FILE = path.join(__dirname, 'config.json');

class WordPressSetup {
  constructor() {
    this.config = null;
    this.websiteName = null;
    this.websitePath = null;
    this.dbName = null;
  }

  async loadConfig() {
    try {
      if (await fs.pathExists(CONFIG_FILE)) {
        this.config = await fs.readJson(CONFIG_FILE);
      } else {
        console.log(chalk.yellow('Config file not found. Creating default config...'));
        await this.createDefaultConfig();
        this.config = await fs.readJson(CONFIG_FILE);
      }
    } catch (error) {
      console.error(chalk.red('Error loading config:'), error.message);
      process.exit(1);
    }
  }

  async createDefaultConfig() {
    const defaultConfig = {
      // Server configuration
      server: {
        path: '~/Server', // Can be absolute path or relative to home
        createSubdirectories: true, // Create year/month subdirectories
        backupExisting: true, // Backup existing sites before overwriting
        backupPath: '~/Server/backups'
      },
      
      // Database configuration
      database: {
        host: 'localhost',
        user: 'root',
        password: '',
        port: 3306,
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        prefix: 'wp_', // WordPress table prefix
        createUser: false, // Create dedicated database user
        userPrefix: 'wp_', // Prefix for database user names
        grantPrivileges: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'INDEX', 'ALTER'],
        // Docker MySQL configuration
        docker: {
          enabled: false, // Enable Docker MySQL support
          containerName: 'mysql', // Docker container name
          image: 'mysql:8.0', // MySQL Docker image
          port: 3306, // Host port mapping
          rootPassword: '', // Root password for MySQL
          dataVolume: 'mysql_data', // Docker volume for data persistence
          network: 'bridge' // Docker network
        }
      },
      
      // WordPress configuration
      wordpress: {
        version: 'latest', // or specific version like '6.4.2'
        locale: 'en_US',
        multisite: false, // Enable multisite
        multisiteType: 'subdirectories', // 'subdirectories' or 'subdomains'
        adminUser: 'admin',
        adminEmail: 'admin@example.com',
        adminPassword: 'admin123', // Will be prompted if null
        siteTitle: 'Test Site',
        siteDescription: 'Just another WordPress site',
        privacy: 'public', // 'public' or 'private'
        timezone: 'UTC',
        dateFormat: 'F j, Y',
        timeFormat: 'g:i a',
        startOfWeek: 1, // 0 = Sunday, 1 = Monday
        usePermalinks: true,
        permalinkStructure: '/%postname%/',
        disableComments: true,
        disableTrackbacks: true,
        disablePingbacks: true,
        autoUpdateCore: false,
        autoUpdatePlugins: false,
        autoUpdateThemes: false,
        memoryLimit: '256M',
        maxExecutionTime: 300,
        maxInputVars: 3000,
        uploadMaxFilesize: '64M',
        postMaxSize: '64M'
      },
      
      // Plugins configuration
      plugins: {
        sources: ['wordpress.org', 'local', 'github', 'zip'],
        wordpressOrg: [
          'elementor',
          'yoast-seo',
          'woocommerce',
          'contact-form-7',
          'akismet',
          'wordfence'
        ],
        local: [], // Array of local plugin paths
        github: [], // Array of {repo: 'user/repo', branch: 'main', activate: true}
        zip: [], // Array of zip file paths
        activateAll: true, // Activate all installed plugins
        updateAfterInstall: true, // Update plugins after installation
        removeDefault: ['hello', 'akismet'] // Remove default plugins
      },
      
      // Themes configuration
      themes: {
        sources: ['wordpress.org', 'local', 'github', 'zip'],
        wordpressOrg: [
          'twentytwentyfour',
          'astra',
          'oceanwp',
          'generatepress'
        ],
        local: [], // Array of local theme paths
        github: [], // Array of {repo: 'user/repo', branch: 'main'}
        zip: [], // Array of zip file paths
        activate: 'twentytwentyfour', // Theme to activate (slug or name)
        updateAfterInstall: true, // Update themes after installation
        removeDefault: ['twentytwentyone', 'twentytwentytwo', 'twentytwentythree'] // Remove default themes
      },
      
      // Content configuration
      uploads: {
        source: null, // Path to uploads folder
        preserveStructure: true, // Preserve year/month folder structure
        setPermissions: true, // Set proper file permissions
        permissions: {
          files: '644',
          directories: '755'
        }
      },
      
      sql: {
        source: null, // Path to SQL file
        oldUrl: 'http://example.com', // Old URL to replace
        oldDomain: 'example.com', // Old domain to replace
        searchReplace: {
          enabled: true,
          caseSensitive: false,
          regex: false,
          dryRun: false, // Show what would be replaced without doing it
          additionalReplacements: [] // Array of {search: 'old', replace: 'new'}
        },
        optimizeAfterImport: true, // Optimize database after import
        repairAfterImport: true // Repair database after import
      },
      
      // Development tools
      development: {
        enableDebug: true,
        debugLog: true,
        debugDisplay: false,
        scriptDebug: true,
        saveQueries: true,
        wpDebugLog: true,
        wpDebugDisplay: false,
        enableErrorReporting: true,
        disableFileEditing: true,
        disablePluginEditor: true,
        disableThemeEditor: true,
        forceSSL: false,
        sslAdmin: false
      },
      
      // Valet configuration
      valet: {
        enabled: true,
        linkAfterSetup: true,
        secure: false, // Enable HTTPS
        park: false, // Park the directory instead of linking
        proxy: false, // Use proxy instead of link
        domain: '.test' // Custom domain extension
      },
      
      // Backup configuration
      backup: {
        enabled: true,
        beforeSetup: true,
        afterSetup: false,
        includeDatabase: true,
        includeFiles: true,
        compression: 'zip', // 'zip', 'tar', 'tar.gz', 'none'
        retention: 7 // Keep backups for X days
      },
      
      // Email configuration
      email: {
        enabled: false,
        smtp: {
          host: 'localhost',
          port: 587,
          secure: false,
          auth: {
            user: '',
            pass: ''
          }
        },
        from: 'noreply@example.com',
        to: 'admin@example.com'
      },
      
      // Security configuration
      security: {
        changeTablePrefix: true,
        removeVersionInfo: true,
        hideLoginErrors: true,
        limitLoginAttempts: true,
        disableXmlRpc: true,
        disableFileEditing: true,
        removeReadmeFiles: true,
        removeVersionFromHead: true,
        removeWlwmanifest: true,
        removeRsdLink: true,
        removeShortlink: true,
        removeRestApiLinks: true,
        disableUserEnumeration: true,
        disableAuthorPages: true
      },
      
      // Performance configuration
      performance: {
        enableCaching: true,
        cacheType: 'object', // 'object', 'file', 'redis', 'memcached'
        enableCompression: true,
        optimizeImages: false,
        lazyLoad: false,
        minifyCss: false,
        minifyJs: false,
        combineCss: false,
        combineJs: false,
        cdn: {
          enabled: false,
          url: ''
        }
      },
      
      // Custom configuration
      custom: {
        wpConfig: [], // Array of custom wp-config.php lines
        htaccess: [], // Array of custom .htaccess rules
        functions: [], // Array of custom functions.php code
        hooks: {
          afterSetup: [], // Commands to run after setup
          beforeSetup: [], // Commands to run before setup
          afterDatabaseImport: [], // Commands to run after database import
          afterSearchReplace: [] // Commands to run after search-replace
        }
      },
      
      // Advanced options
      advanced: {
        skipWordPressDownload: false,
        skipDatabaseCreation: false,
        skipPluginInstallation: false,
        skipThemeInstallation: false,
        skipUploadsCopy: false,
        skipValetSetup: false,
        skipSearchReplace: false,
        forceOverwrite: false,
        verbose: false,
        dryRun: false, // Show what would be done without doing it
        parallelDownloads: 3, // Number of parallel downloads
        timeout: 30000, // Request timeout in milliseconds
        retries: 3 // Number of retries for failed operations
      }
    };

    await fs.writeJson(CONFIG_FILE, defaultConfig, { spaces: 2 });
    console.log(chalk.green(`Default config created at ${CONFIG_FILE}`));
    console.log(chalk.yellow('Please edit the config file to customize your setup preferences.'));
  }

  async promptForWebsiteName() {
    const questions = [
      {
        type: 'input',
        name: 'websiteName',
        message: 'Enter the website name:',
        validate: (input) => {
          if (!input.trim()) {
            return 'Website name is required';
          }
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
            return 'Website name can only contain letters, numbers, hyphens, and underscores';
          }
          return true;
        }
      }
    ];

    // Add optional questions based on config
    if (!this.config.wordpress.adminPassword) {
      questions.push({
        type: 'password',
        name: 'adminPassword',
        message: 'Enter admin password:',
        validate: (input) => {
          if (!input.trim()) {
            return 'Admin password is required';
          }
          if (input.length < 8) {
            return 'Password must be at least 8 characters long';
          }
          return true;
        }
      });
    }

    if (!this.config.wordpress.adminEmail || this.config.wordpress.adminEmail === 'admin@example.com') {
      questions.push({
        type: 'input',
        name: 'adminEmail',
        message: 'Enter admin email:',
        default: 'admin@example.com',
        validate: (input) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input)) {
            return 'Please enter a valid email address';
          }
          return true;
        }
      });
    }

    const answers = await prompt(questions);

    this.websiteName = answers.websiteName;
    
    // Resolve server path (handle ~ and relative paths)
    const serverPath = this.config.server.path.startsWith('~') 
      ? path.join(require('os').homedir(), this.config.server.path.slice(1))
      : path.resolve(this.config.server.path);
    
    this.websitePath = path.join(serverPath, this.websiteName);
    this.dbName = `${this.config.database.userPrefix}${this.websiteName}`;
    
    // Store additional answers
    this.adminPassword = answers.adminPassword || this.config.wordpress.adminPassword;
    this.adminEmail = answers.adminEmail || this.config.wordpress.adminEmail;
  }

  async createBackup() {
    if (!this.config.backup.enabled) return;

    try {
      const backupPath = this.config.backup.backupPath && this.config.backup.backupPath.startsWith('~') 
        ? path.join(require('os').homedir(), this.config.backup.backupPath.slice(1))
        : path.resolve(this.config.backup.backupPath || '~/Server/backups');
      
      await fs.ensureDir(backupPath);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `${this.websiteName}-${timestamp}`;
      const backupDir = path.join(backupPath, backupName);
      
      await fs.ensureDir(backupDir);
      
      if (this.config.backup.includeFiles) {
        await fs.copy(this.websitePath, path.join(backupDir, 'files'));
      }
      
      if (this.config.backup.includeDatabase) {
        const dbBackupPath = path.join(backupDir, 'database.sql');
        const command = this.getMysqlCommand(`mysqldump -h${this.config.database.host} -u${this.config.database.user} -p${this.config.database.password} -P${this.config.database.port} ${this.dbName} > "${dbBackupPath}"`);
        execSync(command, { stdio: 'pipe' });
      }
      
      // Clean old backups
      await this.cleanOldBackups(backupPath);
      
    } catch (error) {
      console.warn(chalk.yellow('Warning: Failed to create backup:'), error.message);
    }
  }

  async cleanOldBackups(backupPath) {
    try {
      const retention = this.config.backup.retention;
      const files = await fs.readdir(backupPath);
      const now = Date.now();
      const maxAge = retention * 24 * 60 * 60 * 1000; // Convert days to milliseconds
      
      for (const file of files) {
        const filePath = path.join(backupPath, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.remove(filePath);
        }
      }
    } catch (error) {
      console.warn(chalk.yellow('Warning: Failed to clean old backups:'), error.message);
    }
  }

  async createWebsiteDirectory() {
    const spinner = ora('Creating website directory...').start();
    
    try {
      if (await fs.pathExists(this.websitePath)) {
        if (this.config.advanced.forceOverwrite) {
          spinner.text = 'Backing up existing directory...';
          if (this.config.backup.enabled && this.config.backup.beforeSetup) {
            await this.createBackup();
          }
          await fs.remove(this.websitePath);
        } else {
          spinner.fail('Website directory already exists');
          const { overwrite } = await prompt([
            {
              type: 'confirm',
              name: 'overwrite',
              message: 'Do you want to overwrite the existing directory?',
              default: false
            }
          ]);
          
          if (overwrite) {
            if (this.config.backup.enabled && this.config.backup.beforeSetup) {
              spinner.text = 'Backing up existing directory...';
              await this.createBackup();
            }
            await fs.remove(this.websitePath);
          } else {
            process.exit(0);
          }
        }
      }

      await fs.ensureDir(this.websitePath);
      
      // Create subdirectories if configured
      if (this.config.server.createSubdirectories) {
        const year = String(new Date().getFullYear());
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        await fs.ensureDir(path.join(this.websitePath, 'wp-content', 'uploads', year, month));
      }
      
      spinner.succeed('Website directory created');
    } catch (error) {
      spinner.fail('Failed to create website directory');
      throw error;
    }
  }

  async downloadWordPress() {
    if (this.config.advanced.skipWordPressDownload) {
      console.log(chalk.yellow('Skipping WordPress download (configured to skip)'));
      return;
    }

    const spinner = ora('Downloading WordPress...').start();
    
    try {
      const version = this.config.wordpress.version;
      const locale = this.config.wordpress.locale;
      
      // Use WP-CLI to download WordPress
      const command = `wp core download --path="${this.websitePath}" --version="${version}" --locale="${locale}" --force`;
      execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
      
      spinner.succeed('WordPress downloaded successfully');
    } catch (error) {
      spinner.fail('Failed to download WordPress');
      console.error(chalk.red('Make sure WP-CLI is installed and accessible'));
      throw error;
    }
  }

  async createDatabase() {
    if (this.config.advanced.skipDatabaseCreation) {
      console.log(chalk.yellow('Skipping database creation (configured to skip)'));
      return;
    }

    const spinner = ora('Creating database...').start();
    
    try {
      // Ensure Docker MySQL is ready if enabled
      if (this.config.database.docker.enabled) {
        await this.ensureDockerMysql();
      }

      const connection = await mysql.createConnection({
        host: this.config.database.host,
        user: this.config.database.user,
        password: this.config.database.password,
        port: this.config.database.port
      });

      // Drop existing database if it exists
      await connection.execute(`DROP DATABASE IF EXISTS \`${this.dbName}\``);
      
      // Create new database with charset and collate
      const createDbQuery = `CREATE DATABASE \`${this.dbName}\` CHARACTER SET ${this.config.database.charset} COLLATE ${this.config.database.collate}`;
      if (this.config.advanced.verbose) {
        console.log(chalk.gray(`Creating database: ${createDbQuery}`));
      }
      await connection.execute(createDbQuery);
      
      // Verify database was created
      const [rows] = await connection.execute(`SHOW DATABASES LIKE '${this.dbName}'`);
      if (rows.length === 0) {
        throw new Error(`Failed to create database: ${this.dbName}`);
      }
      
      if (this.config.advanced.verbose) {
        console.log(chalk.gray(`Database created successfully: ${this.dbName}`));
      }

      // Create dedicated user if configured
      if (this.config.database.createUser) {
        const dbUser = `${this.config.database.userPrefix}${this.websiteName}`;
        const dbPassword = this.generateRandomPassword();
        
        // Create user
        await connection.execute(`CREATE USER IF NOT EXISTS '${dbUser}'@'${this.config.database.host}' IDENTIFIED BY '${dbPassword}'`);
        
        // Grant privileges
        const privileges = this.config.database.grantPrivileges.join(', ');
        await connection.execute(`GRANT ${privileges} ON \`${this.dbName}\`.* TO '${dbUser}'@'${this.config.database.host}'`);
        await connection.execute('FLUSH PRIVILEGES');
        
        // Store the user credentials for wp-config
        this.dbUser = dbUser;
        this.dbPassword = dbPassword;
      }
      
      await connection.end();
      
      spinner.succeed('Database created successfully');
    } catch (error) {
      spinner.fail('Failed to create database');
      throw error;
    }
  }

  generateRandomPassword(length = 16) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  getMysqlCommand(command) {
    if (this.config.database.docker.enabled) {
      // When using Docker, we need to connect to localhost:3306 inside the container
      let dockerCommand = command
        .replace(`-h${this.config.database.host}`, '-hlocalhost')
        .replace(`-P${this.config.database.port}`, '-P3306');
      
      // Remove empty password parameter
      if (this.config.database.password === '') {
        dockerCommand = dockerCommand.replace('-p ', '');
      }
      
      return `docker exec ${this.config.database.docker.containerName} ${dockerCommand}`;
    }
    return command;
  }

  async ensureDockerMysql() {
    if (!this.config.database.docker.enabled) return;

    const spinner = ora('Checking Docker MySQL container...').start();
    
    try {
      // Check if container exists
      const checkCommand = `docker ps -a --filter name=${this.config.database.docker.containerName} --format "{{.Names}}"`;
      let containerExists = '';
      try {
        containerExists = execSync(checkCommand, { stdio: 'pipe' }).toString().trim();
      } catch (error) {
        // Container doesn't exist
        containerExists = '';
      }
      
      if (!containerExists) {
        spinner.text = 'Creating Docker MySQL container...';
        await this.createDockerMysql();
      } else {
        // Check if container is running
        const runningCommand = `docker ps --filter name=${this.config.database.docker.containerName} --format "{{.Names}}"`;
        let isRunning = '';
        try {
          isRunning = execSync(runningCommand, { stdio: 'pipe' }).toString().trim();
        } catch (error) {
          // Container is not running
          isRunning = '';
        }
        
        if (!isRunning) {
          spinner.text = 'Starting Docker MySQL container...';
          execSync(`docker start ${this.config.database.docker.containerName}`, { stdio: 'pipe' });
          
          // Wait for MySQL to be ready
          spinner.text = 'Waiting for MySQL to be ready...';
          await this.waitForMysql();
        }
      }
      
      spinner.succeed('Docker MySQL container is ready');
    } catch (error) {
      spinner.fail('Failed to setup Docker MySQL');
      throw error;
    }
  }

  async createDockerMysql() {
    const dockerConfig = this.config.database.docker;
    const rootPassword = dockerConfig.rootPassword || this.config.database.password;
    
    // Create Docker volume if it doesn't exist
    try {
      execSync(`docker volume create ${dockerConfig.dataVolume}`, { stdio: 'pipe' });
    } catch (error) {
      // Volume might already exist, continue
    }
    
    const command = `docker run -d \
      --name ${dockerConfig.containerName} \
      -e MYSQL_ROOT_PASSWORD=${rootPassword} \
      -p ${dockerConfig.port}:3306 \
      -v ${dockerConfig.dataVolume}:/var/lib/mysql \
      --network ${dockerConfig.network} \
      ${dockerConfig.image}`;
    
    try {
      execSync(command, { stdio: 'pipe' });
    } catch (error) {
      // Container might already exist, try to start it instead
      try {
        execSync(`docker start ${dockerConfig.containerName}`, { stdio: 'pipe' });
      } catch (startError) {
        throw new Error(`Failed to create or start MySQL container: ${error.message}`);
      }
    }
    
    // Wait for MySQL to be ready
    await this.waitForMysql();
  }

  async waitForMysql(maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const testCommand = this.getMysqlCommand(`mysql -h${this.config.database.host} -u${this.config.database.user} -p${this.config.database.password} -P${this.config.database.port} -e "SELECT 1"`);
        if (this.config.advanced.verbose) {
          console.log(chalk.gray(`Testing MySQL connection: ${testCommand}`));
        }
        execSync(testCommand, { stdio: 'pipe' });
        return; // MySQL is ready
      } catch (error) {
        if (this.config.advanced.verbose) {
          console.log(chalk.yellow(`MySQL connection attempt ${i + 1} failed: ${error.message}`));
        }
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      }
    }
    throw new Error('MySQL did not become ready within the timeout period');
  }

  async updateWpConfig() {
    const spinner = ora('Updating wp-config.php...').start();
    
    try {
      const wpConfigPath = path.join(this.websitePath, 'wp-config.php');
      const wpConfigSamplePath = path.join(this.websitePath, 'wp-config-sample.php');
      
      if (!await fs.pathExists(wpConfigPath)) {
        await fs.copy(wpConfigSamplePath, wpConfigPath);
      }

      let wpConfig = await fs.readFile(wpConfigPath, 'utf8');
      
      // Generate salts
      const salts = await this.generateSalts();
      
      // Use dedicated user credentials if created, otherwise use root
      const dbUser = this.dbUser || this.config.database.user;
      const dbPassword = this.dbPassword || this.config.database.password;
      
      // Replace database configuration
      wpConfig = wpConfig.replace(/define\s*\(\s*['"]DB_NAME['"]\s*,\s*['"][^'"]*['"]\s*\)/, `define( 'DB_NAME', '${this.dbName}' )`);
      wpConfig = wpConfig.replace(/define\s*\(\s*['"]DB_USER['"]\s*,\s*['"][^'"]*['"]\s*\)/, `define( 'DB_USER', '${dbUser}' )`);
      wpConfig = wpConfig.replace(/define\s*\(\s*['"]DB_PASSWORD['"]\s*,\s*['"][^'"]*['"]\s*\)/, `define( 'DB_PASSWORD', '${dbPassword}' )`);
      wpConfig = wpConfig.replace(/define\s*\(\s*['"]DB_HOST['"]\s*,\s*['"][^'"]*['"]\s*\)/, `define( 'DB_HOST', '${this.config.database.host}:${this.config.database.port}' )`);
      wpConfig = wpConfig.replace(/define\s*\(\s*['"]DB_CHARSET['"]\s*,\s*['"][^'"]*['"]\s*\)/, `define( 'DB_CHARSET', '${this.config.database.charset}' )`);
      wpConfig = wpConfig.replace(/define\s*\(\s*['"]DB_COLLATE['"]\s*,\s*['"][^'"]*['"]\s*\)/, `define( 'DB_COLLATE', '${this.config.database.collate}' )`);
      
      // Add table prefix
      wpConfig = wpConfig.replace(/define\s*\(\s*['"]\$table_prefix['"]\s*,\s*['"][^'"]*['"]\s*\)/, `define( '$table_prefix', '${this.config.database.prefix}' )`);
      
      // Add salts
      if (!wpConfig.includes('AUTH_KEY')) {
        wpConfig = wpConfig.replace(
          /\/\*\s*That's all, stop editing!.*$/s,
          `${salts}\n\n/* That's all, stop editing! Happy publishing. */`
        );
      }
      
      // Add development settings
      if (this.config.development.enableDebug) {
        const debugSettings = [];
        
        // Check and add WP_DEBUG if not already defined
        if (!wpConfig.includes("define( 'WP_DEBUG'") && !wpConfig.includes('define( "WP_DEBUG"')) {
          debugSettings.push(`define( 'WP_DEBUG', ${this.config.development.debugLog} );`);
        }
        
        // Check and add WP_DEBUG_LOG if not already defined
        if (!wpConfig.includes("define( 'WP_DEBUG_LOG'") && !wpConfig.includes('define( "WP_DEBUG_LOG"')) {
          debugSettings.push(`define( 'WP_DEBUG_LOG', ${this.config.development.wpDebugLog} );`);
        }
        
        // Check and add WP_DEBUG_DISPLAY if not already defined
        if (!wpConfig.includes("define( 'WP_DEBUG_DISPLAY'") && !wpConfig.includes('define( "WP_DEBUG_DISPLAY"')) {
          debugSettings.push(`define( 'WP_DEBUG_DISPLAY', ${this.config.development.wpDebugDisplay} );`);
        }
        
        // Check and add SCRIPT_DEBUG if not already defined
        if (!wpConfig.includes("define( 'SCRIPT_DEBUG'") && !wpConfig.includes('define( "SCRIPT_DEBUG"')) {
          debugSettings.push(`define( 'SCRIPT_DEBUG', ${this.config.development.scriptDebug} );`);
        }
        
        // Check and add SAVEQUERIES if not already defined
        if (!wpConfig.includes("define( 'SAVEQUERIES'") && !wpConfig.includes('define( "SAVEQUERIES"')) {
          debugSettings.push(`define( 'SAVEQUERIES', ${this.config.development.saveQueries} );`);
        }
        
        // Only add debug settings if there are any to add
        if (debugSettings.length > 0) {
          const debugSettingsBlock = `
// Development settings
${debugSettings.join('\n')}`;
          
          wpConfig = wpConfig.replace(
            /\/\*\s*That's all, stop editing!.*$/s,
            `${debugSettingsBlock}\n\n/* That's all, stop editing! Happy publishing. */`
          );
        }
      }
      
      // Add security settings
      if (this.config.security.disableFileEditing) {
        // Check if DISALLOW_FILE_EDIT is not already defined
        if (!wpConfig.includes("define( 'DISALLOW_FILE_EDIT'") && !wpConfig.includes('define( "DISALLOW_FILE_EDIT"')) {
          wpConfig = wpConfig.replace(
            /\/\*\s*That's all, stop editing!.*$/s,
            `\ndefine( 'DISALLOW_FILE_EDIT', true );\n\n/* That's all, stop editing! Happy publishing. */`
          );
        }
      }
      
      // Add performance settings
      if (this.config.wordpress.memoryLimit) {
        // Check if WP_MEMORY_LIMIT is not already defined
        if (!wpConfig.includes("define( 'WP_MEMORY_LIMIT'") && !wpConfig.includes('define( "WP_MEMORY_LIMIT"')) {
          wpConfig = wpConfig.replace(
            /\/\*\s*That's all, stop editing!.*$/s,
            `\ndefine( 'WP_MEMORY_LIMIT', '${this.config.wordpress.memoryLimit}' );\n\n/* That's all, stop editing! Happy publishing. */`
          );
        }
      }
      
      // Add custom wp-config lines
      if (this.config.custom.wpConfig && this.config.custom.wpConfig.length > 0) {
        const customConfig = '\n' + this.config.custom.wpConfig.join('\n') + '\n';
        wpConfig = wpConfig.replace(
          /\/\*\s*That's all, stop editing!.*$/s,
          `${customConfig}\n/* That's all, stop editing! Happy publishing. */`
        );
      }
      
      // Ensure wp-config.php ends with proper WordPress loading
      if (!wpConfig.includes("require_once(ABSPATH . 'wp-settings.php');")) {
        wpConfig = wpConfig.replace(
          /\/\*\s*That's all, stop editing!.*$/s,
          `\n/* That's all, stop editing! Happy publishing. */\n\nrequire_once(ABSPATH . 'wp-settings.php');`
        );
      }
      
      await fs.writeFile(wpConfigPath, wpConfig);
      spinner.succeed('wp-config.php updated successfully');
    } catch (error) {
      spinner.fail('Failed to update wp-config.php');
      throw error;
    }
  }

  async generateSalts() {
    try {
      const response = await axios.get('https://api.wordpress.org/secret-key/1.1/salt/');
      return response.data;
    } catch (error) {
      // Fallback to local generation
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
      const generateKey = () => {
        let key = '';
        for (let i = 0; i < 64; i++) {
          key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
      };

      return `
define( 'AUTH_KEY',         '${generateKey()}' );
define( 'SECURE_AUTH_KEY',  '${generateKey()}' );
define( 'LOGGED_IN_KEY',    '${generateKey()}' );
define( 'NONCE_KEY',        '${generateKey()}' );
define( 'AUTH_SALT',        '${generateKey()}' );
define( 'SECURE_AUTH_SALT', '${generateKey()}' );
define( 'LOGGED_IN_SALT',   '${generateKey()}' );
define( 'NONCE_SALT',       '${generateKey()}' );`;
    }
  }

  async importDatabase() {
    if (!this.config.sql.source) {
      console.log(chalk.yellow('No SQL file specified in config. Skipping database import.'));
      return;
    }

    const spinner = ora('Importing database...').start();
    
    try {
      const sqlPath = path.resolve(this.config.sql.source);
      
      if (!await fs.pathExists(sqlPath)) {
        throw new Error(`SQL file not found: ${sqlPath}`);
      }

      // Use dedicated user credentials if created, otherwise use root
      const dbUser = this.dbUser || this.config.database.user;
      const dbPassword = this.dbPassword || this.config.database.password;

      let command;
      if (this.config.database.docker.enabled) {
        // For Docker, use docker exec with input redirection
        const passwordParam = dbPassword === '' ? '' : `-p${dbPassword}`;
        command = `docker exec -i ${this.config.database.docker.containerName} mysql -hlocalhost -u${dbUser} ${passwordParam} -P3306 ${this.dbName} < "${sqlPath}"`;
      } else {
        // For regular MySQL
        const passwordParam = dbPassword === '' ? '' : `-p${dbPassword}`;
        command = `mysql -h${this.config.database.host} -u${dbUser} ${passwordParam} -P${this.config.database.port} ${this.dbName} < "${sqlPath}"`;
      }
      
      execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
      
      // Optimize database if configured
      if (this.config.sql.optimizeAfterImport) {
        spinner.text = 'Optimizing database...';
        let optimizeCommand;
        if (this.config.database.docker.enabled) {
          const passwordParam = dbPassword === '' ? '' : `-p${dbPassword}`;
          optimizeCommand = `docker exec ${this.config.database.docker.containerName} mysql -hlocalhost -u${dbUser} ${passwordParam} -P3306 ${this.dbName} -e "OPTIMIZE TABLE wp_posts, wp_postmeta, wp_options, wp_usermeta, wp_users, wp_terms, wp_term_taxonomy, wp_term_relationships, wp_termmeta, wp_comments, wp_commentmeta;"`;
        } else {
          const passwordParam = dbPassword === '' ? '' : `-p${dbPassword}`;
          optimizeCommand = `mysql -h${this.config.database.host} -u${dbUser} ${passwordParam} -P${this.config.database.port} ${this.dbName} -e "OPTIMIZE TABLE wp_posts, wp_postmeta, wp_options, wp_usermeta, wp_users, wp_terms, wp_term_taxonomy, wp_term_relationships, wp_termmeta, wp_comments, wp_commentmeta;"`;
        }
        execSync(optimizeCommand, { stdio: 'pipe' });
      }
      
      // Repair database if configured
      if (this.config.sql.repairAfterImport) {
        spinner.text = 'Repairing database...';
        let repairCommand;
        if (this.config.database.docker.enabled) {
          const passwordParam = dbPassword === '' ? '' : `-p${dbPassword}`;
          repairCommand = `docker exec ${this.config.database.docker.containerName} mysql -hlocalhost -u${dbUser} ${passwordParam} -P3306 ${this.dbName} -e "REPAIR TABLE wp_posts, wp_postmeta, wp_options, wp_usermeta, wp_users, wp_terms, wp_term_taxonomy, wp_term_relationships, wp_termmeta, wp_comments, wp_commentmeta;"`;
        } else {
          const passwordParam = dbPassword === '' ? '' : `-p${dbPassword}`;
          repairCommand = `mysql -h${this.config.database.host} -u${dbUser} ${passwordParam} -P${this.config.database.port} ${this.dbName} -e "REPAIR TABLE wp_posts, wp_postmeta, wp_options, wp_usermeta, wp_users, wp_terms, wp_term_taxonomy, wp_term_relationships, wp_termmeta, wp_comments, wp_commentmeta;"`;
        }
        execSync(repairCommand, { stdio: 'pipe' });
      }
      
      spinner.succeed('Database imported successfully');
    } catch (error) {
      spinner.fail('Failed to import database');
      throw error;
    }
  }

  async performSearchReplace() {
    if (this.config.advanced.skipSearchReplace) {
      console.log(chalk.yellow('Skipping search-replace (configured to skip)'));
      return;
    }

    if (!this.config.sql.searchReplace.enabled) {
      console.log(chalk.yellow('Search-replace disabled in config'));
      return;
    }

    const spinner = ora('Performing search-replace in database...').start();
    
    try {
      const oldUrl = this.config.sql.oldUrl || 'http://example.com';
      const newUrl = `http://${this.websiteName}${this.config.valet.domain}`;
      
      // Perform main URL replacement
      if (oldUrl !== newUrl) {
        const dryRunFlag = this.config.sql.searchReplace.dryRun ? '--dry-run' : '';
        const caseSensitiveFlag = this.config.sql.searchReplace.caseSensitive ? '--case-sensitive' : '';
        const regexFlag = this.config.sql.searchReplace.regex ? '--regex' : '';
        
        const command = `wp search-replace "${oldUrl}" "${newUrl}" --path="${this.websitePath}" --all-tables ${dryRunFlag} ${caseSensitiveFlag} ${regexFlag}`;
        
        try {
          execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
        } catch (wpError) {
          // If WP-CLI fails, try direct MySQL approach
          console.log(chalk.yellow('WP-CLI search-replace failed, trying direct MySQL approach...'));
          await this.performDirectSearchReplace(oldUrl, newUrl);
        }
      }
      
      // Perform domain replacement
      const oldDomain = this.config.sql.oldDomain || 'example.com';
      const newDomain = `${this.websiteName}${this.config.valet.domain}`;
      
      if (oldDomain !== newDomain) {
        const dryRunFlag = this.config.sql.searchReplace.dryRun ? '--dry-run' : '';
        const caseSensitiveFlag = this.config.sql.searchReplace.caseSensitive ? '--case-sensitive' : '';
        const regexFlag = this.config.sql.searchReplace.regex ? '--regex' : '';
        
        const domainCommand = `wp search-replace "${oldDomain}" "${newDomain}" --path="${this.websitePath}" --all-tables ${dryRunFlag} ${caseSensitiveFlag} ${regexFlag}`;
        
        try {
          execSync(domainCommand, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
        } catch (wpError) {
          // If WP-CLI fails, try direct MySQL approach
          console.log(chalk.yellow('WP-CLI domain replacement failed, trying direct MySQL approach...'));
          await this.performDirectSearchReplace(oldDomain, newDomain);
        }
      }
      
      // Perform additional replacements
      if (this.config.sql.searchReplace.additionalReplacements && this.config.sql.searchReplace.additionalReplacements.length > 0) {
        for (const replacement of this.config.sql.searchReplace.additionalReplacements) {
          const dryRunFlag = this.config.sql.searchReplace.dryRun ? '--dry-run' : '';
          const caseSensitiveFlag = this.config.sql.searchReplace.caseSensitive ? '--case-sensitive' : '';
          const regexFlag = this.config.sql.searchReplace.regex ? '--regex' : '';
          
          const additionalCommand = `wp search-replace "${replacement.search}" "${replacement.replace}" --path="${this.websitePath}" --all-tables ${dryRunFlag} ${caseSensitiveFlag} ${regexFlag}`;
          
          try {
            execSync(additionalCommand, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
          } catch (wpError) {
            // If WP-CLI fails, try direct MySQL approach
            console.log(chalk.yellow(`WP-CLI replacement failed for "${replacement.search}", trying direct MySQL approach...`));
            await this.performDirectSearchReplace(replacement.search, replacement.replace);
          }
        }
      }
      
      spinner.succeed('Search-replace completed successfully');
    } catch (error) {
      spinner.fail('Failed to perform search-replace');
      throw error;
    }
  }

  async performDirectSearchReplace(search, replace) {
    try {
      // Get database connection details
      const dbUser = this.dbUser || this.config.database.user;
      const dbPassword = this.config.database.password;
      const passwordParam = dbPassword === '' ? '' : `-p${dbPassword}`;
      
      // Get all tables in the database
      let showTablesCommand;
      if (this.config.database.docker.enabled) {
        showTablesCommand = `docker exec ${this.config.database.docker.containerName} mysql -hlocalhost -u${dbUser} ${passwordParam} -P3306 ${this.dbName} -e "SHOW TABLES"`;
      } else {
        showTablesCommand = `mysql -h${this.config.database.host} -u${dbUser} ${passwordParam} -P${this.config.database.port} ${this.dbName} -e "SHOW TABLES"`;
      }
      
      const tablesOutput = execSync(showTablesCommand, { stdio: 'pipe' }).toString();
      const tables = tablesOutput.split('\n').filter(line => line.trim() && !line.includes('Tables_in_'));
      
      // Perform search-replace on each table
      for (const table of tables) {
        let updateCommand;
        if (this.config.database.docker.enabled) {
          updateCommand = `docker exec ${this.config.database.docker.containerName} mysql -hlocalhost -u${dbUser} ${passwordParam} -P3306 ${this.dbName} -e "UPDATE \\\`${table}\\\` SET option_value = REPLACE(option_value, '${search}', '${replace}') WHERE option_value LIKE '%${search}%'"`;
        } else {
          updateCommand = `mysql -h${this.config.database.host} -u${dbUser} ${passwordParam} -P${this.config.database.port} ${this.dbName} -e "UPDATE \\\`${table}\\\` SET option_value = REPLACE(option_value, '${search}', '${replace}') WHERE option_value LIKE '%${search}%'"`;
        }
        
        try {
          execSync(updateCommand, { stdio: 'pipe' });
        } catch (error) {
          // Table might not have option_value column, try other common columns
          const commonColumns = ['post_content', 'post_excerpt', 'post_title', 'comment_content', 'meta_value'];
          for (const column of commonColumns) {
            try {
              let columnUpdateCommand;
              if (this.config.database.docker.enabled) {
                columnUpdateCommand = `docker exec ${this.config.database.docker.containerName} mysql -hlocalhost -u${dbUser} ${passwordParam} -P3306 ${this.dbName} -e "UPDATE \\\`${table}\\\` SET \\\`${column}\\\` = REPLACE(\\\`${column}\\\`, '${search}', '${replace}') WHERE \\\`${column}\\\` LIKE '%${search}%'"`;
              } else {
                columnUpdateCommand = `mysql -h${this.config.database.host} -u${dbUser} ${passwordParam} -P${this.config.database.port} ${this.dbName} -e "UPDATE \\\`${table}\\\` SET \\\`${column}\\\` = REPLACE(\\\`${column}\\\`, '${search}', '${replace}') WHERE \\\`${column}\\\` LIKE '%${search}%'"`;
              }
              execSync(columnUpdateCommand, { stdio: 'pipe' });
            } catch (columnError) {
              // Column doesn't exist in this table, continue
            }
          }
        }
      }
    } catch (error) {
      console.warn(chalk.yellow(`Direct MySQL search-replace failed: ${error.message}`));
    }
  }

  async checkAdminUserExists() {
    try {
      const dbUser = this.dbUser || this.config.database.user;
      const dbPassword = this.dbPassword || this.config.database.password;
      const passwordParam = dbPassword === '' ? '' : `-p${dbPassword}`;
      
      let checkCommand;
      if (this.config.database.docker.enabled) {
        checkCommand = `docker exec ${this.config.database.docker.containerName} mysql -hlocalhost -u${dbUser} ${passwordParam} -P3306 ${this.dbName} -e "SELECT COUNT(*) as count FROM ${this.config.database.prefix}users WHERE user_login = '${this.config.wordpress.adminUser}'"`;
      } else {
        checkCommand = `mysql -h${this.config.database.host} -u${dbUser} ${passwordParam} -P${this.config.database.port} ${this.dbName} -e "SELECT COUNT(*) as count FROM ${this.config.database.prefix}users WHERE user_login = '${this.config.wordpress.adminUser}'"`;
      }
      
      const output = execSync(checkCommand, { stdio: 'pipe' }).toString();
      const lines = output.split('\n').filter(line => line.trim() && !line.includes('count'));
      
      if (lines.length > 0) {
        const count = parseInt(lines[0].trim());
        return count > 0;
      }
      
      return false;
    } catch (error) {
      if (this.config.advanced.verbose) {
        console.log(chalk.yellow(`Error checking admin user: ${error.message}`));
      }
      return false;
    }
  }

  async updateAdminUserPassword() {
    const spinner = ora('Updating admin user password...').start();
    
    try {
      const dbUser = this.dbUser || this.config.database.user;
      const dbPassword = this.dbPassword || this.config.database.password;
      const passwordParam = dbPassword === '' ? '' : `-p${dbPassword}`;
      
      // Hash the password using WordPress's password hashing
      const hashedPassword = await this.hashWordPressPassword(this.adminPassword);
      
      let updateCommand;
      if (this.config.database.docker.enabled) {
        updateCommand = `docker exec ${this.config.database.docker.containerName} mysql -hlocalhost -u${dbUser} ${passwordParam} -P3306 ${this.dbName} -e "UPDATE ${this.config.database.prefix}users SET user_pass = '${hashedPassword}' WHERE user_login = '${this.config.wordpress.adminUser}'"`;
      } else {
        updateCommand = `mysql -h${this.config.database.host} -u${dbUser} ${passwordParam} -P${this.config.database.port} ${this.dbName} -e "UPDATE ${this.config.database.prefix}users SET user_pass = '${hashedPassword}' WHERE user_login = '${this.config.wordpress.adminUser}'"`;
      }
      
      execSync(updateCommand, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
      
      spinner.succeed('Admin user password updated successfully');
    } catch (error) {
      spinner.fail('Failed to update admin user password');
      throw error;
    }
  }

  async createAdminUser() {
    const spinner = ora('Creating admin user...').start();
    
    try {
      const dbUser = this.dbUser || this.config.database.user;
      const dbPassword = this.dbPassword || this.config.database.password;
      const passwordParam = dbPassword === '' ? '' : `-p${dbPassword}`;
      
      // Hash the password using WordPress's password hashing
      const hashedPassword = await this.hashWordPressPassword(this.adminPassword);
      
      // Get the current timestamp
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      let insertCommand;
      if (this.config.database.docker.enabled) {
        insertCommand = `docker exec ${this.config.database.docker.containerName} mysql -hlocalhost -u${dbUser} ${passwordParam} -P3306 ${this.dbName} -e "INSERT INTO ${this.config.database.prefix}users (user_login, user_pass, user_nicename, user_email, user_url, user_registered, user_activation_key, user_status, display_name) VALUES ('${this.config.wordpress.adminUser}', '${hashedPassword}', '${this.config.wordpress.adminUser}', '${this.adminEmail}', '', '${now}', '', 0, '${this.config.wordpress.adminUser}')"`;
      } else {
        insertCommand = `mysql -h${this.config.database.host} -u${dbUser} ${passwordParam} -P${this.config.database.port} ${this.dbName} -e "INSERT INTO ${this.config.database.prefix}users (user_login, user_pass, user_nicename, user_email, user_url, user_registered, user_activation_key, user_status, display_name) VALUES ('${this.config.wordpress.adminUser}', '${hashedPassword}', '${this.config.wordpress.adminUser}', '${this.adminEmail}', '', '${now}', '', 0, '${this.config.wordpress.adminUser}')"`;
      }
      
      execSync(insertCommand, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
      
      // Get the user ID
      let getUserIdCommand;
      if (this.config.database.docker.enabled) {
        getUserIdCommand = `docker exec ${this.config.database.docker.containerName} mysql -hlocalhost -u${dbUser} ${passwordParam} -P3306 ${this.dbName} -e "SELECT ID FROM ${this.config.database.prefix}users WHERE user_login = '${this.config.wordpress.adminUser}'"`;
      } else {
        getUserIdCommand = `mysql -h${this.config.database.host} -u${dbUser} ${passwordParam} -P${this.config.database.port} ${this.dbName} -e "SELECT ID FROM ${this.config.database.prefix}users WHERE user_login = '${this.config.wordpress.adminUser}'"`;
      }
      
      const userIdOutput = execSync(getUserIdCommand, { stdio: 'pipe' }).toString();
      const userIdLines = userIdOutput.split('\n').filter(line => line.trim() && !line.includes('ID'));
      const userId = userIdLines.length > 0 ? userIdLines[0].trim() : null;
      
      if (userId) {
        // Add admin capabilities
        let addCapabilitiesCommand;
        if (this.config.database.docker.enabled) {
          addCapabilitiesCommand = `docker exec ${this.config.database.docker.containerName} mysql -hlocalhost -u${dbUser} ${passwordParam} -P3306 ${this.dbName} -e "INSERT INTO ${this.config.database.prefix}usermeta (user_id, meta_key, meta_value) VALUES (${userId}, '${this.config.database.prefix}capabilities', 'a:1:{s:13:\\\"administrator\\\";b:1;}'), (${userId}, '${this.config.database.prefix}user_level', '10')"`;
        } else {
          addCapabilitiesCommand = `mysql -h${this.config.database.host} -u${dbUser} ${passwordParam} -P${this.config.database.port} ${this.dbName} -e "INSERT INTO ${this.config.database.prefix}usermeta (user_id, meta_key, meta_value) VALUES (${userId}, '${this.config.database.prefix}capabilities', 'a:1:{s:13:\\\"administrator\\\";b:1;}'), (${userId}, '${this.config.database.prefix}user_level', '10')"`;
        }
        
        execSync(addCapabilitiesCommand, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
      }
      
      spinner.succeed('Admin user created successfully');
    } catch (error) {
      spinner.fail('Failed to create admin user');
      throw error;
    }
  }

  async hashWordPressPassword(password) {
    try {
      // Use WP-CLI to hash the password
      const command = `wp eval "echo wp_hash_password('${password}');" --path="${this.websitePath}"`;
      const hashedPassword = execSync(command, { stdio: 'pipe' }).toString().trim();
      return hashedPassword;
    } catch (error) {
      // Fallback to a simple hash if WP-CLI fails
      const crypto = require('crypto');
      const hash = crypto.createHash('md5').update(password).digest('hex');
      return `$P$B${hash}`; // WordPress-style hash prefix
    }
  }

  async manageAdminUser() {
    if (!this.config.sql.source) {
      // No database import, skip admin user management
      return;
    }

    const spinner = ora('Managing admin user...').start();
    
    try {
      const adminUserExists = await this.checkAdminUserExists();
      
      if (adminUserExists) {
        spinner.text = 'Admin user exists, updating password...';
        await this.updateAdminUserPassword();
      } else {
        spinner.text = 'Admin user does not exist, creating new user...';
        await this.createAdminUser();
      }
      
      spinner.succeed('Admin user management completed successfully');
    } catch (error) {
      spinner.fail('Failed to manage admin user');
      throw error;
    }
  }

  async installPlugins() {
    if (this.config.advanced.skipPluginInstallation) {
      console.log(chalk.yellow('Skipping plugin installation (configured to skip)'));
      return;
    }

    const spinner = ora('Installing plugins...').start();
    
    try {
      // Install WordPress.org plugins
      if (this.config.plugins.wordpressOrg && this.config.plugins.wordpressOrg.length > 0) {
        spinner.text = 'Installing WordPress.org plugins...';
        for (const plugin of this.config.plugins.wordpressOrg) {
          const activateFlag = this.config.plugins.activateAll ? '--activate' : '';
          const command = `wp plugin install ${plugin} --path="${this.websitePath}" ${activateFlag}`;
          execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
        }
      }

      // Install local plugins
      if (this.config.plugins.local && this.config.plugins.local.length > 0) {
        spinner.text = 'Installing local plugins...';
        for (const pluginPath of this.config.plugins.local) {
          const resolvedPath = path.resolve(pluginPath);
          if (await fs.pathExists(resolvedPath)) {
            const pluginName = path.basename(resolvedPath);
            const targetPath = path.join(this.websitePath, 'wp-content', 'plugins', pluginName);
            await fs.copy(resolvedPath, targetPath);
            
            if (this.config.plugins.activateAll) {
              const command = `wp plugin activate ${pluginName} --path="${this.websitePath}"`;
              execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
            }
          }
        }
      }

      // Install GitHub plugins
      if (this.config.plugins.github && this.config.plugins.github.length > 0) {
        spinner.text = 'Installing GitHub plugins...';
        for (const plugin of this.config.plugins.github) {
          const branch = plugin.branch || 'main';
          const command = `wp plugin install https://github.com/${plugin.repo}/archive/${branch}.zip --path="${this.websitePath}" ${plugin.activate ? '--activate' : ''}`;
          execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
        }
      }

      // Install ZIP plugins
      if (this.config.plugins.zip && this.config.plugins.zip.length > 0) {
        spinner.text = 'Installing ZIP plugins...';
        for (const zipPath of this.config.plugins.zip) {
          const resolvedPath = path.resolve(zipPath);
          if (await fs.pathExists(resolvedPath)) {
            const command = `wp plugin install "${resolvedPath}" --path="${this.websitePath}" ${this.config.plugins.activateAll ? '--activate' : ''}`;
            execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
          }
        }
      }

      // Remove default plugins
      if (this.config.plugins.removeDefault && this.config.plugins.removeDefault.length > 0) {
        spinner.text = 'Removing default plugins...';
        for (const plugin of this.config.plugins.removeDefault) {
          const command = `wp plugin delete ${plugin} --path="${this.websitePath}"`;
          try {
            execSync(command, { stdio: 'pipe' });
          } catch (error) {
            // Plugin might not exist, continue
          }
        }
      }

      // Update plugins if configured
      if (this.config.plugins.updateAfterInstall) {
        spinner.text = 'Updating plugins...';
        const command = `wp plugin update --all --path="${this.websitePath}"`;
        execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
      }

      spinner.succeed('Plugins installed successfully');
    } catch (error) {
      spinner.fail('Failed to install plugins');
      throw error;
    }
  }

  async installThemes() {
    if (this.config.advanced.skipThemeInstallation) {
      console.log(chalk.yellow('Skipping theme installation (configured to skip)'));
      return;
    }

    const spinner = ora('Installing themes...').start();
    
    try {
      // Install WordPress.org themes
      if (this.config.themes.wordpressOrg && this.config.themes.wordpressOrg.length > 0) {
        spinner.text = 'Installing WordPress.org themes...';
        for (const theme of this.config.themes.wordpressOrg) {
          const command = `wp theme install ${theme} --path="${this.websitePath}"`;
          execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
        }
      }

      // Install local themes
      if (this.config.themes.local && this.config.themes.local.length > 0) {
        spinner.text = 'Installing local themes...';
        for (const themePath of this.config.themes.local) {
          const resolvedPath = path.resolve(themePath);
          if (await fs.pathExists(resolvedPath)) {
            const themeName = path.basename(resolvedPath);
            const targetPath = path.join(this.websitePath, 'wp-content', 'themes', themeName);
            await fs.copy(resolvedPath, targetPath);
          }
        }
      }

      // Install GitHub themes
      if (this.config.themes.github && this.config.themes.github.length > 0) {
        spinner.text = 'Installing GitHub themes...';
        for (const theme of this.config.themes.github) {
          const branch = theme.branch || 'main';
          const command = `wp theme install https://github.com/${theme.repo}/archive/${branch}.zip --path="${this.websitePath}"`;
          execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
        }
      }

      // Install ZIP themes
      if (this.config.themes.zip && this.config.themes.zip.length > 0) {
        spinner.text = 'Installing ZIP themes...';
        for (const zipPath of this.config.themes.zip) {
          const resolvedPath = path.resolve(zipPath);
          if (await fs.pathExists(resolvedPath)) {
            const command = `wp theme install "${resolvedPath}" --path="${this.websitePath}"`;
            execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
          }
        }
      }

      // Remove default themes
      if (this.config.themes.removeDefault && this.config.themes.removeDefault.length > 0) {
        spinner.text = 'Removing default themes...';
        for (const theme of this.config.themes.removeDefault) {
          const command = `wp theme delete ${theme} --path="${this.websitePath}"`;
          try {
            execSync(command, { stdio: 'pipe' });
          } catch (error) {
            // Theme might not exist, continue
          }
        }
      }

      // Activate specified theme
      if (this.config.themes.activate) {
        spinner.text = 'Activating theme...';
        const command = `wp theme activate ${this.config.themes.activate} --path="${this.websitePath}"`;
        execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
      }

      // Update themes if configured
      if (this.config.themes.updateAfterInstall) {
        spinner.text = 'Updating themes...';
        const command = `wp theme update --all --path="${this.websitePath}"`;
        execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
      }

      spinner.succeed('Themes installed successfully');
    } catch (error) {
      spinner.fail('Failed to install themes');
      throw error;
    }
  }

  async copyUploads() {
    if (this.config.advanced.skipUploadsCopy) {
      console.log(chalk.yellow('Skipping uploads copy (configured to skip)'));
      return;
    }

    if (!this.config.uploads.source) {
      console.log(chalk.yellow('No uploads folder specified in config. Skipping uploads copy.'));
      return;
    }

    const spinner = ora('Copying uploads...').start();
    
    try {
      const uploadsSource = path.resolve(this.config.uploads.source);
      const uploadsTarget = path.join(this.websitePath, 'wp-content', 'uploads');
      
      if (!await fs.pathExists(uploadsSource)) {
        throw new Error(`Uploads folder not found: ${uploadsSource}`);
      }

      await fs.copy(uploadsSource, uploadsTarget);
      
      // Set permissions if configured
      if (this.config.uploads.setPermissions) {
        spinner.text = 'Setting uploads permissions...';
        
        // Use util.promisify to convert glob to Promise-based
        const globAsync = util.promisify(glob);
        const files = await globAsync('**/*', { cwd: uploadsTarget, nodir: true });
        const dirs = await globAsync('**/*', { cwd: uploadsTarget, nodir: false });
        
        for (const file of files) {
          await fs.chmod(path.join(uploadsTarget, file), this.config.uploads.permissions.files);
        }
        
        for (const dir of dirs) {
          await fs.chmod(path.join(uploadsTarget, dir), this.config.uploads.permissions.directories);
        }
      }
      
      spinner.succeed('Uploads copied successfully');
    } catch (error) {
      spinner.fail('Failed to copy uploads');
      throw error;
    }
  }

  async setupValet() {
    if (this.config.advanced.skipValetSetup) {
      console.log(chalk.yellow('Skipping Valet setup (configured to skip)'));
      return;
    }

    if (!this.config.valet.enabled) {
      console.log(chalk.yellow('Valet setup disabled in config'));
      return;
    }

    const spinner = ora('Setting up Valet...').start();
    
    try {
      if (this.config.valet.park) {
        // Park the directory
        const command = `cd "${path.dirname(this.websitePath)}" && valet park`;
        execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
        spinner.succeed(`Valet park complete. Your site is available at: http://${this.websiteName}${this.config.valet.domain}`);
      } else if (this.config.valet.proxy) {
        // Use proxy
        const command = `valet proxy ${this.websiteName} http://localhost:8080`;
        execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
        spinner.succeed(`Valet proxy complete. Your site is available at: http://${this.websiteName}${this.config.valet.domain}`);
      } else {
        // Link the site with Valet
        const command = `cd "${this.websitePath}" && valet link ${this.websiteName}`;
        execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
        
        // Secure with HTTPS if configured
        if (this.config.valet.secure) {
          spinner.text = 'Securing with HTTPS...';
          const secureCommand = `valet secure ${this.websiteName}`;
          execSync(secureCommand, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
        }
        
        spinner.succeed(`Valet setup complete. Your site is available at: http${this.config.valet.secure ? 's' : ''}://${this.websiteName}${this.config.valet.domain}`);
      }
    } catch (error) {
      spinner.fail('Failed to setup Valet');
      console.log(chalk.yellow('Make sure Laravel Valet is installed and running'));
    }
  }

  async installWordPress() {
    const spinner = ora('Installing WordPress...').start();
    
    try {
      const url = `http://${this.websiteName}${this.config.valet.domain}`;
      
      const command = `wp core install --url="${url}" --title="${this.config.wordpress.siteTitle}" --admin_user="${this.config.wordpress.adminUser}" --admin_password="${this.adminPassword}" --admin_email="${this.adminEmail}" --path="${this.websitePath}"`;
      execSync(command, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
      
      // Configure WordPress settings
      if (this.config.wordpress.usePermalinks) {
        const permalinkCommand = `wp rewrite structure "${this.config.wordpress.permalinkStructure}" --path="${this.websitePath}"`;
        execSync(permalinkCommand, { stdio: 'pipe' });
      }
      
      if (this.config.wordpress.disableComments) {
        const commentsCommand = `wp option update default_comment_status closed --path="${this.websitePath}"`;
        execSync(commentsCommand, { stdio: 'pipe' });
      }
      
      if (this.config.wordpress.disableTrackbacks) {
        const trackbacksCommand = `wp option update default_ping_status closed --path="${this.websitePath}"`;
        execSync(trackbacksCommand, { stdio: 'pipe' });
      }
      
      if (this.config.wordpress.disablePingbacks) {
        const pingbacksCommand = `wp option update default_pingback_flag 0 --path="${this.websitePath}"`;
        execSync(pingbacksCommand, { stdio: 'pipe' });
      }
      
      // Set timezone
      if (this.config.wordpress.timezone) {
        const timezoneCommand = `wp option update timezone_string "${this.config.wordpress.timezone}" --path="${this.websitePath}"`;
        execSync(timezoneCommand, { stdio: 'pipe' });
      }
      
      // Set date format
      if (this.config.wordpress.dateFormat) {
        const dateFormatCommand = `wp option update date_format "${this.config.wordpress.dateFormat}" --path="${this.websitePath}"`;
        execSync(dateFormatCommand, { stdio: 'pipe' });
      }
      
      // Set time format
      if (this.config.wordpress.timeFormat) {
        const timeFormatCommand = `wp option update time_format "${this.config.wordpress.timeFormat}" --path="${this.websitePath}"`;
        execSync(timeFormatCommand, { stdio: 'pipe' });
      }
      
      // Set start of week
      if (this.config.wordpress.startOfWeek !== undefined) {
        const startOfWeekCommand = `wp option update start_of_week ${this.config.wordpress.startOfWeek} --path="${this.websitePath}"`;
        execSync(startOfWeekCommand, { stdio: 'pipe' });
      }
      
      // Set privacy
      if (this.config.wordpress.privacy) {
        const privacyCommand = `wp option update blog_public ${this.config.wordpress.privacy === 'public' ? 1 : 0} --path="${this.websitePath}"`;
        execSync(privacyCommand, { stdio: 'pipe' });
      }
      
      spinner.succeed('WordPress installed and configured successfully');
    } catch (error) {
      spinner.fail('Failed to install WordPress');
      throw error;
    }
  }

  async run() {
    try {
      console.log(chalk.blue.bold('🚀 WordPress Quick Setup Script'));
      console.log(chalk.gray('This script will help you quickly set up a WordPress website for testing.\n'));

      await this.loadConfig();
      await this.promptForWebsiteName();
      
      console.log(chalk.cyan(`\nSetting up website: ${this.websiteName}`));
      console.log(chalk.gray(`Path: ${this.websitePath}`));
      console.log(chalk.gray(`Database: ${this.dbName}\n`));

      // Run before setup hooks
      if (this.config.custom.hooks.beforeSetup && this.config.custom.hooks.beforeSetup.length > 0) {
        for (const hook of this.config.custom.hooks.beforeSetup) {
          // Replace wp commands with proper path
          const hookWithPath = hook.replace(/wp /g, `wp --path="${this.websitePath}" `);
          execSync(hookWithPath, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
        }
      }

      await this.createWebsiteDirectory();
      await this.downloadWordPress();
      await this.createDatabase();
      await this.updateWpConfig();
      
      // Install WordPress if no SQL file is provided
      if (!this.config.sql.source) {
        await this.installWordPress();
      } else {
        await this.importDatabase();
        await this.performSearchReplace();
        await this.manageAdminUser();
        
        // Run after database import hooks
        if (this.config.custom.hooks.afterDatabaseImport && this.config.custom.hooks.afterDatabaseImport.length > 0) {
          for (const hook of this.config.custom.hooks.afterDatabaseImport) {
            // Replace wp commands with proper path
            const hookWithPath = hook.replace(/wp /g, `wp --path="${this.websitePath}" `);
            execSync(hookWithPath, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
          }
        }
        
        // Run after search-replace hooks
        if (this.config.custom.hooks.afterSearchReplace && this.config.custom.hooks.afterSearchReplace.length > 0) {
          for (const hook of this.config.custom.hooks.afterSearchReplace) {
            // Replace wp commands with proper path
            const hookWithPath = hook.replace(/wp /g, `wp --path="${this.websitePath}" `);
            execSync(hookWithPath, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
          }
        }
      }
      
      await this.installPlugins();
      await this.installThemes();
      await this.copyUploads();
      await this.setupValet();

      // Create final backup if configured
      if (this.config.backup.enabled && this.config.backup.afterSetup) {
        await this.createBackup();
      }

      // Run after setup hooks
      if (this.config.custom.hooks.afterSetup && this.config.custom.hooks.afterSetup.length > 0) {
        for (const hook of this.config.custom.hooks.afterSetup) {
          // Replace wp commands with proper path
          const hookWithPath = hook.replace(/wp /g, `wp --path="${this.websitePath}" `);
          execSync(hookWithPath, { stdio: this.config.advanced.verbose ? 'inherit' : 'pipe' });
        }
      }

      console.log(chalk.green.bold('\n✅ WordPress setup completed successfully!'));
      console.log(chalk.cyan(`🌐 Your website is available at: http${this.config.valet.secure ? 's' : ''}://${this.websiteName}${this.config.valet.domain}`));
      console.log(chalk.gray(`📁 Website files: ${this.websitePath}`));
      console.log(chalk.gray(`🗄️  Database: ${this.dbName}`));
      console.log(chalk.gray(`👤 Admin user: ${this.config.wordpress.adminUser}`));
      console.log(chalk.gray(`📧 Admin email: ${this.adminEmail}`));

    } catch (error) {
      console.error(chalk.red.bold('\n❌ Setup failed:'), error.message);
      if (this.config.advanced.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }
}

// CLI Commands
program
  .name('wp-script')
  .description('Quick WordPress website setup script for testing')
  .version('1.0.0');

program
  .command('setup')
  .description('Set up a new WordPress website')
  .action(async () => {
    const setup = new WordPressSetup();
    await setup.run();
  });

program
  .command('config')
  .description('Open config file for editing')
  .action(async () => {
    try {
      const { exec } = require('child_process');
      const editor = process.env.EDITOR || 'nano';
      exec(`${editor} "${CONFIG_FILE}"`);
    } catch (error) {
      console.error(chalk.red('Error opening config file:'), error.message);
    }
  });

program
  .command('list')
  .description('List all websites in ~/Server')
  .action(async () => {
    try {
      const websites = await fs.readdir(SERVER_PATH);
      console.log(chalk.blue.bold('📁 Websites in ~/Server:'));
      websites.forEach(website => {
        console.log(chalk.cyan(`  • ${website}`));
      });
    } catch (error) {
      console.error(chalk.red('Error reading Server directory:'), error.message);
    }
  });

program
  .command('docker-mysql')
  .description('Create and start Docker MySQL container')
  .action(async () => {
    try {
      const setup = new WordPressSetup();
      await setup.loadConfig();
      
      if (!setup.config.database.docker.enabled) {
        console.log(chalk.yellow('Docker MySQL is not enabled in config.'));
        return;
      }
      
      await setup.ensureDockerMysql();
      console.log(chalk.green('✅ Docker MySQL container is ready!'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to setup Docker MySQL:'), error.message);
      process.exit(1);
    }
  });

if (require.main === module) {
  program.parse();
}

module.exports = WordPressSetup;
