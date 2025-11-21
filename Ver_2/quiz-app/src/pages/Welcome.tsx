import { useNavigate } from 'react-router-dom';
import './Welcome.css';

export default function Welcome() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/q/0');
  };

  return (
    <main className="welcome-page">
      <div className="welcome-content">
        <h1>AI Developer Skills Quiz</h1>
        <p className="welcome-description">
          Test your knowledge of AI development skills with this comprehensive quiz.
        </p>
        <p className="navigation-warning">
          <strong>Note:</strong> Please don't use browser navigation buttons (Back/Forward). Use the in-app buttons for consistent results.
        </p>
        <div className="welcome-info">
          <h2>How it works:</h2>
          <ul>
            <li>Answer questions about various AI development topics</li>
            <li>Get immediate feedback on your answers</li>
            <li>Add challenging questions to your training list</li>
            <li>Track your progress and see your final statistics</li>
            <li>You can finish at any time using the Finish button in the header</li>
          </ul>
        </div>
        <button className="btn btn-primary btn-large" onClick={handleStart}>
          Start Test
        </button>
      </div>
    </main>
  );
}
