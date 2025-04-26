import { NextRequest, NextResponse } from 'next/server';

// Define the structure of a single bullet object
interface Bullet {
  id?: string;
  isApplied: boolean;
  category: string;
  competency: string;
  content: string;
}

// Define the structure of the incoming request body
interface OerRequestBody {
  officerName: string; // Keep generic name, label will change based on category
  markingPeriodStart: string | Date;
  markingPeriodEnd: string | Date;
  bullets: Bullet[];
  rankCategory: string; // Added
  rank: string;         // Added
  unitName?: string;     // Make optional if not always needed
  employeeId?: string;   // Make optional if not always needed
}

// Helper function to get Enlisted Report Titles
function getEnlistedReportTitle(rank: string): string {
  const rankTitles: Record<string, string> = {
    'E4': 'Third Class Petty Officer Evaluation Report',
    'E5': 'Second Class Petty Officer Evaluation Report',
    'E6': 'First Class Petty Officer Evaluation Report',
    'E7': 'Chief Petty Officer Evaluation Report',
    'E8': 'Senior Chief Petty Officer Evaluation Report',
  };
  return rankTitles[rank] || 'Enlisted Evaluation Report'; // Fallback title
}

// Helper function to render a section of bullets
function renderBulletSection(title: string, bullets: Bullet[]): string {
  if (bullets.length === 0) {
    return `
      <div class="section">
        <div class="section-title">${title.toUpperCase()}</div>
        <p>No bullets applied to this section.</p>
      </div>
    `;
  }
  return `
    <div class="section">
      <div class="section-title">${title.toUpperCase()}</div>
      ${bullets.map((bullet) => `
        <div class="competency">
          <div class="competency-title">${bullet.competency}</div>
          <div class="bullet">${bullet.content}</div>
        </div>
      `).join('')}
    </div>
  `;
}

export async function POST(request: NextRequest) {
  try {
    // Destructure request body, including rank info
    const {
      officerName, // Using this variable name for both Officer/Member Name
      markingPeriodStart,
      markingPeriodEnd,
      bullets,
      rankCategory,
      rank,
      // unitName, // Add if needed in header
      // employeeId, // Add if needed in header
    } = await request.json() as OerRequestBody;

    // --- Input Validation ---
    if (!officerName || !markingPeriodStart || !markingPeriodEnd || !Array.isArray(bullets) || !rankCategory || !rank) {
      return NextResponse.json(
        { error: 'Missing required fields (Name, Dates, Bullets, Rank Info)', success: false },
        { status: 400 }
      );
    }
    // --- End Validation ---

    // Filter bullets that are marked as applied
    const appliedBullets = bullets.filter((bullet) => bullet.isApplied);

    // --- Generate HTML content conditionally ---
    let htmlContent = '';
    let reportTitle = '';
    let nameLabel = '';

    // Common styles can be kept outside the conditional logic
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 8.5in; margin: 0 auto; padding: 0.5in; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .section { margin-bottom: 20px; }
        .section-title { font-weight: bold; font-size: 14pt; margin-bottom: 10px; border-bottom: 1px solid #000; text-transform: uppercase; }
        .competency { margin-bottom: 15px; }
        .competency-title { font-weight: bold; font-size: 12pt; margin-bottom: 5px; }
        .bullet { margin-bottom: 10px; padding-left: 20px; }
        .footer { margin-top: 30px; text-align: center; font-size: 10pt; color: #666; }
        @media print { body { padding: 0; } @page { margin: 0.5in; } }
      </style>
    `;

    if (rankCategory === 'Officer') {
      reportTitle = 'Officer Evaluation Report';
      nameLabel = 'Officer Name';

      // Filter bullets for Officer categories
      const performanceBullets = appliedBullets.filter((b) => b.category === 'Performance of Duties');
      const leadershipBullets = appliedBullets.filter((b) => b.category === 'Leadership Skills');
      const personalBullets = appliedBullets.filter((b) => b.category === 'Personal and Professional Qualities');

      htmlContent = `
        ${renderBulletSection('Performance of Duties', performanceBullets)}
        ${renderBulletSection('Leadership Skills', leadershipBullets)}
        ${renderBulletSection('Personal and Professional Qualities', personalBullets)}
      `;

    } else { // Enlisted
      reportTitle = getEnlistedReportTitle(rank);
      nameLabel = 'Member Name';

      // Filter bullets for Enlisted categories (Uncommented now)
      const militaryBullets = appliedBullets.filter((b) => b.category === 'Military');
      const enlistedPerformanceBullets = appliedBullets.filter((b) => b.category === 'Performance');
      const professionalQualitiesBullets = appliedBullets.filter((b) => b.category === 'Professional Qualities');
      const enlistedLeadershipBullets = appliedBullets.filter((b) => b.category === 'Leadership');

      htmlContent = `
        ${renderBulletSection('Military', militaryBullets)}
        ${renderBulletSection('Performance', enlistedPerformanceBullets)}
        ${renderBulletSection('Professional Qualities', professionalQualitiesBullets)}
        ${renderBulletSection('Leadership', enlistedLeadershipBullets)}
      `;
    }

    // Combine structure with content
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportTitle}</title>
        ${styles}
      </head>
      <body>
        <div class="header">
          <h1>UNITED STATES COAST GUARD</h1>
          <h2>${reportTitle.toUpperCase()}</h2>
          <p>
            <strong>${nameLabel}:</strong> ${officerName}<br>
            {/* Add other header info like Unit, ID if needed */}
            <strong>Marking Period:</strong> ${new Date(markingPeriodStart).toLocaleDateString()} to ${new Date(markingPeriodEnd).toLocaleDateString()}
          </p>
        </div>

        ${htmlContent} {/* Insert the conditionally generated sections */}

        <div class="footer">
          <p>Generated by USCG Evaluation Report Generator</p>
          <p>Date Generated: ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
      `;

    // Create a Blob with the full HTML content
    const encoder = new TextEncoder();
    const htmlBytes = encoder.encode(fullHtml);

    // Generate dynamic filename
    const filePrefix = rankCategory === 'Officer' ? 'OER' : `EER_${rank}`;
    const safeName = officerName.replace(/[^a-zA-Z0-9]/g, '_'); // Make filename safer
    const dateSuffix = new Date().toISOString().split('T')[0];
    const fileName = `${filePrefix}_${safeName}_${dateSuffix}.pdf`;

    // Return the HTML content with PDF headers to trigger download
    const response = new NextResponse(htmlBytes);
    response.headers.set('Content-Type', 'application/pdf'); // Still sending HTML, pretending it's PDF
    response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

    return response;

  } catch (error) {
    console.error('Error generating evaluation report:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON payload received', success: false }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    );
  }
}