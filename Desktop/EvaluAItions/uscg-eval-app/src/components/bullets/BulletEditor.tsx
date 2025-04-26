'use client';

import { useState } from 'react';

interface Bullet {
  id: string;
  competency: string;
  content: string;
  isApplied: boolean;
  category: string;
}

interface BulletEditorProps {
  initialBullets?: Bullet[];
  onBulletsChanged?: (bullets: Bullet[]) => void;
}

export default function BulletEditor({ initialBullets = [], onBulletsChanged }: BulletEditorProps) {
  const [bullets, setBullets] = useState<Bullet[]>(initialBullets);
  const [editingBullet, setEditingBullet] = useState<Bullet | null>(null);
  const [editContent, setEditContent] = useState('');

  // Group bullets by competency category
  const groupedBullets = bullets.reduce((groups, bullet) => {
    const category = bullet.category || getCategoryFromCompetency(bullet.competency);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(bullet);
    return groups;
  }, {} as Record<string, Bullet[]>);

  function getCategoryFromCompetency(competency: string): string {
    const performanceDuties = [
      'Planning & Preparedness', 'Using Resources', 'Results/Effectiveness', 
      'Adaptability', 'Professional Competence', 'Speaking and Listening', 'Writing'
    ];
    
    const leadershipSkills = [
      'Looking Out For Others', 'Developing Others', 'Directing Others', 
      'Teamwork', 'Workplace Climate', 'Evaluations'
    ];
    
    const personalQualities = [
      'Initiative', 'Judgment', 'Responsibility', 
      'Professional Presence', 'Health and Well Being'
    ];
    
    if (performanceDuties.includes(competency)) return 'Performance of Duties';
    if (leadershipSkills.includes(competency)) return 'Leadership Skills';
    if (personalQualities.includes(competency)) return 'Personal and Professional Qualities';
    return 'Other';
  }

  const updateBullets = (newBullets: Bullet[]) => {
    setBullets(newBullets);
    if (onBulletsChanged) {
      onBulletsChanged(newBullets);
    }
  };

  const handleEditBullet = (bullet: Bullet) => {
    setEditingBullet(bullet);
    setEditContent(bullet.content);
  };

  const handleSaveEdit = () => {
    if (!editingBullet) return;
    
    const updatedBullets = bullets.map(bullet => 
      bullet.id === editingBullet.id 
        ? { ...bullet, content: editContent } 
        : bullet
    );
    
    updateBullets(updatedBullets);
    setEditingBullet(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingBullet(null);
    setEditContent('');
  };

  const handleDeleteBullet = (id: string) => {
    updateBullets(bullets.filter(bullet => bullet.id !== id));
  };

  const handleToggleApply = (id: string) => {
    updateBullets(bullets.map(bullet => 
      bullet.id === id 
        ? { ...bullet, isApplied: !bullet.isApplied } 
        : bullet
    ));
  };

  // This function can be called from the parent component to add a new bullet
  // const addBullet = (newBullet: Bullet) => {
  // updateBullets([...bullets, newBullet]);
  //};

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Performance Bullets</h2>
      
      {Object.keys(groupedBullets).length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-md">
          <p className="text-gray-500">No bullets yet. Use the chat interface to generate bullets.</p>
        </div>
      ) : (
        Object.entries(groupedBullets).map(([category, categoryBullets]) => (
          <div key={category} className="mb-6">
            <h3 className="text-lg font-semibold mb-2">{category}</h3>
            <div className="space-y-3">
              {categoryBullets.map(bullet => (
                <div 
                  key={bullet.id} 
                  className={`p-3 border rounded-md ${bullet.isApplied ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                >
                  {editingBullet?.id === bullet.id ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border rounded-md mb-2"
                        rows={3}
                      />
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={handleCancelEdit}
                          className="px-3 py-1 border rounded-md"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSaveEdit}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">{bullet.competency}</div>
                      <div className="mb-2">{bullet.content}</div>
                      <div className="flex justify-between">
                        <div>
                          <button 
                            onClick={() => handleToggleApply(bullet.id)}
                            className={`px-3 py-1 rounded-md mr-2 ${
                              bullet.isApplied 
                                ? 'bg-green-600 text-white' 
                                : 'border border-green-600 text-green-600'
                            }`}
                          >
                            {bullet.isApplied ? 'Applied' : 'Apply to OER'}
                          </button>
                        </div>
                        <div>
                          <button 
                            onClick={() => handleEditBullet(bullet)}
                            className="px-3 py-1 text-blue-600 mr-2"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteBullet(bullet.id)}
                            className="px-3 py-1 text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
