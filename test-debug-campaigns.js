async function testDebugCampaigns() {
  try {
    const productionUrl = 'https://admin.iconicdigital.site';
    const debugUrl = `${productionUrl}/api/debug-campaigns`;
    
    console.log('🔍 Testing Debug Campaigns Endpoint...');
    console.log('URL:', debugUrl);
    
    const response = await fetch(debugUrl);
    console.log('📊 Response status:', response.status);
    
    const data = await response.json();
    console.log('📊 Debug response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.totalCampaigns > 0) {
      console.log('✅ Campaigns found in production!');
      console.log(`📋 Total campaigns: ${data.totalCampaigns}`);
      console.log('📋 Sample campaigns:', data.sampleCampaigns.length);
    } else {
      console.log('❌ No campaigns found or error occurred');
    }
    
  } catch (error) {
    console.error('❌ Error testing debug endpoint:', error.message);
  }
}

testDebugCampaigns();
