const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const fs = require('fs');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

// Path to our empty module
const emptyModulePath = path.resolve(__dirname, 'empty-module.js');

// Create empty module if it doesn't exist
if (!fs.existsSync(emptyModulePath)) {
  fs.writeFileSync(emptyModulePath, 'module.exports = {};');
}

const config = {
  resolver: {
    // Redirect web modules to our empty module
    extraNodeModules: {
      'react-dom': emptyModulePath,
      'react-dom/server': emptyModulePath,
      '@react-aria/ssr': emptyModulePath,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
