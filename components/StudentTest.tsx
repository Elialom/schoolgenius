import React, { useState, useEffect, useRef } from 'react';
import { TestSettings, StudentResult, AppMode } from '../types';
import { saveResult } from '../services/storage';
import { Clock, Check, AlertCircle } from 'lucide-react';

interface StudentTestProps {
  settings: TestSettings;
  onComplete: () => void;
  onExit: () => void;
}

const StudentTest: React.FC<StudentTestProps> = ({ settings, onComplete, onExit }) => {
  const [studentName, setStudentName] = useState('');
  const [mode, setMode] = useState<'LOGIN' | 'TEST' | 'RESULT'>('LOGIN');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(settings.questions.length).fill(-1));
  const [timeLeft, setTimeLeft] = useState(settings.durationMinutes * 60);
  const [score, setScore] = useState(0);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (mode === 'TEST') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleStart = () => {
    if (studentName.trim() && settings.questions.length > 0) {
      setMode('TEST');
    }
  };

  const handleSelectOption = (optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIdx] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (timerRef.current !== null) clearInterval(timerRef.current);
    
    // Calculate Score
    let calculatedScore = 0;
    settings.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);

    // Save Result
    const result: StudentResult = {
      id: Date.now().toString(),
      studentName,
      score: calculatedScore,
      totalQuestions: settings.questions.length,
      date: new Date().toISOString(),
      answers,
      questions: settings.questions, // Snapshot of questions
      subject: settings.subject
    };
    saveResult(result);
    setMode('RESULT');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (settings.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-600 p-4 text-center">
        <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Test Available</h2>
        <p className="mb-6">The teacher has not set any questions yet.</p>
        <button onClick={onExit} className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Return Home
        </button>
      </div>
    );
  }

  if (mode === 'LOGIN') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Grade {settings.grade} {settings.subject} Test</h1>
          <p className="text-gray-500 mb-6">You have {settings.durationMinutes} minutes to complete {settings.questions.length} questions.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <button 
              onClick={handleStart}
              disabled={!studentName.trim()}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Start Test
            </button>
            <button onClick={onExit} className="w-full text-gray-500 py-2 hover:text-gray-800">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'RESULT') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Submitted!</h2>
          <p className="text-gray-500 mb-8">Great job, {studentName}. Your answers have been recorded.</p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Your Score</p>
            <p className="text-5xl font-bold text-indigo-600 mt-2">{Math.round((score / settings.questions.length) * 100)}%</p>
            <p className="text-gray-600 mt-2">{score} out of {settings.questions.length} correct</p>
          </div>

          <button 
            onClick={onComplete}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Test Mode
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Timer */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-semibold text-gray-700">Question {currentQuestionIdx + 1} / {settings.questions.length}</div>
          <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-indigo-600'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 w-full">
        <div 
          className="h-full bg-indigo-600 transition-all duration-300" 
          style={{ width: `${((currentQuestionIdx + 1) / settings.questions.length) * 100}%` }}
        />
      </div>

      {/* Question Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-8 leading-relaxed">
            {settings.questions[currentQuestionIdx].text}
          </h2>

          <div className="space-y-3">
            {settings.questions[currentQuestionIdx].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-start group
                  ${answers[currentQuestionIdx] === idx 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <span className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold mr-4 border transition-colors mt-0.5
                  ${answers[currentQuestionIdx] === idx
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-500 border-gray-300 group-hover:border-indigo-400'
                  }
                `}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-lg flex-1 break-words whitespace-normal leading-relaxed">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIdx === 0}
            className="px-6 py-2 text-gray-600 font-medium disabled:opacity-30 hover:text-gray-900"
          >
            Previous
          </button>
          
          {currentQuestionIdx === settings.questions.length - 1 ? (
             <button
             onClick={handleSubmit}
             className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
           >
             Submit Test
           </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIdx(prev => Math.min(settings.questions.length - 1, prev + 1))}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
            >
              Next Question
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentTest;