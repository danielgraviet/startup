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
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    console.log('ProtectedRoute - isLoggedIn:', isLoggedIn); // Debug
    if (!isLoggedIn) {
        return <Navigate to="/" />;
    }
    return children;
};

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');

    useEffect(() => {
        const checkLoginStatus = () => {
            const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
            console.log('checkLoginStatus - loggedIn:', loggedIn); // Debug
            setIsLoggedIn(loggedIn);
        };

        checkLoginStatus(); // Initial check
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
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');
                setIsLoggedIn(false);
                window.location.href = '/';
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            setIsLoggedIn(false);
            window.location.href = '/';
        }
    };

    console.log('App render - isLoggedIn:', isLoggedIn); // Debug

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