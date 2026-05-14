#!/usr/bin/env node
/**
 * MongoDB Connection Tester
 * ========================
 * 
 * Tests MongoDB connection and provides troubleshooting help
 * 
 * Usage:
 *   node test-mongodb.js
 *   node test-mongodb.js --local   (test local MongoDB)
 *   node test-mongodb.js --cloud   (test cloud MongoDB Atlas)
 */

const mongoose = require('mongoose');
const dns = require('dns').promises;
const net = require('net');
require('dotenv').config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}\n${msg}\n${colors.blue}${'='.repeat(60)}${colors.reset}\n`),
};

class MongoDBTester {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI;
    this.results = {
      env: null,
      dns: null,
      port: null,
      connection: null,
      database: null,
    };
  }

  async testEnvironment() {
    log.title('🔍 ENVIRONMENT CHECK');

    if (!this.mongoUri) {
      log.error('MONGODB_URI not set in .env file');
      process.exit(1);
    }

    log.success(`MongoDB URI configured: ${this.mongoUri.substring(0, 50)}...`);
    this.results.env = true;

    // Parse URI
    try {
      const url = new URL(this.mongoUri.replace('mongodb+srv://', 'mongodb://'));
      const host = url.hostname;
      const database = url.pathname.substring(1);

      log.info(`Host: ${host}`);
      log.info(`Database: ${database}`);

      return { host, database };
    } catch (error) {
      log.error(`Invalid MongoDB URI: ${error.message}`);
      process.exit(1);
    }
  }

  async testDNS(host) {
    log.title('🌐 DNS RESOLUTION');

    try {
      const addresses = await dns.resolve4(host);
      log.success(`DNS resolved: ${host}`);
      log.info(`IP addresses: ${addresses.join(', ')}`);
      this.results.dns = true;
    } catch (error) {
      log.error(`DNS resolution failed: ${error.message}`);
      log.warning('This usually means:');
      log.warning('  - No internet connection');
      log.warning('  - Firewall blocking DNS');
      log.warning('  - Invalid hostname');
      this.results.dns = false;
    }
  }

  async testPort(host, port = 27017) {
    log.title('🔌 PORT CONNECTIVITY');

    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = 5000;

      socket.setTimeout(timeout);

      socket.on('connect', () => {
        log.success(`Port ${port} is open on ${host}`);
        this.results.port = true;
        socket.destroy();
        resolve(true);
      });

      socket.on('timeout', () => {
        log.warning(`Connection timeout to ${host}:${port}`);
        this.results.port = false;
        socket.destroy();
        resolve(false);
      });

      socket.on('error', (error) => {
        log.error(`Cannot reach ${host}:${port} - ${error.message}`);
        log.warning('This usually means:');
        log.warning('  - MongoDB server is not running');
        log.warning('  - Firewall is blocking the connection');
        log.warning('  - Wrong host or port');
        this.results.port = false;
        resolve(false);
      });

      log.info(`Testing connection to ${host}:${port}...`);
      socket.connect(port, host);
    });
  }

  async testConnection() {
    log.title('🔗 MONGODB CONNECTION');

    try {
      log.info('Connecting to MongoDB...');
      
      const options = {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        retryWrites: false,
      };

      await mongoose.connect(this.mongoUri, options);
      
      log.success('✨ MongoDB Connected Successfully!');
      this.results.connection = true;

      // Get connection info
      const connection = mongoose.connection;
      log.info(`Connected to: ${connection.host}:${connection.port}`);
      log.info(`Database: ${connection.name}`);

      return true;
    } catch (error) {
      log.error(`Connection failed: ${error.message}`);
      this.results.connection = false;

      // Provide specific help
      if (error.message.includes('ECONNREFUSED')) {
        log.warning('\nConnection refused. Try one of these:');
        log.warning('  1. Make sure MongoDB is running locally');
        log.warning('  2. Or add your IP to MongoDB Atlas whitelist');
        log.warning('  3. Or check if your cluster is paused');
      } else if (error.message.includes('authentication failed')) {
        log.warning('\nAuthentication failed. Check:');
        log.warning('  1. Username in MONGODB_URI');
        log.warning('  2. Password in MONGODB_URI');
        log.warning('  3. User exists in MongoDB');
      } else if (error.message.includes('ENOTFOUND')) {
        log.warning('\nHostname not found. Check:');
        log.warning('  1. Internet connection');
        log.warning('  2. DNS settings');
        log.warning('  3. Hostname spelling');
      }

      return false;
    }
  }

  async testDatabase() {
    log.title('📊 DATABASE ACCESS');

    if (!this.results.connection) {
      log.warning('Skipping database test (connection failed)');
      return false;
    }

    try {
      const admin = mongoose.connection.db.admin();
      const status = await admin.ping();

      log.success('Database is accessible');
      this.results.database = true;

      // List collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      log.info(`Collections: ${collections.length}`);
      if (collections.length > 0) {
        collections.slice(0, 5).forEach(col => {
          log.info(`  - ${col.name}`);
        });
      }

      return true;
    } catch (error) {
      log.error(`Database access failed: ${error.message}`);
      this.results.database = false;
      return false;
    }
  }

  printSummary() {
    log.title('📋 TEST SUMMARY');

    const checkMark = (result) => result ? '✅' : '❌';

    console.log(`Environment:    ${checkMark(this.results.env)}`);
    console.log(`DNS:            ${checkMark(this.results.dns)}`);
    console.log(`Port:           ${checkMark(this.results.port)}`);
    console.log(`Connection:     ${checkMark(this.results.connection)}`);
    console.log(`Database:       ${checkMark(this.results.database)}`);

    console.log('\n');

    if (this.results.connection) {
      log.success('MongoDB is ready to use!');
      log.info('You can now start the server with: npm start');
    } else {
      log.error('MongoDB connection failed');
      log.warning('\nTroubleshooting:');
      
      if (!this.results.dns) {
        log.warning('1. Check your internet connection');
      }
      if (!this.results.port) {
        log.warning('2. Make sure MongoDB is running');
        log.warning('   Or add your IP to MongoDB Atlas whitelist');
      }
      if (!this.results.connection) {
        log.warning('3. Check your MongoDB credentials in .env');
        log.warning('4. Make sure your MongoDB cluster is not paused');
      }

      log.info('\nSee MONGODB_CONNECTION_GUIDE.md for detailed help');
    }
  }

  async run() {
    try {
      console.clear();
      log.title('🗄️  MONGODB CONNECTION TESTER');

      const { host, database } = await this.testEnvironment();
      await this.testDNS(host);
      await this.testPort(host);
      await this.testConnection();
      await this.testDatabase();

      this.printSummary();

      await mongoose.connection.close();
      process.exit(this.results.connection ? 0 : 1);
    } catch (error) {
      log.error(`Unexpected error: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run tests
const tester = new MongoDBTester();
tester.run();
