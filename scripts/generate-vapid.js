import webPush from 'web-push';

console.log('Generating VAPID keys...');
const vapidKeys = webPush.generateVAPIDKeys();

console.log('\n==================================================');
console.log('COPY THESE KEYS TO YOUR .env FILE:');
console.log('==================================================\n');
console.log(`PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
console.log('\n==================================================\n');
