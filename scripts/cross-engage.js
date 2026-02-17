const { TwitterApi } = require('twitter-api-v2');

const tweetId = '2008789994488705191';

// Onde account
const ondeClient = new TwitterApi({
  appKey: 'N16qZGtUOfcKM7zCjGWPWjgy7',
  appSecret: '9eO49J3ASEqjJO3Yz1aSNOujQFNN1fadESCw9dygLGjSWY7cSj',
  accessToken: '2008309220731650048-avL8aeGhkYDw19Ltv1Ot31dJQzXY90',
  accessSecret: 'XYFCdgowfc6qp5Slcm3qB7QYkODuEXIfPHKnNUVRKhxoB',
});

// FreeRiverHouse account
const frhClient = new TwitterApi({
  appKey: 'TSW4g8vY775SFi6FB8rmE5Ilp',
  appSecret: '3S0jM1AalTzu1a5GXLJvhNdtJO2k2FyRM6cbdCQX70l1foIEDK',
  accessToken: '2008256558309011456-Cv3gm6Bgr1fvg7NaKEHOCxAKvDeBIU',
  accessSecret: '1LMFLKdNYBpm5IfPWVGKJzWhKzazKSa3kwIUIbxXpZyXk',
});

async function crossEngage() {
  try {
    // Get user IDs first
    const ondeMe = await ondeClient.v2.me();
    const frhMe = await frhClient.v2.me();

    console.log('Onde user:', ondeMe.data.username);
    console.log('FRH user:', frhMe.data.username);

    // Like from Onde
    console.log('Adding like from @Onde_FRH...');
    await ondeClient.v2.like(ondeMe.data.id, tweetId);
    console.log('Onde liked!');

    // Like from FreeRiverHouse
    console.log('Adding like from @FreeRiverHouse...');
    await frhClient.v2.like(frhMe.data.id, tweetId);
    console.log('FRH liked!');

    console.log('\nCross-engagement complete!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

crossEngage();
