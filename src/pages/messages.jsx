import React, { useState, useEffect } from 'react';
import styles from '../css/messages.module.css';
import { useMessages } from '../context/MessagesContext';
import { AddChannel } from '../components/AddChannel';

export function Messages() {
    const { currentChat, setCurrentChat, channels } = useMessages();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true); // Track channel fetch status
    const [error, setError] = useState(null); // Handle fetch errors

    // Filter channels based on search query
    const filteredChannels = channels.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Set initial channel if none selected
    useEffect(() => {
        if (channels.length > 0) {
            if (!currentChat) {
                setCurrentChat(channels[0].id);
            }
            setLoading(false); // Channels loaded
        } else {
            setLoading(false); // No channels yet
        }
    }, [channels, currentChat, setCurrentChat]);

    const handleChannelClick = (channelId) => {
        setCurrentChat(channelId);
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    // Get current channel info
    const currentChannel = channels.find(channel => channel.id === currentChat);

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

                {/* Placeholder for messages (to be implemented later) */}
                <div className={styles.chatMessages}>
                    <p>Select a channel to view messages</p>
                </div>
            </main>

            {/* Right Sidebar */}
            <aside className={styles.infoSidebar}>
                <div className={styles.groupInfo}>
                    <h2>Group Info</h2>

                    <div className={styles.infoSection}>
                        <h3>Members</h3>
                        <div className={styles.memberList}>
                            {currentChannel?.members.map(member => (
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