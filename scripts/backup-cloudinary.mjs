import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

// Colors for terminal output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

console.log(`${COLORS.bright}${COLORS.cyan}==================================================${COLORS.reset}`);
console.log(`${COLORS.bright}${COLORS.cyan}       Cloudinary Local Backup Utility            ${COLORS.reset}`);
console.log(`${COLORS.bright}${COLORS.cyan}==================================================${COLORS.reset}\n`);

// 1. Load environment variables from .env
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
    console.log(`${COLORS.green}✓ Loaded environmental variables from .env${COLORS.reset}`);
  } else {
    console.warn(`${COLORS.yellow}⚠ .env file not found at workspace root. Using environment variables.${COLORS.reset}`);
  }
} catch (e) {
  console.warn(`${COLORS.yellow}⚠ Error reading .env file: ${e.message}. Using environment variables.${COLORS.reset}`);
}

const cloudName = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error(`\n${COLORS.red}❌ Error: Cloudinary credentials missing in environment variables.${COLORS.reset}`);
  console.error(`Please ensure the following are set in your .env file:`);
  console.error(` - PUBLIC_CLOUDINARY_CLOUD_NAME`);
  console.error(` - CLOUDINARY_API_KEY`);
  console.error(` - CLOUDINARY_API_SECRET\n`);
  process.exit(1);
}

const backupDir = path.resolve(process.cwd(), 'cloudinary-backup');
console.log(`${COLORS.green}✓ Backup directory set to: ${COLORS.bright}${backupDir}${COLORS.reset}\n`);

// Helper to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper to pause execution
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to download a single file using streaming
async function downloadFile(url, destPath) {
  let fileStream;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    if (!response.body) {
      throw new Error('Response body is empty');
    }
    fileStream = fs.createWriteStream(destPath);
    await pipeline(response.body, fileStream);
  } catch (err) {
    if (fileStream) {
      fileStream.close();
    }
    // Delete incomplete file if it exists
    if (fs.existsSync(destPath)) {
      try {
        fs.unlinkSync(destPath);
      } catch (_) {}
    }
    throw err;
  }
}

// Main execution function
async function runBackup() {
  const resourceTypes = ['image', 'video', 'raw'];
  const stats = {
    totalResources: 0,
    downloaded: 0,
    skipped: 0,
    failed: 0,
    totalBytes: 0,
  };

  const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  const headers = {
    'Authorization': authHeader,
    'Accept': 'application/json',
  };

  for (const type of resourceTypes) {
    console.log(`${COLORS.bright}${COLORS.blue}--- Fetching ${type} resources ---${COLORS.reset}`);
    
    let nextCursor = null;
    let hasMore = true;
    let typeCount = 0;

    while (hasMore) {
      // Build Cloudinary resources API endpoint url
      let url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/${type}?max_results=500`;
      if (nextCursor) {
        url += `&next_cursor=${nextCursor}`;
      }

      try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`API returned HTTP ${response.status}: ${text}`);
        }

        const data = await response.json();
        const resources = data.resources || [];
        nextCursor = data.next_cursor;
        hasMore = !!nextCursor;

        if (resources.length === 0) {
          console.log(`${COLORS.gray}No ${type} resources found in this batch.${COLORS.reset}`);
          break;
        }

        console.log(`${COLORS.gray}Found ${resources.length} resources in batch (next_cursor: ${nextCursor ? 'yes' : 'no'})${COLORS.reset}`);

        for (const resource of resources) {
          const { public_id, format, secure_url, bytes } = resource;
          
          // Only download assets belonging to yash-electronics
          if (!public_id.startsWith('yash-electronics/')) {
            continue;
          }

          stats.totalResources++;
          typeCount++;
          
          // Determine the filename and extension
          let fileName = public_id;
          if (format) {
            // Check if public_id already includes the extension (common for 'raw' files)
            const ext = `.${format}`;
            if (!public_id.toLowerCase().endsWith(ext.toLowerCase())) {
              fileName = `${public_id}${ext}`;
            }
          }

          // Build absolute target path
          const destPath = path.join(backupDir, type, fileName);

          // Check if file already exists with same size
          if (fs.existsSync(destPath)) {
            const localStat = fs.statSync(destPath);
            if (localStat.size === bytes) {
              stats.skipped++;
              console.log(
                `${COLORS.gray}[-] Skipped (${typeCount}): ${fileName} [${formatBytes(bytes)}] (already exists)${COLORS.reset}`
              );
              continue;
            }
          }

          // Ensure parent directory exists
          fs.mkdirSync(path.dirname(destPath), { recursive: true });

          // Download file
          try {
            console.log(
              `${COLORS.yellow}[↓] Downloading (${typeCount}): ${fileName} [${formatBytes(bytes)}]...${COLORS.reset}`
            );
            await downloadFile(secure_url, destPath);
            stats.downloaded++;
            stats.totalBytes += bytes;
            console.log(
              `${COLORS.green}[+] Success: ${fileName} saved to ${type}/${fileName}${COLORS.reset}`
            );
          } catch (downloadErr) {
            stats.failed++;
            console.error(
              `${COLORS.red}[×] Failed to download ${fileName}: ${downloadErr.message}${COLORS.reset}`
            );
          }

          // Small delay between downloads to be polite to servers
          await sleep(100);
        }

        // Delay between paginated requests
        if (hasMore) {
          await sleep(500);
        }

      } catch (err) {
        console.error(`${COLORS.red}❌ Error listing resources of type ${type}: ${err.message}${COLORS.reset}`);
        hasMore = false; // Break the pagination loop for this type
      }
    }
    console.log(); // Blank line between types
  }

  // Backup Summary
  console.log(`${COLORS.bright}${COLORS.cyan}==================================================${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.cyan}               Backup Completed                   ${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.cyan}==================================================${COLORS.reset}`);
  console.log(`Total Resources Found:  ${stats.totalResources}`);
  console.log(`Successfully Downloaded: ${COLORS.green}${stats.downloaded}${COLORS.reset}`);
  console.log(`Skipped (Up-to-date):    ${COLORS.gray}${stats.skipped}${COLORS.reset}`);
  console.log(`Failed Downloads:       ${stats.failed > 0 ? COLORS.red : COLORS.reset}${stats.failed}${COLORS.reset}`);
  console.log(`Total Downloaded Size:  ${formatBytes(stats.totalBytes)}`);
  console.log(`${COLORS.bright}${COLORS.cyan}==================================================${COLORS.reset}\n`);
}

runBackup().catch((err) => {
  console.error(`\n${COLORS.red}Fatal execution error: ${err.message}${COLORS.reset}`);
  process.exit(1);
});
