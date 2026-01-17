import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    // Server-side can access both NEXT_PUBLIC_ and regular env vars
    const apiKey = process.env.NEXT_PUBLIC_SARVAM_API_KEY || process.env.SARVAM_API_KEY;

    if (!apiKey) {
      console.error('Sarvam API key not found in environment variables');
      return NextResponse.json(
        { error: 'API key not configured', success: false },
        { status: 200 }
      );
    }

    try {
      // Use Sarvam API
      const response = await fetch('https://api.sarvam.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          model: 'sarvam-m',
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error('Sarvam API error:', errorData);
        return NextResponse.json(
          { error: errorData.error || 'API request failed', success: false },
          { status: 200 }
        );
      }

      const data = await response.json();
      
      // Extract the response text from Sarvam's format
      let text = '';
      if (data.choices && data.choices[0] && data.choices[0].message) {
        text = data.choices[0].message.content;
      } else if (data.content) {
        text = data.content;
      } else {
        console.error('Unexpected Sarvam API response format:', data);
        return NextResponse.json(
          { error: 'Unexpected API response format', success: false },
          { status: 200 }
        );
      }

      return NextResponse.json({ success: true, data: { generated_text: text } });
    } catch (error: any) {
      console.error('Sarvam API request error:', error);
      return NextResponse.json(
        { error: error.message || 'API request failed', success: false },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error', success: false },
      { status: 200 }
    );
  }
}
