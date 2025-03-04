import React, { useState } from 'react';
import { useMessages } from '../context/MessagesContext';
import styles from '../css/messages.module.css';

export function AddChannel() {
    const [isOpen, setIsOpen] = useState(false);
    const [channelName, setChannelName] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');
    const { createChannel } = useMessages();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!channelName.trim()) {
            setError('Channel name is required');
            return;
        }

        try {
            await createChannel(channelName);
            setShowSuccess(true);
            setError('');
            setTimeout(() => setShowSuccess(false), 3000);
            setChannelName('');
            setIsOpen(false);
        } catch (error) {
            setError(error.message || 'Failed to create channel');
            setShowSuccess(false);
        }
    };

    return (
        <div className={styles.addChannelContainer}>
            {showSuccess && (
                <div className={styles.successMessage}>
                    Channel created successfully!
                </div>
            )}
            {error && (
                <div className={styles.errorMessage}>
                    {error}
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