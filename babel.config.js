module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        blocklist: null,
        allowlist: null,
        safe: false,
        allowUndefined: true,
        verbose: false
      }]
    ]
  };
};