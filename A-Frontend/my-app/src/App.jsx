import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AllCampaign from './pages/AllCampaign.jsx';
import CreateAccount from './pages/CreateAccount.jsx';
import ManageUser from './pages/ManageUser.jsx';
import Suspicious from './pages/Suspicious.jsx';
// import './App.css';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/allCampaign" element={<AllCampaign />} />
          <Route path="/createAccount" element={<CreateAccount />} />
          <Route path="/manageUser" element={<ManageUser />} />
          <Route path="/suspicious" element={<Suspicious />} />

          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
