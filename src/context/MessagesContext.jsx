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
                console.log('Fetching channels from /api/channels');
                const response = await fetch('/api/channels', { credentials: 'include' });
                console.log('Fetch channels response:', response.status);
                if (response.ok) {
                    const data = await response.json();
                    const normalizedChannels = data.map(channel => ({
                        ...channel,
                        id: channel._id,
                    }));
                    setChannels(normalizedChannels);
                    console.log("Normalized Channels:", normalizedChannels);
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
                console.log(`Fetching messages from /api/messages/${currentChat}`);
                const response = await fetch(`/api/messages/${currentChat}`, { credentials: 'include' });
                console.log('Fetch messages response:', response.status);
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
            console.log('Creating channel with POST to /api/channel');
            const response = await fetch('/api/channel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, description: '' }),
            });
            console.log('Create channel response:', response.status);
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.msg || 'Failed to create channel');
            }
            const newChannel = await response.json();
            const normalizedChannel = { ...newChannel, id: newChannel.id };
            setChannels(prev => [...prev, normalizedChannel]);
            setCurrentChat(normalizedChannel.id);
            setMessages(prev => ({ ...prev, [normalizedChannel.id]: [] }));
            console.log("New Channel Created:", normalizedChannel);
            return normalizedChannel.id;
        } catch (error) {
            console.error('Error creating channel:', error);
            throw error;
        }
    };

    const deleteChannel = async (channelId) => {
        try {
            console.log(`Sending DELETE request to: /api/channel/${channelId}`);
            const response = await fetch(`/api/channel/${channelId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            console.log('DELETE response status:', response.status);
            console.log('DELETE response headers:', [...response.headers.entries()]);
            if (!response.ok) {
                const data = await response.json();
                console.log('DELETE error response:', data);
                throw new Error(data.msg || 'Failed to delete channel');
            }
            setChannels(prev => prev.filter(channel => channel.id !== channelId));
            if (currentChat === channelId) {
                setCurrentChat(channels.length > 1 ? channels[0].id : null);
            }
            setMessages(prev => {
                const newMessages = { ...prev };
                delete newMessages[channelId];
                return newMessages;
            });
            setError(null);
        } catch (error) {
            console.error('Error deleting channel:', error);
            throw error;
        }
    };

    const sendMessage = async (channelId, content) => {
        try {
            console.log(`Sending POST request to: /api/messages/${channelId}`);
            const response = await fetch(`/api/messages/${channelId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content }),
            });
            console.log('Send message response:', response.status);
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
            deleteChannel,
        }}>
            {children}
        </MessagesContext.Provider>
    );
}

export function useMessages() {
    return useContext(MessagesContext);
}