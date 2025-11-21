import { useNavigate, useLocation } from 'react-router-dom';
import { useQuizStore } from '../store';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { questions, answers } = useQuizStore();
  
  const showProgress = location.pathname.startsWith('/q/') || location.pathname.startsWith('/result/');
  const showFinishButton = location.pathname !== '/welcome' && location.pathname !== '/finish';
  
  const handleFinish = () => {
    if (confirm('Are you sure you want to finish the quiz?')) {
      navigate('/finish');
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">AI Skills Quiz</h1>
        
        {showProgress && (
          <div className="progress-container">
            <div className="progress-text">
              Answered: {answers.length} / {questions.length}
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(answers.length / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}
        
        {showFinishButton && (
          <button className="btn btn-finish" onClick={handleFinish}>
            Finish
          </button>
        )}
      </div>
    </header>
  );
}
