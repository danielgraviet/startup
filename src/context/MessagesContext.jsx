// this is to manage and share messaging data like messages and channels throughout the app

import React, { createContext, useContext, useState, useEffect } from 'react';

const MessagesContext = createContext();

export function MessagesProvider({ children }) {
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState({});
    const [channels, setChannels] = useState([]);
    const currentUser = localStorage.getItem('currentUser');

    // Load initial data
    useEffect(() => {
        const savedMessages = JSON.parse(localStorage.getItem('messages') || '{}');
        const savedChannels = JSON.parse(localStorage.getItem('channels') || '[]');
        setMessages(savedMessages);
        setChannels(savedChannels);
    }, []);

    // Save messages when they change
    useEffect(() => {
        localStorage.setItem('messages', JSON.stringify(messages));
    }, [messages]);

    const sendMessage = (channelId, content) => {
        const newMessage = {
            id: Date.now(),
            sender: currentUser,
            content,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => ({
            ...prev,
            [channelId]: [...(prev[channelId] || []), newMessage]
        }));
    };

    const createChannel = (name, members) => {
        const newChannel = {
            id: Date.now(),
            name,
            members: [...members, currentUser],
            createdAt: new Date().toISOString(),
        };

        setChannels(prev => [...prev, newChannel]);
        return newChannel.id;
    };

    return (
        <MessagesContext.Provider value={{
            currentChat,
            setCurrentChat,
            messages,
            channels,
            sendMessage,
            createChannel
        }}>
            {children}
        </MessagesContext.Provider>
    );
}

export function useMessages() {
    return useContext(MessagesContext);
} 