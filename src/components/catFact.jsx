'use client';
import React, { useState, useEffect } from 'react';
import styles from '../css/messages.module.css';

export function CatFact() {
    const [fact, setFact] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchFact();
    }, []);

    const fetchFact = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('https://catfact.ninja/fact');
            const data = await response.json();
            setFact(data.fact);
        } catch (error) {
            console.error('Error fetching cat fact:', error);
            setFact('Failed to fetch cat fact. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading ? (
                <p className={styles.factText}>Loading...</p>
            ) : (
                <p className={styles.factText}>{fact}</p>
            )}
            <button
                onClick={fetchFact}
                className={styles.refreshFact}
                disabled={isLoading}
            >
                <img src="/random.png" alt="Refresh" className={styles.refreshIcon} />
                New Fact
            </button>
        </>
    );
}