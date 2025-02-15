import React, { useState } from 'react';
import { useMessages } from '../context/MessagesContext';
import styles from '../css/messages.module.css';

export function AddChannel() {
    const [isOpen, setIsOpen] = useState(false);
    const [channelName, setChannelName] = useState('');
    const { createChannel } = useMessages();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!channelName.trim()) return;

        // Create public channel with empty members array
        createChannel(channelName, []);
        
        // Reset form
        setChannelName('');
        setIsOpen(false);
    };

    return (
        <div className={styles.addChannelContainer}>
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