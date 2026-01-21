import React, { useState } from 'react';
import { AppMode } from './types';
import { getSettings } from './services/storage';
import AdminPanel from './components/AdminPanel';
import StudentTest from './components/StudentTest';
import { BookOpen, GraduationCap } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.LANDING);

  // Landing Page Component
  const LandingPage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center">
        <div className="flex justify-center gap-4 mb-8">
           <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
             <BookOpen size={32} />
           </div>
           <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
             <GraduationCap size={32} />
           </div>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">SchoolGenius AI</h1>
        <p className="text-gray-500 mb-10 text-lg">Intelligent testing platform for modern schools.</p>
        
        <div className="space-y-4">
          <button 
            onClick={() => setMode(AppMode.STUDENT_TEST)}
            className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center"
          >
            I am a Student
          </button>
          <button 
            onClick={() => setMode(AppMode.ADMIN)}
            className="w-full bg-white text-gray-700 border-2 border-gray-200 p-4 rounded-xl font-bold text-lg hover:border-gray-400 hover:bg-gray-50 transition"
          >
            I am a Teacher
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mode === AppMode.LANDING && <LandingPage />}
      
      {mode === AppMode.ADMIN && (
        <AdminPanel onBack={() => setMode(AppMode.LANDING)} />
      )}
      
      {mode === AppMode.STUDENT_TEST && (
        <StudentTest 
          settings={getSettings()} 
          onComplete={() => setMode(AppMode.LANDING)}
          onExit={() => setMode(AppMode.LANDING)}
        />
      )}
    </>
  );
};

export default App;