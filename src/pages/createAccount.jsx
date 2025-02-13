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
    const navigate = useNavigate(); // is this a built in function?

    const handleSubmit = (e) => {
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

        // Check if username already exists
        const existingUsers = JSON.parse(localStorage.getItem('users') || '{}');

        // this is looking up a key in the users object
        if (existingUsers[formData.username]) {
            setError('Username already exists');
            console.log('Error:', 'Username already exists'); // Debug log
            return;
        }

        // Save new user
        // think of a dictionary, it is using the username as the key and the password as the value
        existingUsers[formData.username] = formData.password;

        // remember, existing users is a dictionary object, and local storage can only store strings. 
        // so we need to convert the object to a string
        localStorage.setItem('users', JSON.stringify(existingUsers));
        console.log('User created successfully'); // Debug log

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