import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const MessagesContext = createContext();

export function MessagesProvider({ children }) {
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState({});
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [error, setError] = useState(null);
    // Ensure currentUser is fetched appropriately or passed down if needed elsewhere
    const currentUser = localStorage.getItem('currentUser'); // Or manage via state/props

    // --- Refs to hold latest state for WebSocket handler ---
    const currentChatRef = useRef(currentChat);
    const channelsRef = useRef(channels);
    const messagesRef = useRef(messages); // Keep if needed, e.g., complex logic within handler

    // --- Effects to keep Refs updated ---
    useEffect(() => {
        currentChatRef.current = currentChat;
    }, [currentChat]);

    useEffect(() => {
        channelsRef.current = channels;
    }, [channels]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // --- Stable WebSocket Message Handler using useCallback and Refs ---
    const handleWebSocketMessage = useCallback((event) => {
        try {
             const data = JSON.parse(event.data);
             console.log('WebSocket message received:', data);

             if (data.type === 'channelCreated') {
                const newChannel = { ...data.channel, id: data.channel.id }; // Assuming server sends id/_id consistently
                setChannels(prev => {
                    if (prev.some(c => c.id === newChannel.id)) {
                        console.log('Channel already exists, skipping add:', newChannel.id);
                        return prev;
                    }
                    console.log('Adding new channel:', newChannel);
                    return [...prev, newChannel];
                });
                // Initialize messages for the new channel
                setMessages(prev => ({
                    ...prev,
                    [newChannel.id]: prev[newChannel.id] || [],
                }));
             } else if (data.type === 'channelDeleted') {
                 const channelId = data.channelId;
                 console.log('Deleting channel:', channelId);

                 // Update channels state first
                 setChannels(prev => prev.filter(channel => channel.id !== channelId));

                 // Check if the *deleted* channel was the *current* one using the Ref
                 if (currentChatRef.current === channelId) {
                     // Use the Ref to get the list of channels *before* this deletion triggered the state update
                     // Filter *that* list to find remaining channels
                     const remainingChannels = channelsRef.current.filter(c => c.id !== channelId);
                     const nextChat = remainingChannels.length > 0 ? remainingChannels[0]?.id : null;
                     console.log(`Current chat ${channelId} deleted, switching to ${nextChat}`);
                     // Update the currentChat state
                     setCurrentChat(nextChat);
                 }

                 // Remove messages for the deleted channel
                 setMessages(prev => {
                     const newMessages = { ...prev };
                     delete newMessages[channelId];
                     return newMessages;
                 });

             } else if (data.type === 'newMessage') {
                 const { channelId, message } = data;
                 if (!channelId || !message) {
                    console.warn('Received invalid newMessage data:', data);
                    return;
                 }
                 console.log('New message received for channel: ', channelId, message);

                 // Ensure message has a unique ID from the server (e.g., message._id or message.id)
                 const messageId = message.id || message._id; // Adapt based on your message structure

                 setMessages(prev => {
                    const channelMessages = prev[channelId] || [];
                    // Prevent adding duplicate message by ID if available and valid
                    if (messageId && channelMessages.some(msg => (msg.id || msg._id) === messageId)) {
                        console.log(`Message ${messageId} already exists in channel ${channelId}, skipping.`);
                        return prev; // Return previous state unchanged
                    }
                    // Add the new message
                    return {
                        ...prev,
                        [channelId]: [...channelMessages, message],
                    };
                 });
             }
        } catch (error) {
            console.error("Error parsing WebSocket message or updating state:", error, event.data);
        }
        // IMPORTANT: Empty dependency array means this function definition itself never changes.
        // It relies on the Refs being updated by their own useEffects to get fresh state.
    }, []);


    // --- Effect to Fetch Initial Channels ---
    useEffect(() => {
        const fetchChannels = async () => {
            // Optional: Check if channels are already loaded or if currentUser exists
            if (!currentUser || channels.length > 0) {
                 // setLoading(false); // Consider if loading state needs adjustment here
                return;
            }
            try {
                setLoading(true);
                console.log('Fetching channels from /api/channels');
                const response = await fetch('/api/channels', { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    // Normalize channel ID, ensure it matches WebSocket 'id' field
                    const normalizedChannels = data.map(channel => ({
                        ...channel,
                        id: channel.id || channel._id, // Use 'id' consistently
                    }));
                    setChannels(normalizedChannels);
                    // Maybe set initial currentChat here if not set?
                    // if (!currentChat && normalizedChannels.length > 0) {
                    //    setCurrentChat(normalizedChannels[0].id);
                    // }
                    setError(null);
                } else {
                    const errorData = await response.text(); // Get more error details
                    console.error('Failed to fetch channels:', response.status, errorData);
                    throw new Error(`Failed to fetch channels (status: ${response.status})`);
                }
            } catch (error) {
                console.error('Error fetching channels:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchChannels();
        // Dependency: Re-fetch if currentUser changes (e.g., on login/logout)
        // Or keep empty [] if channels should only be fetched once per provider mount
    }, [currentUser]); // Adjust dependency as needed

    // --- Effect for WebSocket Connection ---
    useEffect(() => {
        // Only establish connection if user is logged in (optional but good practice)
        if (!currentUser) {
            console.log("No current user, WebSocket not connecting.");
            return;
        }

        console.log('Setting up WebSocket connection...');
        const ws = new WebSocket('ws://localhost:4000'); // Use env variable for URL in production

        ws.onopen = () => console.log('WebSocket connected');
        ws.onclose = () => console.log('WebSocket disconnected');
        ws.onerror = (err) => console.error('WebSocket error:', err);

        // Assign the stable message handler function
        ws.onmessage = handleWebSocketMessage;

        // Cleanup function runs ONLY on component unmount (or if currentUser changes causing reconnect)
        return () => {
            console.log('Closing WebSocket connection (on unmount or user change)');
            ws.close();
        };
        // Dependency: Connect only once, or reconnect if user changes
    }, [currentUser, handleWebSocketMessage]); // handleWebSocketMessage is stable due to useCallback([])

    // --- Effect to Fetch Messages for Current Chat ---
    useEffect(() => {
        const fetchMessages = async () => {
            // Don't fetch if no chat is selected or if messages for this chat are already loaded/loading
            if (!currentChat || messagesLoading) return;

            // Optional: Check if messages for currentChat already exist
            // if(messages[currentChat] && messages[currentChat].length > 0) {
            //     console.log(`Messages for ${currentChat} already likely loaded.`);
            //     return;
            // }

            try {
                setMessagesLoading(true);
                console.log(`Fetching messages from /api/messages/${currentChat}`);
                const response = await fetch(`/api/messages/${currentChat}`, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    // Set messages ensuring not to overwrite other channels' messages
                    setMessages(prev => ({ ...prev, [currentChat]: data }));
                    setError(null);
                } else {
                    const errorData = await response.text();
                    console.error('Failed to fetch messages:', response.status, errorData);
                    throw new Error(`Failed to fetch messages (status: ${response.status})`);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
                setError(error.message);
                // Clear messages for this chat on error? Or keep stale data?
                // setMessages(prev => ({ ...prev, [currentChat]: [] }));
            } finally {
                setMessagesLoading(false);
            }
        };
        fetchMessages();
    }, [currentChat]); // Re-fetch when currentChat changes

    // --- Action Functions (Create, Delete, Send) ---

    const createChannel = async (name) => {
        if (!currentUser) throw new Error("User not logged in");
        try {
            console.log('Creating channel with POST to /api/channel');
            const response = await fetch('/api/channel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, description: '' }), // Add description if needed
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.msg || 'Failed to create channel');
            }
            const newChannelData = await response.json();
             // Ensure ID consistency
            const normalizedChannel = { ...newChannelData, id: newChannelData.id || newChannelData._id };

            // IMPORTANT: Let the WebSocket 'channelCreated' event handle adding the channel
            // to state to avoid race conditions/duplicates. Just return the ID.
            console.log("Channel creation initiated via API, awaiting WebSocket confirmation:", normalizedChannel);
            // Optionally, immediately switch to the new channel optimisticallly
            // setCurrentChat(normalizedChannel.id);
            return normalizedChannel.id;
        } catch (error) {
            console.error('Error creating channel:', error);
            setError(error.message); // Set error state
            throw error; // Re-throw for the calling component
        }
    };

    const deleteChannel = async (channelId) => {
        if (!currentUser) throw new Error("User not logged in");
        try {
            console.log(`Sending DELETE request to: /api/channel/${channelId}`);
            const response = await fetch(`/api/channel/${channelId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.msg || 'Failed to delete channel');
            }
            // IMPORTANT: Let the WebSocket 'channelDeleted' event handle removing the channel
            // and messages from state, and switching currentChat if necessary.
            console.log("Channel deletion initiated via API, awaiting WebSocket confirmation:", channelId);
            setError(null);
        } catch (error) {
            console.error('Error deleting channel:', error);
            setError(error.message);
            throw error;
        }
    };

    const sendMessage = async (channelId, content) => {
        if (!currentUser) throw new Error("User not logged in");
        if (!channelId || !content.trim()) throw new Error("Invalid channel or message content");
        try {
            console.log(`Sending POST request to: /api/messages/${channelId}`);
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
            // IMPORTANT: Let the WebSocket 'newMessage' event handle adding the message
            // to the state to avoid duplicates if the server broadcasts it back.
            // const newMessageData = await response.json();
            console.log("Message sent via API, awaiting WebSocket confirmation for channel:", channelId);
            setError(null);
            // Optional: Optimistic update (add message immediately, maybe with a 'sending' state)
            // const optimisticMessage = { id: Date.now(), content, userId: currentUser, timestamp: new Date().toISOString(), status: 'sending' }; // Example
            // setMessages(prev => ({
            //     ...prev,
            //     [channelId]: [...(prev[channelId] || []), optimisticMessage],
            // }));

        } catch (error) {
            console.error('Error sending message:', error);
            setError(error.message);
            throw error;
        }
    };

    // --- Context Provider Value ---
    const value = {
        currentChat,
        setCurrentChat, // Allow components to change the chat
        messages,       // The object containing messages per channel
        channels,       // The list of channels
        createChannel,
        deleteChannel,
        sendMessage,
        loading,        // Loading state for initial channels fetch
        messagesLoading,// Loading state for fetching messages of currentChat
        error,          // Any error message
    };

    return (
        <MessagesContext.Provider value={value}>
            {children}
        </MessagesContext.Provider>
    );
}

// --- Custom Hook to use the Context ---
export function useMessages() {
    const context = useContext(MessagesContext);
    if (context === undefined) {
        throw new Error('useMessages must be used within a MessagesProvider');
    }
    return context;
}