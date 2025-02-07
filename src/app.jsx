import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './css/navbar.module.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { About } from './pages/about';
import { Login } from './pages/login';
import { Messages } from './pages/messages';
export default function App() {
    const saveUserName = () => {
        const username = document.getElementById("username").value;
        localStorage.setItem("username", username);
        return true;
    };

    
    return (
        <BrowserRouter>
            <>
                <nav className={styles.navbar}>
                    <div className={styles.navLeft}>
                        <img src="/logo.png" alt="Logo" />
                    </div>
                    <div className={styles.navCenter}>
                        <ul>
                            <li><NavLink to="/">Home</NavLink></li>
                            <li><NavLink to="/messages">Messages</NavLink></li>
                            <li><NavLink to="/about">About</NavLink></li>
                            <li><NavLink to="/contact">Contact</NavLink></li>
                        </ul>
                    </div>
                    <div className={styles.navRight}></div>
                </nav>

                

                <main>App components will go here</main>

                <Routes>
                    <Route path="/about" element={<About />} />
                    <Route path="/" element={<Login />} />
                    <Route path="/messages" element={<Messages />} />
                </Routes>
            </>
        </BrowserRouter>
    );
}