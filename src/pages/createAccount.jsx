import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/login.module.css';

export function CreateAccount() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!formData.username || !formData.password || !formData.confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Check if username already exists
        const existingUsers = JSON.parse(localStorage.getItem('users') || '{}');
        if (existingUsers[formData.username]) {
            setError('Username already exists');
            return;
        }

        // Save new user
        existingUsers[formData.username] = formData.password;
        localStorage.setItem('users', JSON.stringify(existingUsers));

        // Redirect to login
        navigate('/');
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.heroLeft}>
                    <h1 className={styles.heroTitle}>Create Account</h1>
                    <div className={styles.actionButtons}>
                        <form onSubmit={handleSubmit} className={styles.loginForm}>
                            {error && <div className={styles.errorMessage}>{error}</div>}

                            <div className={styles.formGroup}>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.buttonGroup}>
                                <button type="submit" className={styles.primaryButton}>
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}