// Simple test to check if upload directory is correct
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current working directory:', process.cwd());
console.log('Script directory:', __dirname);

const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
console.log('Uploads directory path:', uploadsDir);

import fs from 'fs';
console.log('Directory exists:', fs.existsSync(uploadsDir));
