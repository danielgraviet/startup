import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from '../css/createAccount.module.css';

export function CreateAccount() {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        terms: false
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your account creation logic here
        console.log('Form submitted:', formData);
        navigate('/messages');
    };

    return (
        <div className={styles.signupContainer}>
            <div className={styles.signupLeft}>
                {/* Background image will be set in CSS */}
            </div>
            <div className={styles.signupRight}>
                <h1>Create an account</h1>
                <p className={styles.loginLink}>
                    Already have an account?{' '}
                    <NavLink to="/">Log in</NavLink>
                </p>

                <form
                    id="signup-form"
                    onSubmit={handleSubmit}
                    className={styles.signupForm}
                >
                    <div className={styles.formGroup}>
                        <input
                            type="text"
                            id="firstname"
                            name="firstname"
                            placeholder="First name"
                            value={formData.firstname}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <input
                            type="text"
                            id="lastname"
                            name="lastname"
                            placeholder="Last name"
                            value={formData.lastname}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.checkboxGroup}>
                        <input
                            type="checkbox"
                            id="terms"
                            name="terms"
                            checked={formData.terms}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="terms">
                            I agree to the <a href="#">Terms & Conditions</a>
                        </label>
                    </div>

                    <button type="submit" className={styles.signupButton}>
                        Create account
                    </button>
                </form>
            </div>
        </div>
    );
}