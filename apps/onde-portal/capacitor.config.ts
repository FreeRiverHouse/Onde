import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.onde.arcadegames',
  appName: 'Onde Arcade Games',
  webDir: 'out-arcade',
  server: {
    // Use local files, no server needed
    androidScheme: 'https',
  },
  ios: {
    // iPad optimized
    preferredContentMode: 'mobile',
    scheme: 'Onde Arcade Games',
    backgroundColor: '#030712', // gray-950 to match arcade theme
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#030712',
      showSpinner: false,
    },
  },
}

export default config
