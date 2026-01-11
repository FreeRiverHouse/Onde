// Test React Native Web App
const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('🚀 Starting React Native Web Test...');
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set user agent to iPhone
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
    
    // Set viewport to iPhone size
    await page.setViewport({ width: 375, height: 667 });
    
    console.log('📱 Loading app...');
    await page.goto('http://localhost:19006', { waitUntil: 'networkidle2' });
    
    // Wait for app to load
    await page.waitForTimeout(5000);
    
    // Check if app loaded
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Check for main elements using XPath
    const hasTitle = await page.$x('//text()[contains(., "FreeRiver Flow")]');
    const hasButton = await page.$('button');
    const hasStatus = await page.$('text');
    
    console.log('🔍 UI Elements Check:');
    console.log('  ✅ Title found:', hasTitle.length > 0);
    console.log('  ✅ Button found:', !!hasButton);
    console.log('  ✅ Text elements found:', !!hasStatus);
    
    // Get page content
    const content = await page.content();
    console.log('📄 Page content length:', content.length);
    
    // Check for React Native elements
    const hasReactNative = content.includes('react-native-web');
    const hasExpo = content.includes('expo');
    console.log('🔧 Framework Check:');
    console.log('  ✅ React Native Web:', hasReactNative);
    console.log('  ✅ Expo:', hasExpo);
    
    // Take screenshot
    await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved');
    
    await browser.close();
    console.log('✅ Web test completed');
    
  } catch (error) {
    console.log('❌ Web test error:', error.message);
  }
})();
