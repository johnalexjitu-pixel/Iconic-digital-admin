async function testProductionCampaigns() {
  try {
    const customerId = '68e68e95833ae76a67f4ca88';
    const productionUrl = 'https://admin.iconicdigital.site';
    const apiUrl = `${productionUrl}/api/frontend/customer-tasks/${customerId}`;
    
    console.log('🔍 Testing Production Customer Tasks API...');
    console.log('URL:', apiUrl);
    
    const response = await fetch(apiUrl);
    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('📊 Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data && data.data.length > 0) {
      console.log('✅ Production API working!');
      console.log(`📋 Total campaigns: ${data.total}`);
      console.log('📋 First campaign sample:', data.data[0]);
      console.log('📋 All campaigns preview:');
      data.data.slice(0, 5).forEach((task, index) => {
        console.log(`  ${index + 1}. Task ${task.taskNumber}: ${task.taskPrice} - ${task.status}`);
      });
    } else {
      console.log('❌ No campaigns found in production');
      console.log('📊 Data structure:', {
        success: data.success,
        dataLength: data.data?.length,
        total: data.total
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing production API:', error.message);
  }
}

testProductionCampaigns();
