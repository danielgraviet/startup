import React, { createContext, useContext, useState, useEffect } from 'react';

const MessagesContext = createContext();

export function MessagesProvider({ children }) {
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState({});
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentUser = localStorage.getItem('currentUser');

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/channels', { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    const formattedChannels = data.map((channel, index) => ({
                        id: index + 1,
                        name: channel.name,
                        description: channel.description || '',
                        members: [currentUser],
                        createdAt: new Date().toISOString()
                    }));
                    setChannels(formattedChannels);
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
    }, []);

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
            const data = await response.json();
            const newChannel = {
                id: channels.length + 1,
                name: data.name,
                description: data.description || '',
                members: [currentUser],
                createdAt: new Date().toISOString()
            };
            setChannels(prev => [...prev, newChannel]);
            return newChannel.id;
        } catch (error) {
            console.error('Error creating channel:', error);
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
            error
        }}>
            {children}
        </MessagesContext.Provider>
    );
}

export function useMessages() {
    return useContext(MessagesContext);
}