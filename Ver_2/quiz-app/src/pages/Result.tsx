import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuizStore } from '../store';
import type { IssueReport } from '../types';
import './Result.css';

export default function Result() {
  const { index } = useParams<{ index: string }>();
  const navigate = useNavigate();
  const questionIndex = parseInt(index || '0');
  
  const { questions, answers, trainingList, addToTraining, removeFromTraining, reportIssue } = useQuizStore();
  const question = questions[questionIndex];
  const answer = answers.find((a) => a.questionId === question?.id);
  
  const [addToTrainingChecked, setAddToTrainingChecked] = useState(
    trainingList.has(question?.id || 0)
  );
  const [reportIssueChecked, setReportIssueChecked] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportNote, setReportNote] = useState('');

  if (!question || !answer) {
    navigate('/finish');
    return null;
  }

  const correctOption = question.options.find((opt) => opt.id === question.correctOptionId);
  const selectedOption = question.options.find((opt) => opt.id === answer.selectedOptionId);

  const handleTrainingCheckbox = (checked: boolean) => {
    setAddToTrainingChecked(checked);
    if (checked) {
      addToTraining(question.id);
    } else {
      removeFromTraining(question.id);
    }
  };

  const handleNext = () => {
    if (reportIssueChecked) {
      setShowReportModal(true);
    } else {
      goToNext();
    }
  };

  const goToNext = () => {
    const nextIndex = questionIndex + 1;
    if (nextIndex < questions.length) {
      navigate(`/q/${nextIndex}`);
    } else {
      navigate('/finish');
    }
  };

  const handleSendReport = () => {
    const report: IssueReport = {
      questionId: question.id,
      questionText: question.text,
      selectedOption: selectedOption?.text || '',
      correctOption: correctOption?.text || '',
      userNote: reportNote,
      timestamp: new Date().toISOString(),
    };
    reportIssue(report);
    setShowReportModal(false);
    setReportNote('');
    goToNext();
  };

  return (
    <main className="result-page">
      <div className="result-content">
        <div
          className={`result-verdict ${answer.isCorrect ? 'correct' : 'incorrect'}`}
          aria-live="polite"
        >
          {answer.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
        </div>
        
        {question.skillName && (
          <div className="skill-info">
            <div className="skill-name-result">
              <strong>Skill:</strong> {question.skillName}
            </div>
            {question.skillDefinition && (
              <div className="skill-definition">
                {question.skillDefinition}
              </div>
            )}
          </div>
        )}
        
        {!answer.isCorrect && correctOption && (
          <div className="correct-answer">
            <strong>Correct answer:</strong> {correctOption.text}
          </div>
        )}
        
        <div className="explanation-section">
          <h3>Explanation</h3>
          <p>{question.explanation}</p>
        </div>
        
        <div className="result-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={addToTrainingChecked}
              onChange={(e) => handleTrainingCheckbox(e.target.checked)}
            />
            <span>Add this skill to the training list</span>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={reportIssueChecked}
              onChange={(e) => setReportIssueChecked(e.target.checked)}
            />
            <span>Report an issue with this question</span>
          </label>
        </div>
        
        <div className="result-actions">
          <button className="btn btn-primary" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>

      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Report Issue</h3>
            <p>Please describe the issue with this question (optional):</p>
            <textarea
              className="report-textarea"
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              placeholder="Enter your feedback here..."
              rows={4}
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSendReport}>
                Send Report
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
