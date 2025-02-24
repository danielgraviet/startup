import React, { useState } from 'react';
import styles from '../css/messages.module.css';
import { CatFact } from '../components/catFact';
import { useMessages } from '../context/MessagesContext';
import { MessageInput } from '../components/MessageInput';
import { AddChannel } from '../components/AddChannel';

export function Messages() {
    const {
        currentChat,
        setCurrentChat,
        messages,
        channels
    } = useMessages();
    const currentUser = localStorage.getItem('currentUser');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter channels based on search query
    const filteredChannels = channels.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Set initial channel if none selected
    React.useEffect(() => {
        if (!currentChat && channels.length > 0) {
            setCurrentChat(channels[0].id);
        }
    }, [channels, currentChat, setCurrentChat]);

    const handleChannelClick = (channelId) => {
        setCurrentChat(channelId);
    };

    // Get current channel info
    const currentChannel = channels.find(channel => channel.id === currentChat);
    const currentMessages = messages[currentChat] || [];

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

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
                                    <span className={styles.channelStatus}>
                                        {messages[channel.id]?.[messages[channel.id].length - 1]?.content.substring(0, 20) + '...'}
                                    </span>
                                </div>
                            </button>
                        ))}
                        {filteredChannels.length === 0 && searchQuery && (
                            <div className={styles.noResults}>
                                No channels found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className={styles.chatArea}>
                <div className={styles.chatHeader}>
                    <div className={styles.chatTitle}>
                        {/* this is conditional rendering for the chat title, the ? checks if it is false. */}
                        <h1>{currentChannel?.name || 'Select or create a channel'}</h1>
                    </div>
                </div>

                <div className={styles.chatMessages}>
                    {currentMessages.map(message => (
                        <div
                            key={message.id}
                            className={`${styles.message} ${message.sender === currentUser ? styles.ownMessage : ''}`}
                        >
                            <img src="/cougarIcon.png" alt={message.sender} className={styles.messageAvatar} />
                            <div className={styles.messageContent}>
                                <div className={styles.messageHeader}>
                                    <span className={styles.messageAuthor}>{message.sender}</span>
                                    <span className={styles.messageTime}>
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className={styles.messageText}>{message.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <MessageInput />
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
                            ))}
                        </div>
                    </div>

                    <div className={styles.infoSection}>
                        <h3>Created</h3>
                        <p className={styles.createdDate}>
                            {currentChannel ? new Date(currentChannel.createdAt).toLocaleDateString() : '-'}
                        </p>
                    </div>

                    <div className={`${styles.infoSection} ${styles.catFact}`}>
                        <h3>Random Cat Fact</h3>
                        <CatFact />
                    </div>
                </div>
            </aside>
        </div>
    );
}