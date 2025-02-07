import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from '../css/login.module.css';


export function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem("username", username);
        navigate('/messages');
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
                            <div className={styles.formGroup}>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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