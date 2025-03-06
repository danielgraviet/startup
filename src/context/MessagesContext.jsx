import React, { createContext, useContext, useState, useEffect } from 'react';

const MessagesContext = createContext();

export function MessagesProvider({ children }) {
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState({});
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [error, setError] = useState(null);
    const currentUser = localStorage.getItem('currentUser');

    useEffect(() => {
        const fetchChannels = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await fetch('/api/channels', { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    setChannels(data);
                    setError(null);
                } else {
                    throw new Error('Failed to fetch channels');
                }
            } catch (error) {
                console.error('Error fetching channels:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchChannels();
    }, [currentUser]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!currentChat) return;
            try {
                setMessagesLoading(true);
                const response = await fetch(`/api/messages/${currentChat}`, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    setMessages(prev => ({ ...prev, [currentChat]: data }));
                    setError(null);
                } else {
                    throw new Error('Failed to fetch messages');
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
                setError(error.message);
            } finally {
                setMessagesLoading(false);
            }
        };
        fetchMessages();
    }, [currentChat]);

    const createChannel = async (name) => {
        try {
            const response = await fetch('/api/channel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, description: '' }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.msg || 'Failed to create channel');
            }
            const newChannel = await response.json();
            setChannels(prev => [...prev, newChannel]);
            setCurrentChat(newChannel.id);
            setMessages(prev => ({ ...prev, [newChannel.id]: [] }));
            return newChannel.id;
        } catch (error) {
            console.error('Error creating channel:', error);
            throw error;
        }
    };

    const sendMessage = async (channelId, content) => {
        try {
            const response = await fetch(`/api/messages/${channelId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.msg || 'Failed to send message');
            }
            const newMessage = await response.json();
            setMessages(prev => ({
                ...prev,
                [channelId]: [...(prev[channelId] || []), newMessage],
            }));
            setError(null);
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };

    return (
        <MessagesContext.Provider value={{
            currentChat,
            setCurrentChat,
            messages,
            channels,
            createChannel,
            loading,
            messagesLoading,
            error,
            sendMessage,
        }}>
            {children}
        </MessagesContext.Provider>
    );
}

export function useMessages() {
    return useContext(MessagesContext);
}