import  {BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './components/Login'
import AdminHome from './components/AdminHome';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminHeader from './AdminHomeComponents/AdminHeader/AdminHeader';


const isAuthenticated = () => {
  return localStorage.getItem('isLoggedIn') === 'true';
};


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const fetchAdminFullname = (name) => {
    localStorage.setItem('adminName', name);
  }

  const fetchAdminNickname = (nickname) => {
    localStorage.setItem('adminNickname', nickname);
  }

  const fetchAdminId = (id) => {
    localStorage.setItem('adminId', id);
  }


  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('adminName');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} adminFullname={fetchAdminFullname} adminNickname={fetchAdminNickname} adminId={fetchAdminId} />} />
        <Route path="/home/*" element={isLoggedIn ? <AdminHome onLogout={handleLogout} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
