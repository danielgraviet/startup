import React from 'react';

export function Login() {
    return (
        <div className="main-container">
            <div className="content-wrapper">
                <div className="hero-left">
                    <h1 className="hero-title">CatNip Messaging</h1>
                    <p className="hero-subtitle">a place to connect.</p>
                    <div className="action-buttons">
                        <form
                            id="login-form"
                            action="./src/pages/messages.html"
                            method="GET"
                            onSubmit={() => saveUserName()}
                        >
                            <div className="form-group">
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                            <div className="button-group">
                                <button type="submit" className="primary-button">Login</button>
                                <a href="./src/pages/signup.html" className="primary-button">Create Account</a>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="hero-right">
                    <img src="/landingpage.png" alt="CatNip Interface" className="hero-image" />
                </div>

                <div className="footer">
                    <a href="https://github.com/danielgraviet/startup" className="footer-link">GitHub</a>
                </div>
            </div>
        </div>
    );
}