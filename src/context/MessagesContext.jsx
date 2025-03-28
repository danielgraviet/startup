import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const MessagesContext = createContext();

// --- Determine WebSocket URL ---
// Use Vite's environment variable syntax (import.meta.env)
// Prefixed with VITE_ as required by Vite for client-side exposure.
const wsUrlFromEnv = import.meta.env.VITE_WEBSOCKET_URL;
const defaultWsUrl = 'ws://localhost:4000'; // Fallback for local development

// Choose the correct URL based on environment variable availability
// In production build, wsUrlFromEnv should be set (e.g., "wss://startup.catnipmessaging.click")
// In local development (npm run dev), wsUrlFromEnv will likely be undefined, using the default.
const wsUrl = wsUrlFromEnv || defaultWsUrl;

// Log the URL resolution for debugging during development or checking production build
console.log(`[MessagesContext] Using WebSocket URL: ${wsUrl} (Source: ${wsUrlFromEnv ? 'Environment Variable' : 'Default'})`);

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
        let data; // Define data outside try block for error logging
        try {
             // Log raw data before parsing for debugging potential server issues
             console.log('[WS Message Received Raw]', event.data);
             data = JSON.parse(event.data);
             console.log('[WS Message Parsed]', data);

             if (data.type === 'channelCreated') {
                const newChannel = { ...data.channel, id: data.channel.id || data.channel._id }; // Normalize ID
                setChannels(prev => {
                    if (prev.some(c => c.id === newChannel.id)) {
                        console.log('[WS ChannelCreated] Channel already exists, skipping add:', newChannel.id);
                        return prev;
                    }
                    console.log('[WS ChannelCreated] Adding new channel:', newChannel);
                    return [...prev, newChannel];
                });
                // Initialize messages for the new channel
                setMessages(prev => {
                    console.log(`[WS ChannelCreated] Initializing messages for new channel ${newChannel.id}`);
                    return {
                       ...prev,
                       [newChannel.id]: prev[newChannel.id] || [],
                    };
                });
             } else if (data.type === 'channelDeleted') {
                 const channelId = data.channelId;
                 console.log('[WS ChannelDeleted] Deleting channel:', channelId);

                 // Update channels state first
                 setChannels(prev => prev.filter(channel => channel.id !== channelId));

                 // Check if the *deleted* channel was the *current* one using the Ref
                 if (currentChatRef.current === channelId) {
                     // Use the Ref to get the list of channels *before* this deletion triggered the state update
                     const remainingChannels = channelsRef.current.filter(c => c.id !== channelId);
                     const nextChat = remainingChannels.length > 0 ? remainingChannels[0]?.id : null;
                     console.log(`[WS ChannelDeleted] Current chat ${channelId} deleted, switching to ${nextChat}`);
                     // Update the currentChat state
                     setCurrentChat(nextChat);
                 }

                 // Remove messages for the deleted channel
                 setMessages(prev => {
                     const newMessages = { ...prev };
                     delete newMessages[channelId];
                     console.log(`[WS ChannelDeleted] Removing messages for channel ${channelId}`);
                     return newMessages;
                 });

             } else if (data.type === 'newMessage') {
                 const { channelId, message } = data;
                 if (!channelId || !message) {
                    console.warn('[WS NewMessage] Received invalid newMessage data:', data);
                    return;
                 }
                 console.log('[WS NewMessage] Received for channel: ', channelId, message);

                 // Ensure message has a unique ID from the server (e.g., message._id or message.id)
                 const messageId = message.id || message._id; // Adapt based on your message structure

                 setMessages(prev => {
                    const channelMessages = prev[channelId] || [];
                    // Prevent adding duplicate message by ID if available and valid
                    if (messageId && channelMessages.some(msg => (msg.id || msg._id) === messageId)) {
                        console.log(`[WS NewMessage] Message ${messageId} already exists in channel ${channelId}, skipping.`);
                        return prev; // Return previous state unchanged
                    }
                    // Add the new message
                     console.log(`[WS NewMessage] Adding message ${messageId || '(no id)'} to channel ${channelId}`);
                    return {
                        ...prev,
                        [channelId]: [...channelMessages, message],
                    };
                 });
             } else {
                 console.warn('[WS Unknown Type] Received message with unknown type:', data.type, data);
             }
        } catch (error) {
            console.error("[WS Message Error] Error parsing WebSocket message or updating state:", error);
            console.error("[WS Message Error] Original event data:", event?.data); // Log raw data on error
            console.error("[WS Message Error] Parsed data (if available):", data); // Log parsed data if parse succeeded before error
            // Optionally set an error state for the UI
            // setError("Error processing real-time update.");
        }
    }, []); // Empty dependency array ensures this function reference is stable


    // --- Effect to Fetch Initial Channels ---
    useEffect(() => {
        const fetchChannels = async () => {
            if (!currentUser) {
                setLoading(false); // Ensure loading stops if no user
                return;
            }
            // Avoid refetch if channels are already loaded? Optional optimization.
            // if (channels.length > 0) return;

            try {
                setLoading(true);
                setError(null); // Clear previous errors
                console.log('[API FetchChannels] Fetching from /api/channels');
                const response = await fetch('/api/channels', { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    const normalizedChannels = data.map(channel => ({
                        ...channel,
                        id: channel.id || channel._id, // Use 'id' consistently
                    }));
                    console.log('[API FetchChannels] Received channels:', normalizedChannels);
                    setChannels(normalizedChannels);
                    // Optionally set initial chat if none is set
                    // if (!currentChat && normalizedChannels.length > 0) {
                    //    setCurrentChat(normalizedChannels[0].id);
                    // }
                } else {
                    const errorData = await response.text();
                    console.error('[API FetchChannels] Failed:', response.status, errorData);
                    throw new Error(`Failed to fetch channels (status: ${response.status})`);
                }
            } catch (error) {
                console.error('[API FetchChannels] Error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchChannels();
    }, [currentUser]); // Re-fetch if user changes

    // --- Effect for WebSocket Connection ---
    useEffect(() => {
        if (!currentUser) {
            console.log("[WS Setup] No current user, WebSocket not connecting.");
            return; // Don't connect if not logged in
        }

        // wsUrl is defined outside and derived from env var, stable for the component lifetime
        console.log(`[WS Setup] Attempting WebSocket connection to: ${wsUrl}`);
        let ws; // Declare ws here to be accessible in cleanup

        try {
            // Create the WebSocket instance using the resolved URL
            ws = new WebSocket(wsUrl);
        } catch (error) {
             console.error(`[WS Setup] Error creating WebSocket instance with URL ${wsUrl}:`, error);
             setError(`Failed to establish WebSocket connection. Check console & configuration.`);
             return; // Stop the effect if the constructor fails
        }

        ws.onopen = () => {
            console.log(`[WS Status] WebSocket connected successfully to ${wsUrl}`);
            setError(null); // Clear connection errors on successful open
        };

        ws.onclose = (event) => {
            // Log close event details for debugging unexpected disconnects
            console.log(`[WS Status] WebSocket disconnected from ${wsUrl}. Code: ${event.code}, Reason: '${event.reason || 'No reason given'}', Clean disconnect: ${event.wasClean}`);
             // Optional: Set an error state if the disconnect was unclean
             // if (!event.wasClean) {
             //    setError(`WebSocket disconnected unexpectedly (Code: ${event.code}). Real-time updates stopped.`);
             // }
        };

        ws.onerror = (errorEvent) => {
            // Log the specific error event - this often precedes an onclose event
            console.error(`[WS Status] WebSocket error for connection to ${wsUrl}:`, errorEvent);
            // Update error state to inform the user
            setError('WebSocket connection error. Real-time features may be unavailable. Check console.');
        };

        // Assign the stable message handler function (defined with useCallback)
        ws.onmessage = handleWebSocketMessage;

        // Cleanup function: Close the WebSocket when the component unmounts or dependencies change
        return () => {
            if (ws) {
                 console.log(`[WS Cleanup] Closing WebSocket connection to ${wsUrl}`);
                 // Remove listeners? Usually not needed if ws object is discarded.
                 // ws.onopen = null; ws.onmessage = null; ws.onerror = null; ws.onclose = null;
                 ws.close();
            } else {
                console.log(`[WS Cleanup] No WebSocket instance to close (likely connection failed).`);
            }
        };
        // Dependencies: Reconnect if the user logs in/out.
        // handleWebSocketMessage is stable due to useCallback([]).
        // wsUrl is derived from env vars and doesn't change after initial load, so not needed here.
    }, [currentUser, handleWebSocketMessage]);

    // --- Effect to Fetch Messages for Current Chat ---
    useEffect(() => {
        const fetchMessages = async () => {
            if (!currentChat) {
                console.log('[API FetchMessages] No current chat selected, skipping fetch.');
                // Optionally clear messages or set loading to false if needed
                // setMessagesLoading(false);
                return;
            }

            // Avoid fetching if already loading
            if (messagesLoading) {
                 console.log(`[API FetchMessages] Already loading messages for ${currentChat}, skipping.`);
                 return;
            }

            try {
                setMessagesLoading(true);
                setError(null); // Clear previous errors
                console.log(`[API FetchMessages] Fetching messages for chat ${currentChat} from /api/messages/${currentChat}`);
                const response = await fetch(`/api/messages/${currentChat}`, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    console.log(`[API FetchMessages] Received ${data.length} messages for chat ${currentChat}`);
                    // Set messages ensuring not to overwrite other channels' messages
                    setMessages(prev => ({ ...prev, [currentChat]: data }));
                } else {
                    const errorData = await response.text();
                    console.error(`[API FetchMessages] Failed for chat ${currentChat}:`, response.status, errorData);
                    throw new Error(`Failed to fetch messages (status: ${response.status})`);
                }
            } catch (error) {
                console.error(`[API FetchMessages] Error for chat ${currentChat}:`, error);
                setError(error.message);
                // Clear messages for this chat on error? Or keep stale data? Decide based on UX needs.
                // setMessages(prev => ({ ...prev, [currentChat]: [] }));
            } finally {
                setMessagesLoading(false);
            }
        };
        fetchMessages();
    }, [currentChat]); // Re-fetch when currentChat changes

    // --- Action Functions (Create, Delete, Send) ---
    // These should primarily trigger API calls. State updates ideally come via WebSocket.

    const createChannel = async (name) => {
        if (!currentUser) throw new Error("User not logged in");
        try {
            setError(null); // Clear previous errors
            console.log('[API CreateChannel] Sending POST to /api/channel with name:', name);
            const response = await fetch('/api/channel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, description: '' }),
            });
            if (!response.ok) {
                const data = await response.json();
                console.error('[API CreateChannel] Failed:', response.status, data);
                throw new Error(data.msg || 'Failed to create channel');
            }
            const newChannelData = await response.json();
            const normalizedChannel = { ...newChannelData, id: newChannelData.id || newChannelData._id }; // Normalize ID
            console.log("[API CreateChannel] Success via API, awaiting WebSocket confirmation:", normalizedChannel);
            // Let the WebSocket 'channelCreated' event handle adding the channel to state.
            // Optionally, immediately switch to the new channel optimistically:
            // setCurrentChat(normalizedChannel.id);
            return normalizedChannel.id; // Return ID for potential immediate navigation
        } catch (error) {
            console.error('[API CreateChannel] Error:', error);
            setError(error.message); // Set error state
            throw error; // Re-throw for the calling component
        }
    };

    const deleteChannel = async (channelId) => {
        if (!currentUser) throw new Error("User not logged in");
        try {
            setError(null);
            console.log(`[API DeleteChannel] Sending DELETE to /api/channel/${channelId}`);
            const response = await fetch(`/api/channel/${channelId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) {
                const data = await response.json();
                console.error('[API DeleteChannel] Failed:', response.status, data);
                throw new Error(data.msg || 'Failed to delete channel');
            }
            console.log("[API DeleteChannel] Success via API, awaiting WebSocket confirmation:", channelId);
            // Let the WebSocket 'channelDeleted' event handle state updates (removing channel, messages, switching chat).
        } catch (error) {
            console.error('[API DeleteChannel] Error:', error);
            setError(error.message);
            throw error;
        }
    };

    const sendMessage = async (channelId, content) => {
        if (!currentUser) throw new Error("User not logged in");
        if (!channelId || !content.trim()) throw new Error("Invalid channel or message content");
        try {
            setError(null);
            console.log(`[API SendMessage] Sending POST to /api/messages/${channelId}`);
            const response = await fetch(`/api/messages/${channelId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ content }),
            });
            if (!response.ok) {
                const data = await response.json();
                console.error('[API SendMessage] Failed:', response.status, data);
                throw new Error(data.msg || 'Failed to send message');
            }
            console.log("[API SendMessage] Success via API, awaiting WebSocket confirmation for channel:", channelId);
            // Let the WebSocket 'newMessage' event handle adding the message to state.
            // No optimistic update shown here, but could be added if desired.
        } catch (error) {
            console.error('[API SendMessage] Error:', error);
            setError(error.message);
            throw error;
        }
    };

    // --- Context Provider Value ---
    const value = {
        currentChat,
        setCurrentChat,
        messages,
        channels,
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