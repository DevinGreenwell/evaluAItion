'use client';

import { useState, useRef } from 'react';
import { useMobileDetection } from '@/hooks/use-mobile';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  competency?: string;
}

interface BulletData {
  id: string;
  competency: string;
  content: string;
  isApplied: boolean;
  category: string;
}

interface ChatInterfaceProps {
  onBulletGenerated?: (bullet: BulletData) => void;
  rankCategory?: string;
  rank?: string;
}

export default function ChatInterface({ 
  onBulletGenerated, 
  rankCategory = 'Officer', 
  rank = 'O3' 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useMobileDetection();

  // Define competencies based on rank category
  const officerCompetencies = [
    // Performance of Duties
    'Planning & Preparedness',
    'Using Resources',
    'Results/Effectiveness',
    'Adaptability',
    'Professional Competence',
    'Speaking and Listening',
    'Writing',
    // Leadership Skills
    'Looking Out For Others',
    'Developing Others',
    'Directing Others',
    'Teamwork',
    'Workplace Climate',
    'Evaluations',
    // Personal and Professional Qualities
    'Initiative',
    'Judgment',
    'Responsibility',
    'Professional Presence',
    'Health and Well Being'
  ];

  const enlistedE4E6Competencies = [
    // Military
    'Military Bearing',
    'Customs, Courtesies, and Traditions',
    // Performance
    'Quality of Work',
    'Technical Proficiency',
    'Initiative',
    // Professional Qualities
    'Decision Making and Problem Solving',
    'Military Readiness',
    'Self-Awareness and Learning',
    'Team Building',
    // Leadership
    'Respect for Others',
    'Accountability and Responsibility',
    'Influencing Others',
    'Effective Communication'
  ];

  const enlistedE7E8Competencies = [
    // Military
    'Military Bearing',
    'Customs, Courtesies, and Traditions',
    // Performance
    'Quality of Work',
    'Technical Proficiency',
    'Initiative',
    'Strategic Thinking',
    // Professional Qualities
    'Decision Making and Problem Solving',
    'Military Readiness',
    'Self-Awareness and Learning',
    'Partnering',
    // Leadership
    'Respect for Others',
    'Accountability and Responsibility',
    'Workforce Management',
    'Effective Communication',
    'Chiefs Mess Leadership and Participation'
  ];

  // Get the appropriate competencies based on rank category and rank
  const getCompetencies = () => {
    if (rankCategory === 'Officer') {
      return officerCompetencies;
    } else if (rankCategory === 'Enlisted') {
      if (rank === 'E7' || rank === 'E8') {
        return enlistedE7E8Competencies;
      } else {
        return enlistedE4E6Competencies;
      }
    }
    return officerCompetencies; // Default fallback
  };

  // Set default competency when competencies change
  useState(() => {
    const competencies = getCompetencies();
    if (competencies.length > 0 && !selectedCompetency) {
      setSelectedCompetency(competencies[0]);
    }
  });

  const getCategoryFromCompetency = (competency: string): string => {
    if (rankCategory === 'Officer') {
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
    } else if (rankCategory === 'Enlisted') {
      const military = [
        'Military Bearing', 'Customs, Courtesies, and Traditions'
      ];
      
      const performance = [
        'Quality of Work', 'Technical Proficiency', 'Initiative', 'Strategic Thinking'
      ];
      
      const professionalQualities = [
        'Decision Making and Problem Solving', 'Military Readiness', 
        'Self-Awareness and Learning', 'Team Building', 'Partnering'
      ];
      
      const leadership = [
        'Respect for Others', 'Accountability and Responsibility', 
        'Influencing Others', 'Effective Communication', 
        'Workforce Management', 'Chiefs Mess Leadership and Participation'
      ];
      
      if (military.includes(competency)) return 'Military';
      if (performance.includes(competency)) return 'Performance';
      if (professionalQualities.includes(competency)) return 'Professional Qualities';
      if (leadership.includes(competency)) return 'Leadership';
    }
    
    return 'Other';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedCompetency) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      competency: selectedCompetency
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call API to generate bullet
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          achievement: input,
          competency: selectedCompetency,
          rankCategory: rankCategory,
          rank: rank
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add assistant message with generated bullet
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.bullet,
          competency: selectedCompetency
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // If callback is provided, send the generated bullet to parent component
        if (onBulletGenerated) {
          const newBullet: BulletData = {
            id: Date.now().toString(),
            competency: selectedCompetency,
            content: data.bullet,
            isApplied: false,
            category: getCategoryFromCompetency(selectedCompetency)
          };
          onBulletGenerated(newBullet);
        }
      } else {
        // Handle error
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Sorry, I was unable to generate a bullet. Please try again.'
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'An error occurred. Please try again later.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
      setTimeout(scrollToBottom, 100);
    }
  };

  const competencies = getCompetencies();

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="mb-4">
        <label htmlFor="competency" className="block text-sm font-medium mb-1">
          Select Competency Area:
        </label>
        <select
          id="competency"
          value={selectedCompetency}
          onChange={(e) => setSelectedCompetency(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          {competencies.map((comp) => (
            <option key={comp} value={comp}>
              {comp}
            </option>
          ))}
        </select>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 border rounded-md mb-4 bg-gray-50 ${isMobile ? 'min-h-[200px] max-h-[350px]' : 'min-h-[300px] max-h-[500px]'}`}>
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center mt-10">
            <p>Enter your achievement below to generate a performance bullet for {rankCategory} rank {rank}.</p>
            <p className="text-sm mt-2">Example: &quote;:&quote;Led a team of 5 in completing critical maintenance on 3 aircraft, reducing downtime by 20%&quote;</p>
          </div>
        ) : (
          <div>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 p-3 rounded-lg ${
                  msg.role === 'user' ? 'bg-blue-100 ml-auto max-w-[80%]' : 'bg-white border max-w-[80%]'
                } ${isMobile ? 'text-sm' : ''}`}
              >
                {msg.role === 'assistant' && msg.competency && (
                  <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 mb-1`}>{msg.competency}</div>
                )}
                {msg.content}
                {msg.role === 'assistant' && (
                  <div className="mt-2 text-right">
                    <button 
                      onClick={() => {
                        if (onBulletGenerated && msg.competency) {
                          const newBullet: BulletData = {
                            id: `${Date.now()}-${index}`,
                            competency: msg.competency,
                            content: msg.content,
                            isApplied: false,
                            category: getCategoryFromCompetency(msg.competency)
                          };
                          onBulletGenerated(newBullet);
                        }
                      }}
                      className={`${isMobile ? 'text-xs py-1 px-2' : 'text-xs'} bg-blue-500 text-white rounded-md hover:bg-blue-600`}
                    >
                      Add to Bullets
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        {isLoading && (
          <div className="text-center p-2">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-blue-500"></div>
            <span className="ml-2">Generating bullet...</span>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your achievement..."
          className="w-full p-2 border rounded-t-md resize-none"
          rows={isMobile ? 4 : 3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-b-md disabled:bg-blue-300"
        >
          Send
        </button>
      </div>
    </div>
  );
}
