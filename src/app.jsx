import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './css/navbar.module.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { About } from './pages/about';
import { Login } from './pages/login';
import { Messages } from './pages/messages';
import { Contact } from './pages/contact';
import { CreateAccount } from './pages/createAccount';
import { MessagesProvider } from './context/MessagesContext';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });
        setIsAuthenticated(response.ok);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    verifyAuth();
  }, []);

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);

  if (isAuthenticated === null) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/" />;
  return children;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('currentUser', data.username);
        } else {
          setIsLoggedIn(false);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('currentUser');
        }
        console.log('checkLoginStatus - loggedIn:', response.ok);
      } catch (error) {
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        console.error('Check login failed:', error);
      }
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        window.location.href = '/';
      } else {
        console.error('Logout failed with status:', response.status);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  console.log('App render - isLoggedIn:', isLoggedIn);

  return (
    <BrowserRouter>
      <MessagesProvider>
        <nav className={styles.navbar}>
          <div className={styles.navLeft}>
            <img src="/logo.png" alt="Logo" />
          </div>
          <div className={styles.navCenter}>
            <ul>
              {isLoggedIn ? (
                <>
                  <li><NavLink to="/messages">Messages</NavLink></li>
                  <li><NavLink to="/about">About</NavLink></li>
                  <li><NavLink to="/contact">Contact</NavLink></li>
                </>
              ) : (
                <li><NavLink to="/">Home</NavLink></li>
              )}
            </ul>
          </div>
          <div className={styles.navRight}>
            {isLoggedIn && (
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            )}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/create-account" element={<CreateAccount setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
        </Routes>
      </MessagesProvider>
    </BrowserRouter>
  );
}