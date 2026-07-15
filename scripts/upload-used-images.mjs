import fs from 'fs';
import path from 'path';
import crypto from 'node:crypto';
import pg from 'pg';

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
console.log(`${COLORS.bright}${COLORS.cyan}     Cloudinary Database Sync & Cleanup Utility   ${COLORS.reset}`);
console.log(`${COLORS.bright}${COLORS.cyan}==================================================${COLORS.reset}\n`);

// Parse command line arguments
const args = process.argv.slice(2);
const isExecute = args.includes('--execute');
const isCleanup = args.includes('--cleanup');

if (!isExecute) {
  console.log(`${COLORS.bright}${COLORS.yellow}ℹ RUNNING IN DRY-RUN MODE.${COLORS.reset}`);
  console.log(`${COLORS.yellow}No files will be uploaded, no assets deleted, and no DB updates made.${COLORS.reset}`);
  console.log(`${COLORS.yellow}To execute the actions, run: ${COLORS.bright}pnpm sync -- --execute${COLORS.reset}\n`);
} else {
  console.log(`${COLORS.bright}${COLORS.magenta}⚠ EXECUTE MODE ENABLED.${COLORS.reset}`);
  if (isCleanup) {
    console.log(`${COLORS.bright}${COLORS.red}⚠ CLEANUP MODE ENABLED. UNUSED CLOUDINARY ASSETS WILL BE DELETED.${COLORS.reset}\n`);
  } else {
    console.log(`${COLORS.yellow}Orphan/unused assets on Cloudinary will NOT be deleted. Run with --cleanup to clean them.${COLORS.reset}\n`);
  }
}

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
    console.warn(`${COLORS.yellow}⚠ .env file not found at workspace root.${COLORS.reset}`);
  }
} catch (e) {
  console.warn(`${COLORS.yellow}⚠ Error reading .env: ${e.message}${COLORS.reset}`);
}

const cloudName = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const dbUrl = process.env.DATABASE_URL;

if (!cloudName || !apiKey || !apiSecret || !dbUrl) {
  console.error(`\n${COLORS.red}❌ Error: Missing configuration. Ensure DATABASE_URL and Cloudinary credentials are set in .env.${COLORS.reset}\n`);
  process.exit(1);
}

// Load mapping file
let uploadMap = {};
try {
  const mapPath = path.resolve(process.cwd(), 'scripts', 'cloudinary-uploads.json');
  if (fs.existsSync(mapPath)) {
    uploadMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    console.log(`${COLORS.green}✓ Loaded mapping from scripts/cloudinary-uploads.json (${Object.keys(uploadMap).length} mappings)${COLORS.reset}`);
  }
} catch (e) {
  console.warn(`${COLORS.yellow}⚠ Could not read scripts/cloudinary-uploads.json: ${e.message}${COLORS.reset}`);
}

// Helper to determine Cloudinary resource type
function getResourceType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (['.mp4', '.webm', '.ogg', '.mov'].includes(ext)) {
    return 'video';
  }
  return 'image';
}

// Helper to resolve Cloudinary Public ID for a DB reference
function getPublicIdForPath(dbPath) {
  if (!dbPath) return '';
  if (!dbPath.startsWith('/') && !dbPath.startsWith('http')) {
    return dbPath; // Already public ID
  }
  if (uploadMap[dbPath]) {
    return uploadMap[dbPath];
  }

  // Fallback generation
  let cleanPath = dbPath;
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }
  cleanPath = cleanPath.replace(/^images\/seed\//, '').replace(/^images\//, '');
  const ext = path.extname(cleanPath);
  if (ext) {
    cleanPath = cleanPath.slice(0, -ext.length);
  }
  return `yash-electronics/${cleanPath}`;
}

// Helper to find local file for a DB reference
function findLocalFile(ref) {
  if (!ref) return null;

  // Case 1: reference starts with '/' (relative local path)
  if (ref.startsWith('/')) {
    const localPath = path.join(process.cwd(), 'public', ref);
    if (fs.existsSync(localPath)) return localPath;
    
    // Check backup folder
    const fileName = path.basename(ref);
    const backupImgPath = path.join(process.cwd(), 'cloudinary-backup', 'image', fileName);
    if (fs.existsSync(backupImgPath)) return backupImgPath;
    const backupVidPath = path.join(process.cwd(), 'cloudinary-backup', 'video', fileName);
    if (fs.existsSync(backupVidPath)) return backupVidPath;

    return null;
  }

  // Case 2: reference is already a Cloudinary public ID
  // Find in backup folder
  const resourceTypes = ['image', 'video', 'raw'];
  for (const type of resourceTypes) {
    const folderPath = path.join(process.cwd(), 'cloudinary-backup', type, path.dirname(ref));
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      const baseName = path.basename(ref).toLowerCase();
      const baseNameWithoutExt = path.parse(ref).name.toLowerCase();
      const match = files.find(file => {
        const fileLower = file.toLowerCase();
        const fileBase = path.parse(file).name.toLowerCase();
        return fileLower === baseName || fileBase === baseName || fileBase === baseNameWithoutExt;
      });
      if (match) return path.join(folderPath, match);
    }
  }

  // Check translated path in public folder
  let subPath = ref;
  if (ref.startsWith('yash-electronics/')) {
    subPath = ref.replace('yash-electronics/', '');
  }
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'images', 'seed', subPath),
    path.join(process.cwd(), 'public', 'images', subPath),
    path.join(process.cwd(), 'public', subPath)
  ];
  for (const p of possiblePaths) {
    for (const ext of ['', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.mp4']) {
      const fullP = p + ext;
      if (fs.existsSync(fullP) && fs.statSync(fullP).isFile()) {
        return fullP;
      }
    }
  }

  return null;
}

// Helper to query Cloudinary list of resources
async function getCloudinaryAssets() {
  const assets = new Map();
  const resourceTypes = ['image', 'video', 'raw'];
  
  const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  const headers = {
    'Authorization': authHeader,
    'Accept': 'application/json',
  };

  for (const type of resourceTypes) {
    let nextCursor = null;
    let hasMore = true;
    
    while (hasMore) {
      let url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/${type}?max_results=500`;
      if (nextCursor) {
        url += `&next_cursor=${nextCursor}`;
      }
      
      try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} listing ${type}`);
        }
        const data = await response.json();
        const resources = data.resources || [];
        nextCursor = data.next_cursor;
        hasMore = !!nextCursor;
        
        for (const res of resources) {
          assets.set(res.public_id, {
            public_id: res.public_id,
            resource_type: res.resource_type,
            bytes: res.bytes,
            format: res.format,
            secure_url: res.secure_url
          });
        }
      } catch (err) {
        console.warn(`${COLORS.yellow}⚠ Failed to fetch ${type} resources from Cloudinary: ${err.message}${COLORS.reset}`);
        hasMore = false;
      }
    }
  }
  return assets;
}

// Helper to upload file to Cloudinary
async function uploadToCloudinary(filePath, publicId, resourceType) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramString = `overwrite=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(paramString).digest('hex');

  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]);

  const formData = new FormData();
  formData.append('file', blob, path.basename(filePath));
  formData.append('public_id', publicId);
  formData.append('timestamp', String(timestamp));
  formData.append('overwrite', 'true');
  formData.append('api_key', apiKey);
  formData.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Upload failed: ${response.statusText}`);
  }
  return data;
}

// Helper to destroy file on Cloudinary
async function deleteFromCloudinary(publicId, resourceType) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(paramString).digest('hex');

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('timestamp', String(timestamp));
  formData.append('api_key', apiKey);
  formData.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Destroy failed: ${response.statusText}`);
  }
  return data;
}

async function runSync() {
  console.log(`Connecting to database...`);
  const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
  const hasDisableSSL = dbUrl.includes('sslmode=disable');
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: (isLocal || hasDisableSSL) ? false : { rejectUnauthorized: false },
  });
  await client.connect();
  console.log(`${COLORS.green}✓ Connected to database.${COLORS.reset}\n`);

  console.log(`Fetching assets list from Cloudinary...`);
  const cloudinaryAssets = await getCloudinaryAssets();
  console.log(`${COLORS.green}✓ Found ${cloudinaryAssets.size} assets currently on Cloudinary.${COLORS.reset}\n`);

  // Target structures of DB tables to scan
  const dbTables = [
    {
      table: 'settings',
      idCol: 'key',
      imgCols: ['value'],
      filter: "key IN ('heroImage', 'logoUrl')",
      isArray: [false]
    },
    {
      table: 'categories',
      idCol: 'id',
      imgCols: ['image'],
      filter: '1=1',
      isArray: [false]
    },
    {
      table: 'brands',
      idCol: 'id',
      imgCols: ['logo'],
      filter: '1=1',
      isArray: [false]
    },
    {
      table: 'products',
      idCol: 'id',
      imgCols: ['images'],
      filter: '1=1',
      isArray: [true]
    },
    {
      table: 'offers',
      idCol: 'id',
      imgCols: ['image'],
      filter: '1=1',
      isArray: [false]
    },
    {
      table: 'team_members',
      idCol: 'id',
      imgCols: ['photo'],
      filter: '1=1',
      isArray: [false]
    },
    {
      table: 'services',
      idCol: 'id',
      imgCols: ['image'],
      filter: '1=1',
      isArray: [false]
    },
    {
      table: 'about_info',
      idCol: 'id',
      imgCols: ['photo'],
      filter: '1=1',
      isArray: [false]
    },
    {
      table: 'bank_details',
      idCol: 'id',
      imgCols: ['upi_qr_code', 'bank_qr_code'],
      filter: '1=1',
      isArray: [false, false]
    },
    {
      table: 'promo_videos',
      idCol: 'id',
      imgCols: ['video_url', 'thumbnail_url'],
      filter: '1=1',
      isArray: [false, false]
    }
  ];

  const usedCloudinaryIds = new Set();
  const dbUpdates = []; // List of pending db update functions

  let totalReferencesChecked = 0;
  let totalUploads = 0;
  let totalSkips = 0;
  let totalMissing = 0;

  for (const target of dbTables) {
    console.log(`${COLORS.bright}${COLORS.blue}Scanning table: ${target.table}...${COLORS.reset}`);
    const selectQuery = `SELECT ${target.idCol}, ${target.imgCols.join(', ')} FROM ${target.table} WHERE ${target.filter}`;
    const result = await client.query(selectQuery);
    
    console.log(`Found ${result.rows.length} rows to check.`);
    
    for (const row of result.rows) {
      const idVal = row[target.idCol];

      for (let i = 0; i < target.imgCols.length; i++) {
        const col = target.imgCols[i];
        const isArr = target.isArray[i];
        const rawVal = row[col];

        if (!rawVal) continue;

        const processRef = async (ref) => {
          if (!ref || ref.startsWith('http') || ref.startsWith('/images/placeholder-')) {
            return ref; // Skip empty, external HTTP links, or placeholder assets
          }

          totalReferencesChecked++;
          const targetPubId = getPublicIdForPath(ref);
          usedCloudinaryIds.add(targetPubId);

          const localFile = findLocalFile(ref);
          
          if (!localFile) {
            totalMissing++;
            console.log(`  ${COLORS.red}⚠ No local source file found for: ${ref}${COLORS.reset}`);
            return targetPubId; // Return target ID as fallback
          }

          const resType = getResourceType(localFile);
          const localSize = fs.statSync(localFile).size;
          const cloudAsset = cloudinaryAssets.get(targetPubId);

          let needUpload = false;
          if (!cloudAsset) {
            needUpload = true;
          } else if (cloudAsset.bytes !== localSize) {
            console.log(`  ${COLORS.yellow}Size mismatch for ${targetPubId} (Cloud: ${cloudAsset.bytes} B, Local: ${localSize} B). Re-uploading...${COLORS.reset}`);
            needUpload = true;
          }

          if (needUpload) {
            totalUploads++;
            if (isExecute) {
              try {
                console.log(`  ${COLORS.yellow}[↓] Uploading to Cloudinary: ${targetPubId}...${COLORS.reset}`);
                await uploadToCloudinary(localFile, targetPubId, resType);
                console.log(`  ${COLORS.green}✓ Uploaded successfully.${COLORS.reset}`);
              } catch (uploadErr) {
                console.error(`  ${COLORS.red}❌ Upload failed for ${targetPubId}: ${uploadErr.message}${COLORS.reset}`);
                totalUploads--;
                totalMissing++;
              }
            } else {
              console.log(`  ${COLORS.cyan}[Dry-Run] Would upload local file "${path.basename(localFile)}" to Cloudinary as public ID: ${targetPubId}${COLORS.reset}`);
            }
          } else {
            totalSkips++;
          }

          return targetPubId;
        };

        if (isArr) {
          const refs = Array.isArray(rawVal) ? rawVal : [];
          const updatedRefs = [];
          let changed = false;

          for (const ref of refs) {
            const newRef = await processRef(ref);
            updatedRefs.push(newRef);
            if (newRef !== ref) changed = true;
          }

          if (changed) {
            const updateFunc = async () => {
              if (isExecute) {
                await client.query(`UPDATE ${target.table} SET ${col} = $1 WHERE ${target.idCol} = $2`, [updatedRefs, idVal]);
                console.log(`  ${COLORS.green}✓ Updated database: ${target.table} (${idVal}) field [${col}] updated.${COLORS.reset}`);
              } else {
                console.log(`  ${COLORS.cyan}[Dry-Run] Would update DB: ${target.table} [${col}] for id "${idVal}" to array ${JSON.stringify(updatedRefs)}${COLORS.reset}`);
              }
            };
            dbUpdates.push(updateFunc);
          }
        } else {
          const newRef = await processRef(rawVal);
          if (newRef !== rawVal) {
            const updateFunc = async () => {
              if (isExecute) {
                await client.query(`UPDATE ${target.table} SET ${col} = $1 WHERE ${target.idCol} = $2`, [newRef, idVal]);
                console.log(`  ${COLORS.green}✓ Updated database: ${target.table} (${idVal}) field [${col}] updated to: ${newRef}${COLORS.reset}`);
              } else {
                console.log(`  ${COLORS.cyan}[Dry-Run] Would update DB: ${target.table} [${col}] for id "${idVal}" to: "${newRef}"${COLORS.reset}`);
              }
            };
            dbUpdates.push(updateFunc);
          }
        }
      }
    }
    console.log();
  }

  // Execute database updates
  if (dbUpdates.length > 0) {
    console.log(`${COLORS.bright}${COLORS.blue}--- Applying Database Updates ---${COLORS.reset}`);
    for (const update of dbUpdates) {
      await update();
    }
    console.log();
  } else {
    console.log(`${COLORS.gray}No database updates required.${COLORS.reset}\n`);
  }

  // Cleanup: Find and delete orphan assets
  console.log(`${COLORS.bright}${COLORS.blue}--- Scanning Cloudinary for Unused Assets ---${COLORS.reset}`);
  let totalOrphans = 0;
  let totalDeletedOrphans = 0;

  for (const [cloudId, asset] of cloudinaryAssets.entries()) {
    // Only process orphan assets belonging to the yash-electronics folder
    if (!cloudId.startsWith('yash-electronics/')) {
      continue;
    }

    if (!usedCloudinaryIds.has(cloudId)) {
      totalOrphans++;
      if (isExecute && isCleanup) {
        try {
          console.log(`  ${COLORS.red}[-] Deleting orphan asset from Cloudinary: ${cloudId} (${asset.resource_type})...${COLORS.reset}`);
          await deleteFromCloudinary(cloudId, asset.resource_type);
          totalDeletedOrphans++;
          console.log(`  ${COLORS.green}✓ Deleted successfully.${COLORS.reset}`);
        } catch (delErr) {
          console.error(`  ${COLORS.red}❌ Deletion failed for ${cloudId}: ${delErr.message}${COLORS.reset}`);
        }
      } else {
        console.log(`  ${COLORS.yellow}[Dry-Run] Orphan asset found on Cloudinary: ${cloudId} (${asset.resource_type}) [Size: ${asset.bytes} B]${COLORS.reset}`);
      }
    }
  }
  console.log();

  await client.end();
  console.log(`${COLORS.green}✓ Database connection closed.${COLORS.reset}\n`);

  // Final Summary
  console.log(`${COLORS.bright}${COLORS.cyan}==================================================${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.cyan}                 Sync Completed                   ${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.cyan}==================================================${COLORS.reset}`);
  console.log(`References Checked:           ${totalReferencesChecked}`);
  console.log(`Uploads Done/Required:        ${totalUploads}`);
  console.log(`Skips (Already on Cloudinary): ${totalSkips}`);
  console.log(`Missing Local Files:          ${totalMissing}`);
  console.log(`Database Updates Queue:       ${dbUpdates.length}`);
  console.log(`Orphan Assets Found:          ${totalOrphans}`);
  if (isCleanup) {
    console.log(`Orphan Assets Deleted:        ${totalDeletedOrphans}`);
  }
  console.log(`${COLORS.bright}${COLORS.cyan}==================================================${COLORS.reset}\n`);
}

runSync().catch(async (err) => {
  console.error(`\n${COLORS.red}Fatal execution error: ${err.message}${COLORS.reset}`);
  process.exit(1);
});
