const { withProjectBuildGradle } = require('expo/config-plugins');

const withForcedPlayServicesAds = (config) => {
  return withProjectBuildGradle(config, (modConfig) => {
    if (modConfig.modResults.contents.includes('-Xskip-metadata-version-check')) {
      return modConfig;
    }
    const compilerOpts = `
allprojects {
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions {
            freeCompilerArgs += ["-Xskip-metadata-version-check"]
        }
    }
}
`;
    modConfig.modResults.contents += compilerOpts;
    return modConfig;
  });
};

module.exports = withForcedPlayServicesAds;
