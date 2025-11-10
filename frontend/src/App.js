import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import HomePage from './pages/home';
import WritePage from './pages/write';
import StoryPage from './pages/story';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/write" element={<WritePage />} />
        <Route path="/story/:id" element={<StoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
