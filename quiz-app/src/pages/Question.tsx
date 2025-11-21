import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuizStore } from '../store';
import './Question.css';

export default function Question() {
  const { index } = useParams<{ index: string }>();
  const navigate = useNavigate();
  const questionIndex = parseInt(index || '0');
  
  const { questions, answers, submitAnswer } = useQuizStore();
  const question = questions[questionIndex];
  
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  useEffect(() => {
    // Reset selection when question changes
    setSelectedOptionId(null);
  }, [questionIndex]);

  if (!question) {
    navigate('/finish');
    return null;
  }

  // Check if already answered - allow viewing but show existing answer
  const existingAnswer = answers.find((a) => a.questionId === question.id);

  const handleSubmit = () => {
    if (selectedOptionId === null) return;
    
    // If already answered, just navigate to result
    if (existingAnswer) {
      navigate(`/result/${questionIndex}`);
      return;
    }
    
    submitAnswer(question.id, selectedOptionId);
    navigate(`/result/${questionIndex}`);
  };

  const handleBack = () => {
    navigate(`/q/${questionIndex - 1}`);
  };

  return (
    <main className="question-page">
      <div className="question-content">
        <div className="question-header">
          <h2>Question {questionIndex + 1}</h2>
          {question.skillName && (
            <div className="skill-name">Skill: {question.skillName}</div>
          )}
        </div>
        
        <div className="question-text">{question.text}</div>
        
        <div className="options-container" role="radiogroup" aria-label="Answer options">
          {question.options.map((option, idx) => (
            <label
              key={idx}
              className={`option-label ${selectedOptionId === option.id ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="answer"
                value={option.id}
                checked={selectedOptionId === option.id}
                onChange={() => setSelectedOptionId(option.id)}
                className="option-radio"
              />
              <span className="option-text">{option.text}</span>
            </label>
          ))}
        </div>
        
        <div className="question-actions">
          {questionIndex > 0 && (
            <button
              className="btn btn-secondary"
              onClick={handleBack}
            >
              Back
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={selectedOptionId === null}
          >
            Submit Answer
          </button>
        </div>
      </div>
    </main>
  );
}
