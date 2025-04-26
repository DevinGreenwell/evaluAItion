// --- START OF FULLY MODIFIED generate/route.ts ---
import { NextRequest, NextResponse } from 'next/server';
import { generateBullet } from '@/lib/openai'; // Assuming this path is correct

// Define the expected structure of the request body
interface GenerateRequestBody {
  achievement: string;
  competency: string;
  rankCategory?: string; // Optional if default is reliable
  rank?: string;         // Optional if default is reliable
}

export async function POST(request: NextRequest) {
  try {
    // Use type assertion to tell TypeScript the expected shape of the JSON body
    const body = await request.json() as GenerateRequestBody;

    // Now destructure from the typed 'body' object
    const { achievement, competency, rankCategory = 'Officer', rank = 'O3' } = body;

    // --- Input Validation (Recommended) ---
    if (!achievement || !competency) {
      return NextResponse.json(
        { error: 'Missing required fields: achievement and competency', success: false },
        { status: 400 }
      );
    }
    // --- End Validation ---

    // Use the OpenAI integration to generate a bullet
    const generatedBullet = await generateBullet({
      achievement,
      competency,
      rankCategory,
      rank
    });

    return NextResponse.json({
      bullet: generatedBullet,
      competency, // Sending back the competency might be useful for the client
      success: true
    });

  } catch (error) {
    console.error('Error generating bullet:', error);

    // More specific error handling
    if (error instanceof SyntaxError) { // Handle invalid JSON
        return NextResponse.json({ error: 'Invalid JSON payload received', success: false }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate bullet';
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    );
  }
}
// --- END OF FULLY MODIFIED generate/route.ts ---