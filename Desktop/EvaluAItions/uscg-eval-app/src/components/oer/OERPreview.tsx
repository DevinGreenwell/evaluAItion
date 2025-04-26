'use client';

import { useState } from 'react';

interface Bullet {
  id: string;
  competency: string;
  content: string;
  isApplied: boolean;
  category: string;
}

interface OERPreviewProps {
  bullets?: Bullet[];
  rankCategory?: string;
  rank?: string;
}

export default function OERPreview({ bullets = [], rankCategory = 'Officer', rank = 'O3' }: OERPreviewProps) {
  const [evaluationData, setEvaluationData] = useState({
    markingPeriodStart: '',
    markingPeriodEnd: '',
    memberName: '',
    unitName: '',
    employeeId: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReportUrl, setGeneratedReportUrl] = useState<string | null>(null);

  // Filter bullets that are marked as applied
  const appliedBullets = bullets.filter(bullet => bullet.isApplied);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEvaluationData({
      ...evaluationData,
      [name]: value
    });
  };

  const generateReport = async () => {
    if (!evaluationData.memberName || !evaluationData.markingPeriodStart || !evaluationData.markingPeriodEnd) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/oer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberName: evaluationData.memberName,
          unitName: evaluationData.unitName,
          employeeId: evaluationData.employeeId,
          markingPeriodStart: evaluationData.markingPeriodStart,
          markingPeriodEnd: evaluationData.markingPeriodEnd,
          bullets: appliedBullets,
          rankCategory: rankCategory,
          rank: rank
        }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setGeneratedReportUrl(url);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      const fileName = rankCategory === 'Officer' 
        ? `OER_${evaluationData.memberName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
        : `EER_${rank}_${evaluationData.memberName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('An error occurred while generating the evaluation report');
    } finally {
      setIsGenerating(false);
    }
  };

  // Get the title based on rank category
  const getReportTitle = () => {
    if (rankCategory === 'Officer') {
      return 'Officer Evaluation Report';
    } else {
      const rankTitles: Record<string, string> = {
        'E4': 'Third Class Petty Officer Evaluation Report',
        'E5': 'Second Class Petty Officer Evaluation Report',
        'E6': 'First Class Petty Officer Evaluation Report',
        'E7': 'Chief Petty Officer Evaluation Report',
        'E8': 'Senior Chief Petty Officer Evaluation Report'
      };
      return rankTitles[rank] || 'Enlisted Evaluation Report';
    }
  };

  // Get the appropriate sections based on rank category
  const renderSections = () => {
    if (rankCategory === 'Officer') {
      return (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Performance of Duties</h3>
            {appliedBullets.filter(b => b.category === 'Performance of Duties').length > 0 ? (
              <div className="space-y-3">
                {appliedBullets
                  .filter(b => b.category === 'Performance of Duties')
                  .map((bullet) => (
                    <div key={bullet.id} className="p-3 border rounded-md bg-gray-50">
                      <div className="text-sm text-gray-500 mb-1">{bullet.competency}</div>
                      <div>{bullet.content}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-gray-500 italic p-3 border rounded-md">
                No bullets applied to this section yet. Use the Bullet Editor to apply bullets.
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Leadership Skills</h3>
            {appliedBullets.filter(b => b.category === 'Leadership Skills').length > 0 ? (
              <div className="space-y-3">
                {appliedBullets
                  .filter(b => b.category === 'Leadership Skills')
                  .map((bullet) => (
                    <div key={bullet.id} className="p-3 border rounded-md bg-gray-50">
                      <div className="text-sm text-gray-500 mb-1">{bullet.competency}</div>
                      <div>{bullet.content}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-gray-500 italic p-3 border rounded-md">
                No bullets applied to this section yet. Use the Bullet Editor to apply bullets.
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Personal and Professional Qualities</h3>
            {appliedBullets.filter(b => b.category === 'Personal and Professional Qualities').length > 0 ? (
              <div className="space-y-3">
                {appliedBullets
                  .filter(b => b.category === 'Personal and Professional Qualities')
                  .map((bullet) => (
                    <div key={bullet.id} className="p-3 border rounded-md bg-gray-50">
                      <div className="text-sm text-gray-500 mb-1">{bullet.competency}</div>
                      <div>{bullet.content}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-gray-500 italic p-3 border rounded-md">
                No bullets applied to this section yet. Use the Bullet Editor to apply bullets.
              </div>
            )}
          </div>
        </>
      );
    } else {
      // Enlisted evaluation sections
      return (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Military</h3>
            {appliedBullets.filter(b => b.category === 'Military').length > 0 ? (
              <div className="space-y-3">
                {appliedBullets
                  .filter(b => b.category === 'Military')
                  .map((bullet) => (
                    <div key={bullet.id} className="p-3 border rounded-md bg-gray-50">
                      <div className="text-sm text-gray-500 mb-1">{bullet.competency}</div>
                      <div>{bullet.content}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-gray-500 italic p-3 border rounded-md">
                No bullets applied to this section yet. Use the Bullet Editor to apply bullets.
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Performance</h3>
            {appliedBullets.filter(b => b.category === 'Performance').length > 0 ? (
              <div className="space-y-3">
                {appliedBullets
                  .filter(b => b.category === 'Performance')
                  .map((bullet) => (
                    <div key={bullet.id} className="p-3 border rounded-md bg-gray-50">
                      <div className="text-sm text-gray-500 mb-1">{bullet.competency}</div>
                      <div>{bullet.content}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-gray-500 italic p-3 border rounded-md">
                No bullets applied to this section yet. Use the Bullet Editor to apply bullets.
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Professional Qualities</h3>
            {appliedBullets.filter(b => b.category === 'Professional Qualities').length > 0 ? (
              <div className="space-y-3">
                {appliedBullets
                  .filter(b => b.category === 'Professional Qualities')
                  .map((bullet) => (
                    <div key={bullet.id} className="p-3 border rounded-md bg-gray-50">
                      <div className="text-sm text-gray-500 mb-1">{bullet.competency}</div>
                      <div>{bullet.content}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-gray-500 italic p-3 border rounded-md">
                No bullets applied to this section yet. Use the Bullet Editor to apply bullets.
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Leadership</h3>
            {appliedBullets.filter(b => b.category === 'Leadership').length > 0 ? (
              <div className="space-y-3">
                {appliedBullets
                  .filter(b => b.category === 'Leadership')
                  .map((bullet) => (
                    <div key={bullet.id} className="p-3 border rounded-md bg-gray-50">
                      <div className="text-sm text-gray-500 mb-1">{bullet.competency}</div>
                      <div>{bullet.content}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-gray-500 italic p-3 border rounded-md">
                No bullets applied to this section yet. Use the Bullet Editor to apply bullets.
              </div>
            )}
          </div>
        </>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">{getReportTitle()}</h2>
      
      <div className="bg-white border rounded-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="memberName" className="block text-sm font-medium mb-1">
              {rankCategory === 'Officer' ? 'Officer' : 'Member'} Name: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="memberName"
              name="memberName"
              value={evaluationData.memberName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="unitName" className="block text-sm font-medium mb-1">
              Unit Name:
            </label>
            <input
              type="text"
              id="unitName"
              name="unitName"
              value={evaluationData.unitName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium mb-1">
              Employee ID:
            </label>
            <input
              type="text"
              id="employeeId"
              name="employeeId"
              value={evaluationData.employeeId}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="markingPeriodStart" className="block text-sm font-medium mb-1">
                Marking Period Start: <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="markingPeriodStart"
                name="markingPeriodStart"
                value={evaluationData.markingPeriodStart}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="markingPeriodEnd" className="block text-sm font-medium mb-1">
                Marking Period End: <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="markingPeriodEnd"
                name="markingPeriodEnd"
                value={evaluationData.markingPeriodEnd}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>
        </div>

        {renderSections()}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {appliedBullets.length === 0 ? (
            <span className="text-yellow-600">No bullets have been applied to the evaluation report yet.</span>
          ) : (
            <span>{appliedBullets.length} bullet{appliedBullets.length !== 1 ? 's' : ''} applied to evaluation report</span>
          )}
        </div>
        <div className="flex space-x-3">
          {generatedReportUrl && (
            <a 
              href={generatedReportUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Download Report
            </a>
          )}
          <button
            onClick={generateReport}
            disabled={isGenerating || appliedBullets.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
          >
            {isGenerating ? 'Generating...' : `Generate ${rankCategory === 'Officer' ? 'OER' : 'Evaluation'} Document`}
          </button>
        </div>
      </div>
    </div>
  );
}
