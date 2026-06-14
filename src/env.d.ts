/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_CLOUDINARY_CLOUD_NAME: string;
  readonly SHEETS_API_URL: string;
  readonly SHEETS_API_KEY: string;
  readonly USE_MOCK_DATA: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
