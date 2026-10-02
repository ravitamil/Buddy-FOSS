const { withMainActivity } = require('expo/config-plugins');

/**
 * Expo Config Plugin: Fix IllegalStateException with react-native-screens
 * 
 * This plugin modifies MainActivity.kt to prevent screen fragment restoration
 * that causes IllegalStateException on Android with the New Architecture (Fabric).
 * 
 * Two fixes are applied:
 * 1. Pass null to super.onCreate() instead of savedInstanceState
 * 2. Set RNScreensFragmentFactory on the FragmentManager
 * 
 * Error being fixed:
 * java.lang.IllegalStateException: addViewAt: failed to insert view
 * 
 * Reference: https://github.com/software-mansion/react-native-screens
 */

function withMainActivityFragmentFix(config) {
    return withMainActivity(config, async (config) => {
        const mainActivity = config.modResults;
        let contents = mainActivity.contents;

        // Check if the fixes are already applied
        const hasSavedInstanceStateFix = contents.includes('super.onCreate(null)');
        const hasFragmentFactoryFix = contents.includes('RNScreensFragmentFactory');

        if (hasSavedInstanceStateFix && hasFragmentFactoryFix) {
            console.log('[withMainActivityFragmentFix] All fixes already applied');
            return config;
        }

        // Add import for RNScreensFragmentFactory if not present
        if (!hasFragmentFactoryFix) {
            const importStatement = 'import com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory';

            // Find the package line and add import after it
            const packageLineMatch = contents.match(/^package .+$/m);
            if (packageLineMatch) {
                const insertPosition = packageLineMatch.index + packageLineMatch[0].length;
                contents = contents.slice(0, insertPosition) + '\n\n' + importStatement + contents.slice(insertPosition);
            }
        }

        // Fix 1: Replace super.onCreate(savedInstanceState) with super.onCreate(null)
        if (!hasSavedInstanceStateFix) {
            // Handle Kotlin pattern
            contents = contents.replace(
                /super\.onCreate\(savedInstanceState\)/g,
                'super.onCreate(null)'
            );
        }

        // Fix 2: Add FragmentFactory setup before super.onCreate
        if (!hasFragmentFactoryFix) {
            // Look for the super.onCreate(null) line and add FragmentFactory setup before it
            const superOnCreatePattern = /(\s*)(super\.onCreate\(null\))/;
            const match = contents.match(superOnCreatePattern);

            if (match) {
                const indentation = match[1];
                const fragmentFactoryCode = `${indentation}// Prevent fragment restoration crashes with react-native-screens\n${indentation}supportFragmentManager.fragmentFactory = RNScreensFragmentFactory()\n`;
                contents = contents.replace(
                    superOnCreatePattern,
                    fragmentFactoryCode + match[0]
                );
            }
        }

        mainActivity.contents = contents;
        console.log('[withMainActivityFragmentFix] Applied fragment factory fix');

        return config;
    });
}

module.exports = withMainActivityFragmentFix;
