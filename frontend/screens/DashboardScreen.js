import React from 'react';

const DashboardScreen = () => {
    return (
        <div>
            <h1>User Dashboard</h1>
            <div>
                <h2>Options</h2>
                <ul>
                    <li><a href="/browse-content">Browse Content</a></li>
                    <li><a href="/profile">Profile</a></li>
                </ul>
            </div>
        </div>
    );
};

export default DashboardScreen;