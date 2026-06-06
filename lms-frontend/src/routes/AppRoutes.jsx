import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage/LandingPage';


export default function App() {
  return (
    <Router>
        <Routes>
            <Route path='/' element={<LandingPage />} />
        </Routes>
    </Router>
  )
}
