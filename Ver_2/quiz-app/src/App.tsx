import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useQuizStore } from './store';
import Header from './components/Header';
import Footer from './components/Footer';
import Welcome from './pages/Welcome';
import Question from './pages/Question';
import Result from './pages/Result';
import Finish from './pages/Finish';
import './App.css';

function NavigationBlocker() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      // Block browser back/forward - show alert
      const confirmed = window.confirm(
        'Using browser navigation may cause issues. Please use the Back and Next buttons in the app. Continue anyway?'
      );
      if (!confirmed) {
        // Push the current location back to prevent navigation
        window.history.pushState(null, '', location.pathname);
      }
    };

    // Prevent browser back button
    window.history.pushState(null, '', location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location, navigate]);

  return null;
}

function App() {
  const { initializeQuestions, questions } = useQuizStore();

  useEffect(() => {
    // Load quiz data
    const loadQuizData = async () => {
      try {
        const response = await fetch('/quiz_data.json');
        const rawData = await response.json();
        // Map task_id to id for compatibility
        const data = rawData.map((q: any) => ({
          ...q,
          id: q.task_id,
        }));
        initializeQuestions(data);
      } catch (error) {
        console.error('Failed to load quiz data:', error);
      }
    };

    // Always reload to ensure correct IDs after code changes
    loadQuizData();
  }, [initializeQuestions]);

  if (questions.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading quiz data...</h2>
      </div>
    );
  }

  return (
    <Router>
      <NavigationBlocker />
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/q/:index" element={<Question />} />
        <Route path="/result/:index" element={<Result />} />
        <Route path="/finish" element={<Finish />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
