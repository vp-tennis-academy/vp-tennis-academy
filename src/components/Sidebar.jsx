import { useEffect } from 'react';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'students', label: 'Students & Fees', icon: '🎾' },
    { id: 'expenses', label: 'Expenses', icon: '💸' },
];

const adminNavItems = [
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'categories', label: 'Categories', icon: '🗂️' },
    { id: 'tournaments', label: 'Tournaments', icon: '🏆' },
    { id: 'advertisements', label: 'Advertisements', icon: '📢' },
    { id: 'offers_news', label: 'Offers & News', icon: '📣' },
    { id: 'stats', label: 'Key Stats', icon: '📈' },
    { id: 'contact', label: 'Contact Info', icon: '📍' },
    { id: 'backup', label: 'Backup & Restore', icon: '🔒' },
];

export default function Sidebar({ active, setActive, mobileOpen, setMobileOpen, user, onLogout, isAdmin }) {
    const handleNav = (id) => {
        setActive(id);
        setMobileOpen(false);
    };

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [setMobileOpen]);

    return (
        <>
            {mobileOpen && (
                <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
            )}

            <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-logo">
                    <span className="logo-icon">🎾</span>
                    <div>
                        <h2>VP Tennis Court</h2>
                        <p>Management Portal</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={active === item.id ? 'active' : ''}
                            onClick={() => handleNav(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                    {isAdmin && adminNavItems.map(item => (
                        <button
                            key={item.id}
                            className={active === item.id ? 'active' : ''}
                            onClick={() => handleNav(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* User info + actions */}
                <div className="sidebar-user">
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-avatar">
                            {user?.username?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="sidebar-user-details">
                            <div className="sidebar-user-name">{user?.username || user?.name}</div>
                            <div className="sidebar-user-role">{user?.role}</div>
                        </div>
                    </div>
                    <button className="sidebar-logout-btn" onClick={onLogout} title="Logout">
                        🚪
                    </button>
                </div>

                <div className="sidebar-footer">
                    <p>© 2026 VP Tennis Court</p>
                </div>
            </aside>
        </>
    );
}

