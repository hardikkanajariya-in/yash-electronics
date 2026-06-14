/**
 * Yash Electronics — Google Apps Script API
 *
 * Setup:
 * 1. Create a Google Spreadsheet with sheets: Products, Categories, Brands, Offers, Settings
 * 2. Extensions → Apps Script → paste this file
 * 3. Set API_KEY in Script Properties (Project Settings → Script Properties)
 * 4. Deploy → New deployment → Web app → Execute as: Me → Anyone
 * 5. Copy the web app URL to SHEETS_API_URL in your .env
 */

const SHEET_NAMES = {
  PRODUCTS: 'Products',
  CATEGORIES: 'Categories',
  BRANDS: 'Brands',
  OFFERS: 'Offers',
  SETTINGS: 'Settings',
};

function doGet(e) {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
    if (apiKey && e.parameter.key !== apiKey) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const data = {
      settings: getSettings(),
      categories: getSheetData(SHEET_NAMES.CATEGORIES),
      brands: getSheetData(SHEET_NAMES.BRANDS),
      products: getSheetData(SHEET_NAMES.PRODUCTS),
      offers: getSheetData(SHEET_NAMES.OFFERS),
    };

    return jsonResponse(data);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

function getSettings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.SETTINGS);
  if (!sheet) return {};

  const data = sheet.getDataRange().getValues();
  const settings = {};

  for (let i = 1; i < data.length; i++) {
    const key = String(data[i][0]).trim();
    const value = data[i][1];
    if (key) settings[toCamelCase(key)] = value;
  }

  return settings;
}

function getSheetData(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0].map((h) => toCamelCase(String(h)));
  const rows = [];

  for (let i = 1; i < data.length; i++) {
    const row = {};
    let hasData = false;

    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      let value = data[i][j];

      if (header === 'images' && typeof value === 'string') {
        value = value.split('|').map((s) => s.trim()).filter(Boolean);
      }

      if (header === 'isActive' || header === 'isFeatured') {
        value = value === true || String(value).toLowerCase() === 'true' || value === 1;
      }

      if (header === 'mrp' || header === 'offerPrice' || header === 'sortOrder') {
        value = Number(value) || 0;
      }

      row[header] = value;
      if (value !== '' && value !== null && value !== undefined) hasData = true;
    }

    if (hasData) rows.push(row);
  }

  return rows;
}

function toCamelCase(str) {
  return str
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
    .replace(/\s/g, '')
    .replace(/^(.)/, (_, c) => c.toLowerCase());
}

function jsonResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
