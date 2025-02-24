import React, { useState } from 'react';
import { useMessages } from '../context/MessagesContext';
import styles from '../css/messages.module.css';

export function AddChannel() {
    const [isOpen, setIsOpen] = useState(false);
    const [channelName, setChannelName] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const { createChannel } = useMessages();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!channelName.trim()) return;

        // Create public channel with empty members array
        createChannel(channelName, []);

        // Show success message
        setShowSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);

        // Reset form
        setChannelName('');
        setIsOpen(false);
    };

    return (
        <div className={styles.addChannelContainer}>
            {showSuccess && (
                <div className={styles.successMessage}>
                    Channel created successfully!
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.addChannelButton}
            >
                + New Channel
            </button>

            {isOpen && (
                <form onSubmit={handleSubmit} className={styles.addChannelForm}>
                    <input
                        type="text"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        placeholder="Channel name"
                        className={styles.addChannelInput}
                    />
                    <button type="submit" className={styles.addChannelSubmit}>
                        Create Channel
                    </button>
                </form>
            )}
        </div>
    );
} 