/**
 * Deprecated: use `npm run sync:cj` (scripts/sync-cj.js).
 * This shim exists so old docs/commands keep working without
 * hardcoded credentials — all secrets come from env.
 */
console.log('sync_cj.js is deprecated — delegating to scripts/sync-cj.js…');
require('./scripts/sync-cj.js');
