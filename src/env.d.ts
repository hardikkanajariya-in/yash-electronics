/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_CLOUDINARY_CLOUD_NAME: string;
  readonly DATABASE_URL: string;
  readonly USE_MOCK_DATA: string;
  readonly PUBLIC_VAPID_PUBLIC_KEY: string;
  readonly VAPID_PRIVATE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
