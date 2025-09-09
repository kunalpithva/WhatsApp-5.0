// File: my-app/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard.jsx';
import Withbutton from './pages/withbutton.jsx';
import Withoutbutton from './pages/withoutbutton.jsx';
import Login from './pages/Login.jsx';
import CreateAccount from './pages/createaccount.jsx';
import ManageUser from './pages/manageuser.jsx';
import Profile from './pages/profile.jsx';
import Campaign from './pages/campaign.jsx';
// import SuspiciousActivity from './pages/SuspiciousActivity.jsx'; // Import the new component
import PrivateRoute from './components/PrivateRoute.jsx';
// import './App.css';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/withoutbutton" element={<PrivateRoute><Withoutbutton /></PrivateRoute>} />
          <Route path="/withbutton" element={<PrivateRoute><Withbutton /></PrivateRoute>} />
          <Route path="/createaccount" element={<CreateAccount />} />
          <Route path="/manageuser" element={<PrivateRoute><ManageUser /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/campaign" element={<PrivateRoute><Campaign /></PrivateRoute>} />
          {/* <Route path="/suspiciousactivity" element={<PrivateRoute><SuspiciousActivity /></PrivateRoute>} /> New route */}
          <Route path="/" element={<Login />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
