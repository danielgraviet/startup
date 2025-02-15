import React from 'react';
import styles from '../css/about.module.css';  // Assuming you'll create this CSS module
export function About() {
    return (
        <div className={styles.aboutContainer}>
            <div className={styles.aboutHeader}>
                <h1>About Us</h1>
                <p>
                    CatNip Messaging is a playful and engaging platform inspired by my black long-haired cat, Muji.
                    Built for those who love to learn, connect, and have fun, it's a space
                    to build relationships while discovering something new along the way.
                </p>
            </div>
            <div className={styles.heroImage}>
                <img src="/orange.jpg" alt="orange 3-d rendering" />
            </div>

            <div className={styles.valuesSection}>
                <h2>What is Important to Me</h2>
                <div className={styles.valuesGrid}>
                    <div className={styles.valueCard}>
                        <div className={`${styles.valueIcon} ${styles.green}`}>
                            <img src="/simpleicon.png" alt="Environmental icon" />
                        </div>
                        <h3>Simplicity</h3>
                    </div>

                    <div className={styles.valueCard}>
                        <div className={`${styles.valueIcon} ${styles.purple}`}>
                            <img src="/creativeIcon.png" alt="Security icon" />
                        </div>
                        <h3>Creativity</h3>
                    </div>

                    <div className={styles.valueCard}>
                        <div className={`${styles.valueIcon} ${styles.orange}`}>
                            <img src="/learningicon.png" alt="Balance icon" />
                        </div>
                        <h3>Learning</h3>
                    </div>

                    <div className={styles.valueCard}>
                        <div className={`${styles.valueIcon} ${styles.blue}`}>
                            <img src="/funicon.png" alt="Impact icon" />
                        </div>
                        <h3>Fun</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}