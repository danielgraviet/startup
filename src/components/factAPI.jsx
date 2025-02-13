'use client';
import React, { useState, useEffect } from 'react';


export function FactAPI() {
    const [user, setUser] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchFact();
    }, []);

    const fetchFact = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('https://jsonplaceholder.typicode.com/users');
            const data = await response.json();
            const randomUser = data[Math.floor(Math.random() * data.length)];
            setUser(randomUser);
        } catch (error) {
            console.error('Error fetching fact:', error);
            setFact('Failed to fetch fact. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading ? (<p>Loading...</p>) : (<p>{user.name}</p>)}
            <button
                onClick={fetchFact}
                disabled={isLoading}>
                Get new fact
            </button>
        </>
    )
}

