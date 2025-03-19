import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/login.module.css';

// @ToDo:
// - implement backend validation. 

export function CreateAccount({ setIsLoggedIn }) {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const navigate = useNavigate(); // is this a built in function?

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted'); // Debug log

        // checks if all fields are filled
        if (!formData.username || !formData.password || !formData.confirmPassword) {
            setError('All fields are required');
            console.log('Error:', 'All fields are required'); // Debug log
            return;
        }

        // checks if password and confirm password match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            console.log('Error:', 'Passwords do not match'); // Debug log
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({username: formData.username, password: formData.password})
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Account created successfully', data);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', data.username);
                setIsLoggedIn(true);
                navigate('/messages');
            } else {
                setError(data.msg || "Registration failed");
                console.log('Error:', data.msg);
            }
        } catch (error) {
            setError('Network error. Please try again later.');
            console.error('Fetch error: ', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.heroLeft}>
                    <h1 className={styles.heroTitle}>Create Account</h1>
                    <div className={styles.actionButtons}>
                        <form onSubmit={handleSubmit} className={styles.loginForm}>
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