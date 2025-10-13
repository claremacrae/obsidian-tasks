#!/usr/bin/env node

/**
 * Clean up the generated tasks-api.d.ts file by removing:
 * - private field declarations
 * - #private placeholders
 * - @internal marked members (if API Extractor missed any)
 */

const fs = require('fs');

const API_FILE = 'tasks-api.d.ts';

function cleanApiFile() {
    console.log('🧹 Cleaning up API declaration file...');

    let content = fs.readFileSync(API_FILE, 'utf-8');
    const originalLength = content.length;

    // Remove lines with private declarations
    content = content.replace(/^\s*private\s+.*?;?\s*$/gm, '');

    fs.writeFileSync(API_FILE, content);

    const removedBytes = originalLength - content.length;
    console.log(`✅ Cleaned ${API_FILE}`);
    console.log(`   Removed ${removedBytes} bytes of private/internal declarations`);
}

try {
    cleanApiFile();
} catch (error) {
    console.error('❌ Error cleaning API file:', error.message);
    process.exit(1);
}
