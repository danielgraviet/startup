import React, { useState, useEffect } from 'react';
import styles from '../css/messages.module.css';
import { useMessages } from '../context/MessagesContext';
import { AddChannel } from '../components/AddChannel';

export function Messages() {
    const {
        currentChat,
        setCurrentChat,
        channels,
        messages,
        loading, // Channels loading
        messagesLoading, // Messages loading
        error,
        sendMessage,
    } = useMessages();
    const [searchQuery, setSearchQuery] = useState('');
    const [messageInput, setMessageInput] = useState(''); // For sending messages

    // Filter channels based on search query
    const filteredChannels = channels.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Set initial channel if none selected
    useEffect(() => {
        if (channels.length > 0 && !currentChat) {
            setCurrentChat(channels[0].id);
        }
    }, [channels, currentChat, setCurrentChat]);

    const handleChannelClick = (channelId) => {
        setCurrentChat(channelId);
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !currentChat) return;
        try {
            await sendMessage(currentChat, messageInput);
            setMessageInput(''); // Clear input after sending
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    // Get current channel info
    const currentChannel = channels.find(channel => channel.id === currentChat);
    const currentMessages = messages[currentChat] || []; // Default to empty array

    return (
        <div className={styles.messagesContainer}>
            {/* Left Sidebar */}
            <aside className={styles.channelsSidebar}>
                <div className={styles.searchContainer}>
                    <input
                        type="search"
                        placeholder="Search channels..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                <div className={styles.channelsList}>
                    <div className={styles.sectionHeader}>
                        <span>All Messages</span>
                        <AddChannel />
                    </div>

                    {loading ? (
                        <div className={styles.loading}>Loading channels...</div>
                    ) : error ? (
                        <div className={styles.error}>Error: {error}</div>
                    ) : filteredChannels.length > 0 ? (
                        <div className={styles.channelButtons}>
                            {filteredChannels.map(channel => (
                                <button
                                    key={channel.id}
                                    className={`${styles.channelButton} ${currentChat === channel.id ? styles.active : ''}`}
                                    onClick={() => handleChannelClick(channel.id)}
                                >
                                    <img src="/cougarIcon.png" alt="Channel icon" className={styles.channelIcon} />
                                    <div className={styles.channelInfo}>
                                        <span className={styles.channelName}>{channel.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : searchQuery ? (
                        <div className={styles.noResults}>
                            No channels found matching "{searchQuery}"
                        </div>
                    ) : (
                        <div className={styles.noResults}>
                            No channels available. Create one to start!
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className={styles.chatArea}>
                <div className={styles.chatHeader}>
                    <div className={styles.chatTitle}>
                        <h1>{currentChannel?.name || 'Select or create a channel'}</h1>
                    </div>
                </div>

                <div className={styles.chatMessages}>
                    {messagesLoading ? (
                        <p>Loading messages...</p>
                    ) : currentChat ? (
                        currentMessages.length > 0 ? (
                            currentMessages.map(message => (
                                <div key={message.id} className={styles.message}>
                                    <span className={styles.messageSender}>{message.sender || 'User'}:</span>
                                    <span className={styles.messageContent}>{message.content}</span>
                                    <span className={styles.messageTimestamp}>
                                        {new Date(message.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p>No messages yet. Start the conversation!</p>
                        )
                    ) : (
                        <p>Select a channel to view messages</p>
                    )}
                </div>

                {/* Message Input */}
                {currentChat && (
                    <form className={styles.messageInputForm} onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type a message..."
                            className={styles.messageInput}
                        />
                        <button type="submit" className={styles.sendButton}>Send</button>
                    </form>
                )}
            </main>

            {/* Right Sidebar */}
            <aside className={styles.infoSidebar}>
                <div className={styles.groupInfo}>
                    <h2>Group Info</h2>

                    <div className={styles.infoSection}>
                        <h3>Members</h3>
                        <div className={styles.memberList}>
                            {currentChannel?.members?.map(member => (
                                <div key={member} className={styles.memberItem}>
                                    <img src="/cougarIcon.png" alt={member} className={styles.memberAvatar} />
                                    <span className={styles.memberName}>{member}</span>
                                </div>
                            )) || <p>No members yet</p>}
                        </div>
                    </div>

                    <div className={styles.infoSection}>
                        <h3>Created</h3>
                        <p className={styles.createdDate}>
                            {currentChannel ? new Date(currentChannel.createdAt).toLocaleDateString() : '-'}
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    );
}