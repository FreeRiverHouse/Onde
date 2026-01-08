const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function regenChapter8() {
    console.log('Rigenerazione capitolo 8...');
    
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.goto('https://x.com/i/grok', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    
    // Il prompt tradizionale italiano - due bambini maschi italiani
    const prompt = `Children's book illustration in painterly watercolor style, two Italian boys aged 6 in schoolyard, one boy Leo with light brown wavy hair whispering a secret to his friend Tommaso with dark hair, both wearing classic European children's clothes, warm friendly atmosphere, rich saturated colors but elegant composition, soft brushwork texture, warm golden light, natural complexion without rosy cheeks, contemporary European storybook aesthetic, whimsical but refined, traditional Italian childhood scene, 4k`;
    
    console.log('Prompt:', prompt);
    console.log('Vai su Grok e genera manualmente con questo prompt');
    
    await page.waitForTimeout(60000); // aspetta 1 minuto
    await browser.close();
}

regenChapter8();
