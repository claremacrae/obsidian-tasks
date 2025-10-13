#!/usr/bin/env node

/**
 * Copy tasks-api.d.ts to the demo vault for testing and distribution
 */

const fs = require('fs');
const path = require('path');

const SOURCE_FILE = 'tasks-api.d.ts';
const DEST_FILE = 'resources/sample_vaults/Tasks-Demo/_meta/tasks-api.d.ts';

function copyApiTypes() {
    try {
        // Ensure destination directory exists
        const destDir = path.dirname(DEST_FILE);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
            console.log(`📁 Created directory: ${destDir}`);
        }

        // Copy the file
        fs.copyFileSync(SOURCE_FILE, DEST_FILE);

        console.log(`✅ Copied ${SOURCE_FILE} -> ${DEST_FILE}`);
    } catch (error) {
        console.error('❌ Error copying API types:', error.message);
        process.exit(1);
    }
}

copyApiTypes();
