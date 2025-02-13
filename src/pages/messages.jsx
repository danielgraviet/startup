import React, { useState, useEffect } from 'react';
import styles from '../css/messages.module.css';
import { CatFact } from '../components/catFact';
import { FactAPI } from '../components/factAPI';
export function Messages() {
    const username = localStorage.getItem("username");

    const [fact, setFact] = useState('');

    const fetchFact = () => {
        fetch('https://catfact.ninja/fact')
            .then(response => response.json())
            .then(data => setFact(data.fact))
            .catch(error => console.error('Error fetching fact:', error));
    };

    useEffect(() => {
        fetchFact();
    }, []);

    return (
        <div className={styles.messagesContainer}>
            {/* Left Sidebar */}
            <aside className={styles.channelsSidebar}>
                <div className={styles.searchContainer}>
                    <input type="search" placeholder="Search" className={styles.searchInput} />
                </div>

                <div className={styles.channelsList}>
                    <div className={styles.sectionHeader}>
                        <span>Pinned</span>
                    </div>
                    <button className={`${styles.channelButton} ${styles.active}`}>
                        <img src="/cougarIcon.png" alt="Channel icon" className={styles.channelIcon} />
                        <div className={styles.channelInfo}>
                            <span className={styles.channelName}>BYU 260 TA</span>
                            <span className={styles.channelStatus}>Andrew is typing...</span>
                        </div>
                    </button>

                    <div className={styles.sectionHeader}>
                        <span>All Messages</span>
                    </div>
                    <div className={styles.channelButtons}>
                        <button className={styles.channelButton}>
                            <img src="/catIcon1.png" alt="User avatar" className={styles.channelIcon} />
                            <div className={styles.channelInfo}>
                                <span className={styles.channelName}>Mr. Whiskers</span>
                                <span className={styles.channelStatus}>I see, okay noted i...</span>
                            </div>
                        </button>
                        <button className={styles.channelButton}>
                            <img src="/catIcon2.png" alt="User avatar" className={styles.channelIcon} />
                            <div className={styles.channelInfo}>
                                <span className={styles.channelName}>Lee Jensen</span>
                                <span className={styles.channelStatus}>ok, thanks!</span>
                            </div>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className={styles.chatArea}>
                <div className={styles.chatHeader}>
                    <div className={styles.chatTitle}>
                        <h1>BYU 260 TA</h1>
                    </div>
                </div>

                <div className={styles.chatMessages}>
                    <div className={styles.message}>
                        <img src="/cougarIcon.png" alt="BYU TA" className={styles.messageAvatar} />
                        <div className={styles.messageContent}>
                            <div className={styles.messageHeader}>
                                <span className={styles.messageAuthor}>Andrew (TA)</span>
                                <span className={styles.messageTime}>01:20 AM</span>
                            </div>
                            <p className={styles.messageText}>
                                Hey everyone! Just wanted to kick off the day by saying how excited I am
                                to help with your JavaScript questions!
                            </p>
                        </div>
                    </div>

                    <div className={styles.message}>
                        <img src="/catIcon1.png" alt="Mr. Whiskers" className={styles.messageAvatar} />
                        <div className={styles.messageContent}>
                            <div className={styles.messageHeader}>
                                <span className={styles.messageAuthor}>Mr. Whiskers</span>
                                <span className={styles.messageTime}>01:24 AM</span>
                            </div>
                            <p className={styles.messageText}>
                                Thanks Andrew! I'm having trouble with my Promise implementation. Could
                                you take a look?
                            </p>
                        </div>
                    </div>

                    <div className={styles.message}>
                        <img src="/catIcon2.png" alt="Lee" className={styles.messageAvatar} />
                        <div className={styles.messageContent}>
                            <div className={styles.messageHeader}>
                                <span className={styles.messageAuthor}>Lee Jensen</span>
                                <span className={styles.messageTime}>01:25 AM</span>
                            </div>
                            <p className={styles.messageText}>
                                I've got a similar question about async/await if we have time!
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.messageInputContainer}>
                    <input
                        type="text"
                        className={styles.messageInput}
                        placeholder="Type a message..."
                    />
                    <button className={styles.sendButton}>
                        <img src="/pawIcon.png" alt="Send message" className={styles.sendIcon} />
                    </button>
                </div>
            </main>

            {/* Right Sidebar */}
            <aside className={styles.infoSidebar}>
                <div className={styles.groupInfo}>
                    <h2>Group Info</h2>

                    <div className={styles.infoSection}>
                        <h3>Members</h3>
                        <div className={styles.memberList}>
                            <div className={styles.memberItem}>
                                <img src="/cougarIcon.png" alt="BYU TA" className={styles.memberAvatar} />
                                <span className={styles.memberName}>Andrew (TA)</span>
                            </div>
                            <div className={styles.memberItem}>
                                <img src="/catIcon1.png" alt="Mr. Whiskers" className={styles.memberAvatar} />
                                <span className={styles.memberName}>Mr. Whiskers</span>
                            </div>
                            <div className={styles.memberItem}>
                                <img src="/catIcon2.png" alt="Lee" className={styles.memberAvatar} />
                                <span className={styles.memberName}>Lee Jensen</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.infoSection}>
                        <h3>Created</h3>
                        <p className={styles.createdDate}>March 12, 2024</p>
                    </div>

                    <div className={`${styles.infoSection} ${styles.catFact}`}>
                        <h3>Random Cat Fact</h3>
                        <CatFact />
                    </div>
                    
                        <h3>Random Fact</h3>
                        <FactAPI />
                    
                </div>
            </aside>
        </div>
    );
}