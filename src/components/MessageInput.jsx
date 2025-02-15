import React, { useState } from 'react';
import { useMessages } from '../context/MessagesContext';
import styles from '../css/messages.module.css';

export function MessageInput() {
    const [message, setMessage] = useState('');
    const { currentChat, sendMessage } = useMessages();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() || !currentChat) return;

        sendMessage(currentChat, message.trim());
        setMessage('');
    };

    return (
        <form onSubmit={handleSubmit} className={styles.messageInputContainer}>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={styles.messageInput}
                placeholder="Type a message..."
            />
            <button type="submit" className={styles.sendButton} disabled={!message.trim()}>
                <img src="/pawIcon.png" alt="Send message" className={styles.sendIcon} />
            </button>
        </form>
    );
} 