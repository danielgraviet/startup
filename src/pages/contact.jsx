import React from 'react';
import styles from '../css/contact.module.css';

export function Contact() {
    return (
        <div className={styles.contactContainer}>
            <div className={styles.contactContent}>
                <h1>Contact Us</h1>
                <p className={styles.contactDescription}>
                    Let's connect: We're here to help, and we'd love to hear from you! Whether you have a question,
                    a comment, or just want to chat, you can reach out to us through the contact form on this
                    page, or by phone, email, or social media.
                </p>

                <div className={styles.contactOptions}>
                    <button className={`${styles.contactButton} ${styles.supportChat}`}>
                        <img src="/chatIcon.png" alt="Chat icon" />
                        Via Support Chat
                    </button>

                    <button className={`${styles.contactButton} ${styles.call}`}>
                        <img src="/phoneIcon.png" alt="Phone icon" />
                        Via Call
                    </button>
                </div>

                <div className={styles.contactFormContainer}>
                    <button className={`${styles.contactButton} ${styles.emailForm}`}>
                        <img src="/mailIcon.png" alt="Email icon" />
                        Via Email Form
                    </button>

                    <form className={styles.contactForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email">E-Mail</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
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
                            />
                        </div>
                    </form>
                </div>
            </div>

            <div className={styles.illustration}>
                <img src="/contact.jpg" alt="orange purple graphic" />
            </div>
        </div>
    );
}