import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importing pages and components
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './components/Profile';
import AlumniList from './pages/AlumniList';
import ChatPage from './pages/ChatPage';
import Discover from './pages/Discover';
import AlumniProfile from './pages/AlumniProfile';
import RealtimeListener from './components/RealtimeListener';

const App = () => {
  return (
    <Router>
      <RealtimeListener />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/details" element={<EventDetails />} />

        {/* Chat Section  */}
        <Route path="/alumni" element={<AlumniList />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/chat" element={<ChatPage />} />

        {/* Discover  */}
        <Route path="/discover" element={<Discover />} />
        <Route path="/discover/user" element={<AlumniProfile />} />


        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer position='top-right' autoClose={3000} />
    </Router>
  );
};

export default App;
