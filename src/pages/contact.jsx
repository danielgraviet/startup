import React, { useState } from 'react';
import styles from '../css/contact.module.css';

export function Contact() {
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        message: ""
    });

    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    // change to the backend API calls. 
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({
                    email: "",
                    name: "",
                    message: ""
                });
                console.log('Form submitted successfully');
                setTimeout(() => setSubmitStatus(null), 3000);
            } else {
                setSubmitStatus('error');
                console.log('Form submission failed', response.status);
            }
        } catch (error) {
            console.error('Error submitting form: ', error);
            setSubmitStatus('error');
        }
    };

    return (
        <div className={styles.contactContainer}>
            <div className={styles.contactContent}>
                <h1>Contact Us</h1>
                <p className={styles.contactDescription}>
                    Let's connect: We're here to help, and we'd love to hear from you! Whether you have a question,
                    a comment, or just want to chat, you can reach out to us through the contact form on this
                    page, or by phone, email, or social media.
                </p>


                <div className={styles.contactFormContainer}>
                    <form className={styles.contactForm} onSubmit={handleSubmit}>
                        {/* Success/Error Messages */}
                        {submitStatus === 'success' && (
                            <div className={styles.successBox}>
                                Message sent successfully!
                            </div>
                        )}

                        {submitStatus === 'error' && (
                            <div className={styles.errorBox}>
                                Failed to send message. Please try again.
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email">E-Mail</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                onChange={handleChange}
                                value={formData.email}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="message">Text</label>
                            <textarea
                                id="message"
                                name="message"
                                rows="5"
                                required
                                onChange={handleChange}
                                value={formData.message}
                            />
                        </div>

                        <button type="submit" className={styles.contactButton}>Send</button>
                    </form>
                </div>
            </div>

            <div className={styles.illustration}>
                <img src="/contact.jpg" alt="orange purple graphic" />
            </div>
        </div>
    );
}