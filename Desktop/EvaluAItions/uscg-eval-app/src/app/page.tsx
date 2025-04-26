'use client';

import { useState } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import BulletEditor from '@/components/bullets/BulletEditor';
import OERPreview from '@/components/oer/OERPreview';
import RankSelector from '@/components/ui/RankSelector';

interface Bullet {
  id: string;
  competency: string;
  content: string;
  isApplied: boolean;
  category: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat');
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [rankCategory, setRankCategory] = useState('Officer');
  const [rank, setRank] = useState('O3');
  const defaultOfficerRank = "O1"; 
  const defaultEnlistedRank = "E4";

  const handleRankCategoryChange = (newCategory: string) => {
    setRankCategory(newCategory);
    // Set the default rank for the NEW category
    if (newCategory === 'Officer') {
      setRank(defaultOfficerRank);
    } else {
      setRank(defaultEnlistedRank);
    }
  };
  
  // Function to add a bullet from the chat interface to the bullet editor
  const handleBulletGenerated = (newBullet: Bullet) => {
    setBullets(prev => [...prev, newBullet]);
    // Optionally switch to bullets tab after generation
    setActiveTab('bullets');
  };
  
  // Function to handle changes to bullets from the BulletEditor
  const handleBulletsChanged = (updatedBullets: Bullet[]) => {
    setBullets(updatedBullets);
  };

  // Get the appropriate evaluation title based on rank category
  const getEvaluationTitle = () => {
    return rankCategory === 'Officer' ? 'Officer Evaluation Report' : 'Enlisted Evaluation Report';
  };

  // Get the appropriate preview tab label based on rank category
  const getPreviewTabLabel = () => {
    return rankCategory === 'Officer' ? 'OER Preview' : 'Evaluation Preview';
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          USCG {getEvaluationTitle()} Generator
        </h1>
        
        <div className="mb-6">
      <RankSelector
        selectedRankCategory={rankCategory}
        selectedRank={rank}
        onRankCategoryChange={handleRankCategoryChange}
        onRankChange={setRank}
      />
    </div>
        
        <div className="mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 ${
                activeTab === 'chat'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              Generate Bullets
            </button>
            <button
              onClick={() => setActiveTab('bullets')}
              className={`px-4 py-2 ${
                activeTab === 'bullets'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              Manage Bullets
            </button>
            <button
              onClick={() => setActiveTab('oer')}
              className={`px-4 py-2 ${
                activeTab === 'oer'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              {getPreviewTabLabel()}
            </button>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          {activeTab === 'chat' && <ChatInterface onBulletGenerated={handleBulletGenerated} rankCategory={rankCategory} rank={rank} />}
          {activeTab === 'bullets' && <BulletEditor initialBullets={bullets} onBulletsChanged={handleBulletsChanged} />}
          {activeTab === 'oer' && <OERPreview bullets={bullets} rankCategory={rankCategory} rank={rank} />}
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>USCG {getEvaluationTitle()} Generator</p>
          <p>This application helps generate performance bullets based on achievements and creates {rankCategory === 'Officer' ? 'Officer' : 'Enlisted'} Evaluation Reports.</p>
        </div>
      </div>
    </main>
  );
}
