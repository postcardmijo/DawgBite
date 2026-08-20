const { withProjectBuildGradle } = require('expo/config-plugins');

const withForcedPlayServicesAds = (config) => {
  return withProjectBuildGradle(config, (modConfig) => {
    if (modConfig.modResults.contents.includes('com.google.android.gms:play-services-ads:23.6.0')) {
      return modConfig;
    }
    const forceResolution = `
allprojects {
    configurations.all {
        resolutionStrategy {
            force 'com.google.android.gms:play-services-ads:23.6.0'
        }
    }
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions {
            freeCompilerArgs += ["-Xskip-metadata-version-check"]
        }
    }
}
`;
    modConfig.modResults.contents += forceResolution;
    return modConfig;
  });
};

module.exports = withForcedPlayServicesAds;
