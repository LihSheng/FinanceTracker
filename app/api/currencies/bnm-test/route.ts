import { NextResponse } from 'next/server';

function processResponse(data: any) {
  // Extract a few sample rates
  const sampleRates = data.data?.slice(0, 5).map((item: any) => ({
    currency: item.currency_code,
    unit: item.unit,
    middleRate: item.rate.middle_rate,
    date: item.rate.date,
  }));

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    meta: data.meta,
    sampleRates,
    totalCurrencies: data.data?.length || 0,
  });
}

/**
 * GET /api/currencies/bnm-test
 * Test endpoint to verify BNM API integration
 */
export async function GET() {
  try {
    // Test direct BNM API call with date parameter
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const url = `https://api.bnm.gov.my/public/exchange-rate/${today}`;
    
    console.log('Testing BNM API with URL:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      // Try without date
      const fallbackUrl = 'https://api.bnm.gov.my/public/exchange-rate';
      console.log('Trying fallback URL:', fallbackUrl);
      const fallbackResponse = await fetch(fallbackUrl);
      
      if (!fallbackResponse.ok) {
        return NextResponse.json({
          success: false,
          error: `BNM API returned status ${fallbackResponse.status}`,
          statusText: fallbackResponse.statusText,
          triedUrls: [url, fallbackUrl],
        });
      }
      
      const data = await fallbackResponse.json();
      return processResponse(data);
    }

    const data = await response.json();
    return processResponse(data);
  } catch (error: any) {
    console.error('Error testing BNM API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test BNM API',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
