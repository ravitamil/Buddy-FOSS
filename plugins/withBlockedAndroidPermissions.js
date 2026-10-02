const {AndroidConfig, withAndroidManifest} = require('expo/config-plugins');

const FORBIDDEN_PERMISSIONS = new Set([
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.WRITE_CONTACTS',
  'android.permission.RECORD_AUDIO',
]);

function withBlockedAndroidPermissions(config) {
  return withAndroidManifest(config, (androidConfig) => {
    const manifestDocument = androidConfig.modResults;
    AndroidConfig.Permissions.removePermissions(
      manifestDocument,
      Array.from(FORBIDDEN_PERMISSIONS),
    );
    AndroidConfig.Manifest.ensureToolsAvailable(manifestDocument);
    AndroidConfig.Permissions.addBlockedPermissions(
      manifestDocument,
      Array.from(FORBIDDEN_PERMISSIONS),
    );

    const application = manifestDocument.manifest.application?.[0];
    if (application?.$) {
      delete application.$['android:requestLegacyExternalStorage'];
    }

    return androidConfig;
  });
}

module.exports = withBlockedAndroidPermissions;
