import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from '../css/login.module.css';

export function Login(props) {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Check if user is already logged in
    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn');
        if (loggedIn === 'true') {
            navigate('/messages');
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!credentials.username || !credentials.password) {
            setError('Please fill in all fields');
            return;
        }

        // Get stored users
        const users = JSON.parse(localStorage.getItem('users') || '{}');

        // Check if user exists and password matches
        if (users[credentials.username] === credentials.password) {
            localStorage.setItem('currentUser', credentials.username);
            localStorage.setItem('isLoggedIn', 'true');
            props.setIsLoggedIn(true);
            navigate('/messages');
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.heroLeft}>
                    <h1 className={styles.heroTitle}>CatNip Messaging</h1>
                    <p className={styles.heroSubtitle}>a place to connect.</p>
                    <div className={styles.actionButtons}>
                        <form
                            id="login-form"
                            onSubmit={handleSubmit}
                            className={styles.loginForm}
                        >
                            {error && <div className={styles.errorMessage}>{error}</div>}
                            <div className={styles.formGroup}>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="Enter your username"
                                    value={credentials.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={credentials.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.buttonGroup}>
                                <button type="submit" className={styles.primaryButton}>
                                    Login
                                </button>
                                <NavLink
                                    to="/create-account"
                                    className={styles.primaryButton}
                                >
                                    Create Account
                                </NavLink>
                            </div>
                        </form>
                    </div>
                </div>
                <div className={styles.heroRight}>
                    <img src="/landingpage.png" alt="CatNip Interface" className={styles.heroImage} />
                </div>

                <div className={styles.footer}>
                    <a
                        href="https://github.com/danielgraviet/startup"
                        className={styles.footerLink}
                    >
                        GitHub
                    </a>
                </div>
            </div>
        </div>
    );
}