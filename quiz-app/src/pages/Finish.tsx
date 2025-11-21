import { useEffect } from 'react';
import { useQuizStore } from '../store';
import { computeStats } from '../utils';
import type { TestResult } from '../types';
import './Finish.css';

export default function Finish() {
  const { questions, answers, trainingList, resetQuiz, sessionId, userId } = useQuizStore();
  const stats = computeStats(answers);
  
  const trainingQuestions = questions.filter((q) => trainingList.has(q.id));

  // Automatically save test results to server
  useEffect(() => {
    if (answers.length > 0) {
      saveTestResultsToServer();
    }
  }, []);

  const saveTestResultsToServer = async () => {
    const testResults: TestResult[] = answers.map((answer) => ({
      session_id: sessionId,
      timestamp: answer.timestamp || new Date().toISOString(),
      user_id: userId,
      task_id: answer.taskId || `task_${answer.questionId}`,
      selected_option: answer.selectedOption || '',
      is_correct: answer.isCorrect,
    }));

    try {
      // Save to local file in application directory
      const response = await fetch('/api/save-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testResults),
      });
      
      if (!response.ok) {
        console.error('Failed to save results to server');
      }
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const handleSaveCSV = () => {
    // Get unique skill names from training list
    const skillNames = [...new Set(trainingQuestions.map(q => q.skillName).filter(Boolean))];
    
    // Create CSV content
    const csvContent = 'Skill Name\n' + skillNames.join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-skills-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRestart = () => {
    if (confirm('Are you sure you want to restart the quiz? All progress will be lost.')) {
      resetQuiz();
      window.location.href = '/';
    }
  };

  return (
    <main className="finish-page">
      <div className="finish-content">
        <h1>Thank You!</h1>
        
        <div className="stats-section">
          <h2>Your Results</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{stats.answered}</div>
              <div className="stat-label">Answered</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.correct}</div>
              <div className="stat-label">Correct Answers</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {stats.avgDifficultyCorrect !== null
                  ? `${(stats.avgDifficultyCorrect * 100).toFixed(1)}%`
                  : 'N/A'}
              </div>
              <div className="stat-label">Average Difficulty of Correct Answers</div>
            </div>
          </div>
        </div>

        {trainingQuestions.length > 0 && (
          <div className="training-section">
            <h2>Training List</h2>
            <div className="training-actions">
              <button className="btn btn-secondary" onClick={handleSaveCSV}>
                Save as CSV
              </button>
              <button className="btn btn-secondary" onClick={handlePrint}>
                Print
              </button>
            </div>
            
            <div className="training-list">
              {[...new Set(trainingQuestions.map(q => q.skillName).filter(Boolean))].map((skillName, index) => (
                <div key={index} className="training-item">
                  <div className="training-skill-name">{skillName}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="finish-actions">
          <button className="btn btn-primary" onClick={handleRestart}>
            Restart Quiz
          </button>
        </div>
      </div>
    </main>
  );
}
