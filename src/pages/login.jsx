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

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Login form submitted');

        // Basic validation
        if (!credentials.username) {
            setError('Please enter a username');
            console.log('Error:', 'Please enter a username');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: credentials.username, password: credentials.password }),
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('currentUser', data.username);
                localStorage.setItem('isLoggedIn', 'true');
                props.setIsLoggedIn(true);
                console.log('Login successful:', data);
                navigate('/messages');
            } else if (response.status === 404) {
                setError('User not found. Please create an account.');
                console.log('Error:', 'User not found');
            } else {
                const errorData = await response.json();
                setError(errorData.msg || 'Login failed');
                console.log('Error:', errorData.msg || 'Login failed');
            }
        } catch (err) {
            setError('Network error occurred. Please try again.');
            console.log('Error:', 'Network error occurred', err);
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
                            {error && (
                                <div className={styles.errorMessage} style={{
                                    backgroundColor: '#fee2e2',
                                    color: '#dc2626',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    textAlign: 'center'
                                }}>
                                    {error}
                                </div>
                            )}
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