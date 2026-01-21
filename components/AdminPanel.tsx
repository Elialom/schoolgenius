import React, { useState, useEffect } from 'react';
import { TestSettings, Question, StudentResult, Subject } from '../types';
import { getSettings, saveSettings, getResults, clearResults } from '../services/storage';
import { generateQuestions } from '../services/gemini';
import { Trash2, RefreshCw, Save, CheckCircle, Eye, X, Check, XCircle } from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
}

const SUBJECTS: Subject[] = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science'];

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'results'>('settings');
  const [settings, setSettings] = useState<TestSettings>(getSettings());
  const [results, setResults] = useState<StudentResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null);

  useEffect(() => {
    setResults(getResults());
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    setSuccessMsg(null);
    try {
      const newQuestions = await generateQuestions(
        settings.subject, 
        settings.grade, 
        20,
        (count) => setProgress(count)
      );
      const newSettings = { ...settings, questions: newQuestions };
      setSettings(newSettings);
      saveSettings(newSettings);
      setSuccessMsg(`Successfully generated 20 new ${settings.subject} questions!`);
    } catch (e: any) {
      setError(e.message || "Failed to generate questions. Check API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    saveSettings(settings);
    setSuccessMsg("Settings saved successfully.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleClearResults = () => {
    if(confirm("Are you sure you want to clear all student results?")) {
      clearResults();
      setResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-500">Manage test settings and view student performance</p>
        </div>
        <button onClick={onBack} className="px-4 py-2 text-gray-600 hover:text-gray-900">
          Back to Home
        </button>
      </header>

      <main className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden min-h-[600px]">
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 text-center font-medium ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('settings')}
          >
            Test Configuration
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium ${activeTab === 'results' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('results')}
          >
            Student Results
          </button>
        </div>

        {activeTab === 'settings' && (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div>
                  <span className="text-gray-700 font-semibold block mb-2">Subject</span>
                  <div className="grid grid-cols-2 gap-2">
                    {SUBJECTS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSettings({ ...settings, subject: s })}
                        className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                          settings.subject === s
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-indigo-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                
                <label className="block">
                  <span className="text-gray-700 font-semibold">Target School Grade (1-13)</span>
                  <input
                    type="number"
                    min="1"
                    max="13"
                    value={settings.grade}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (e.target.value === '' || (val >= 1 && val <= 13)) {
                        setSettings({ ...settings, grade: e.target.value });
                      }
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 border"
                  />
                  <p className="text-xs text-gray-500 mt-1">Select difficulty level from Grade 1 to 13.</p>
                </label>

                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h3 className="text-indigo-900 font-medium mb-2 flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    AI Generation
                  </h3>
                  <p className="text-sm text-indigo-700 mb-4">
                    Automatically generate 20 questions for {settings.subject} (Grade {settings.grade}) using Gemini AI.
                  </p>
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isLoading ? 'Generating...' : 'Generate New Test'}
                  </button>
                  
                  {isLoading && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs font-semibold text-indigo-700 mb-1">
                        <span>Progress</span>
                        <span>{progress} / 20</span>
                      </div>
                      <div className="w-full bg-indigo-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${(progress / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                  {successMsg && <p className="text-green-600 text-sm mt-2 flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> {successMsg}</p>}
                </div>
              </div>

              <div className="space-y-4">
                 <label className="block">
                  <span className="text-gray-700 font-semibold">Test Duration (Minutes)</span>
                  <input
                    type="number"
                    value={settings.durationMinutes}
                    onChange={(e) => setSettings({ ...settings, durationMinutes: parseInt(e.target.value) || 20 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 border"
                  />
                </label>
                <div className="flex justify-end pt-4">
                  <button onClick={handleSave} className="flex items-center gap-2 bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-700">
                    <Save className="w-4 h-4" /> Save Settings
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Current Questions ({settings.questions.length})</h3>
              {settings.questions.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                  No questions set. Use the generator above or add manually.
                </div>
              ) : (
                <div className="space-y-4">
                  {settings.questions.map((q, idx) => (
                    <div key={q.id} className="p-4 border rounded-lg hover:shadow-sm bg-white">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-500 mr-3">Q{idx + 1}.</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2">{q.text}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {q.options.map((opt, i) => (
                              <div key={i} className={`p-2 rounded ${i === q.correctAnswer ? 'bg-green-100 text-green-800 font-semibold' : 'bg-gray-50 text-gray-600'}`}>
                                {String.fromCharCode(65 + i)}. {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Class Performance</h2>
              <button onClick={handleClearResults} className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm">
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((res) => (
                    <tr key={res.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{res.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{res.score} / {res.totalQuestions}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          (res.score / res.totalQuestions) >= 0.7 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {Math.round((res.score / res.totalQuestions) * 100)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(res.date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => setSelectedResult(res)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {results.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        No results yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Result Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Result Details: {selectedResult.studentName}</h2>
                <p className="text-sm text-gray-500">{new Date(selectedResult.date).toLocaleString()} • Score: {Math.round((selectedResult.score / selectedResult.totalQuestions) * 100)}%</p>
              </div>
              <button onClick={() => setSelectedResult(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {!selectedResult.questions ? (
                 <div className="text-center py-10 text-gray-500">
                    <p>Detailed question data is not available for this legacy result.</p>
                 </div>
              ) : (
                <div className="space-y-8">
                  {selectedResult.questions.map((q, idx) => {
                    const studentAnswer = selectedResult.answers[idx];
                    const isCorrect = studentAnswer === q.correctAnswer;
                    
                    return (
                      <div key={idx} className={`p-6 rounded-lg border-2 ${isCorrect ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
                        <div className="flex items-start gap-3 mb-4">
                          <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                            {isCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                          </span>
                          <div>
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Question {idx + 1}</span>
                            <p className="text-lg font-medium text-gray-900 mt-1">{q.text}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-11">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = studentAnswer === optIdx;
                            const isTargetCorrect = q.correctAnswer === optIdx;
                            
                            let styles = "border-gray-200 bg-white text-gray-600";
                            if (isTargetCorrect) {
                              styles = "border-green-500 bg-green-100 text-green-900 font-medium";
                            } else if (isSelected && !isTargetCorrect) {
                              styles = "border-red-500 bg-red-100 text-red-900 font-medium";
                            }

                            return (
                              <div key={optIdx} className={`p-3 rounded border ${styles} flex items-start`}>
                                <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                                <span>{opt}</span>
                                {isSelected && <span className="ml-auto text-xs font-bold uppercase px-2 py-0.5 rounded bg-gray-900 text-white opacity-20">You</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end">
              <button 
                onClick={() => setSelectedResult(null)}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;