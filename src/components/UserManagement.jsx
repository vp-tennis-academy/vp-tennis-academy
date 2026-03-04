import { useState, useEffect } from 'react';

const STORAGE_KEY = 'vp_created_users';
const BUILTIN_PASS_KEY = 'vp_builtin_passwords';

const BUILTIN_USERS = [
    { id: 'builtin_admin', username: 'Admin', role: 'admin', createdAt: 'Built-in', builtin: true },
    { id: 'builtin_user', username: 'Username', role: 'user', createdAt: 'Built-in', builtin: true },
];

const DELETED_BUILTINS_KEY = 'vp_deleted_builtins';

function getDeletedBuiltins() {
    try { return JSON.parse(localStorage.getItem(DELETED_BUILTINS_KEY)) || []; } catch { return []; }
}

function getAdminPassword() {
    try {
        const bp = JSON.parse(localStorage.getItem(BUILTIN_PASS_KEY) || '{}');
        return bp['Admin'] || 'Pass1234';
    } catch { return 'Pass1234'; }
}

function getCreatedUsers() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function getBuiltinPasswords() {
    try { return JSON.parse(localStorage.getItem(BUILTIN_PASS_KEY)) || {}; } catch { return {}; }
}

const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff', fontSize: '14px', boxSizing: 'border-box',
};

export default function UserManagement() {
    const [users, setUsers] = useState(getCreatedUsers);
    const [builtinPasswords, setBuiltinPasswords] = useState(getBuiltinPasswords);
    const [deletedBuiltins, setDeletedBuiltins] = useState(getDeletedBuiltins);
    const [success, setSuccess] = useState('');

    // Modals: 'create' | 'edit' | 'password' | null
    const [modal, setModal] = useState(null);
    const [targetUser, setTargetUser] = useState(null);

    // Create form
    const [createForm, setCreateForm] = useState({ username: '', password: '', role: 'user' });
    const [createErr, setCreateErr] = useState('');

    // Edit form
    const [editForm, setEditForm] = useState({ username: '', role: 'user' });
    const [editErr, setEditErr] = useState('');

    // Change password
    const [newPass, setNewPass] = useState('');
    const [passErr, setPassErr] = useState('');
    const [showPass, setShowPass] = useState(false);

    // Delete confirm
    const [deletePass, setDeletePass] = useState('');
    const [deleteErr, setDeleteErr] = useState('');
    const [deletePassVisible, setDeletePassVisible] = useState(false);

    // Show password in table
    const [showPassFor, setShowPassFor] = useState(null);

    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); }, [users]);
    useEffect(() => { localStorage.setItem(BUILTIN_PASS_KEY, JSON.stringify(builtinPasswords)); }, [builtinPasswords]);
    useEffect(() => { localStorage.setItem(DELETED_BUILTINS_KEY, JSON.stringify(deletedBuiltins)); }, [deletedBuiltins]);

    const flash = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 2500); };
    const closeModal = () => {
        setModal(null); setTargetUser(null);
        setCreateErr(''); setEditErr(''); setPassErr(''); setDeleteErr('');
        setNewPass(''); setShowPass(false);
        setDeletePass(''); setDeletePassVisible(false);
    };

    // ── Create ──
    const handleCreate = (e) => {
        e.preventDefault();
        setCreateErr('');
        const username = createForm.username.trim();
        const password = createForm.password.trim();
        if (!username || !password) { setCreateErr('Both fields are required.'); return; }
        if (password.length < 4) { setCreateErr('Password must be at least 4 characters.'); return; }
        if (['admin', 'username'].includes(username.toLowerCase())) { setCreateErr('This username is reserved.'); return; }
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) { setCreateErr('Username already exists.'); return; }

        setUsers(prev => [...prev, { id: Date.now().toString(), username, password, role: createForm.role, createdAt: new Date().toLocaleDateString('en-IN') }]);
        setCreateForm({ username: '', password: '', role: 'user' });
        closeModal();
        flash(`User "${username}" created!`);
    };

    // ── Edit ──
    const openEdit = (u) => {
        setTargetUser(u);
        setEditForm({ username: u.builtin ? u.username : u.username, role: u.role });
        setEditErr('');
        setModal('edit');
    };
    const handleEdit = () => {
        const username = editForm.username.trim();
        if (!username) { setEditErr('Username cannot be empty.'); return; }
        if (!targetUser.builtin) {
            // Check duplicate against others
            const conflict = users.find(u => u.id !== targetUser.id && u.username.toLowerCase() === username.toLowerCase());
            if (conflict) { setEditErr('Username already taken.'); return; }
            if (['admin', 'username'].includes(username.toLowerCase()) && username.toLowerCase() !== targetUser.username.toLowerCase()) {
                setEditErr('That username is reserved.'); return;
            }
            setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, username, role: editForm.role } : u));
            flash(`User updated to "${username}".`);
        } else {
            // Built-in: can only change role (not username)
            flash(`Role updated for ${targetUser.username}.`);
        }
        closeModal();
    };

    // ── Delete ──
    const handleDelete = (id, username, isBuiltin) => {
        // Safety: ensure at least one admin remains
        const remainingAdmins = allUsers.filter(u => u.id !== id && u.role === 'admin');
        if (remainingAdmins.length === 0) {
            alert('Cannot delete the last admin account. Create another admin first.');
            return;
        }
        // Open password-gated confirm modal
        setTargetUser({ id, username, builtin: isBuiltin });
        setDeletePass(''); setDeleteErr(''); setDeletePassVisible(false);
        setModal('delete');
    };

    const confirmDelete = () => {
        if (deletePass !== getAdminPassword()) {
            setDeleteErr('Incorrect admin password.');
            return;
        }
        if (targetUser.builtin) {
            setDeletedBuiltins(prev => [...prev, targetUser.id]);
        } else {
            setUsers(prev => prev.filter(u => u.id !== targetUser.id));
        }
        flash(`User "${targetUser.username}" deleted.`);
        closeModal();
    };

    // ── Change Password ──
    const openChangePass = (u) => { setTargetUser(u); setNewPass(''); setPassErr(''); setShowPass(false); setModal('password'); };
    const handleChangePassword = () => {
        if (!newPass || newPass.length < 4) { setPassErr('Password must be at least 4 characters.'); return; }
        if (targetUser.builtin) {
            setBuiltinPasswords(p => ({ ...p, [targetUser.username]: newPass }));
        } else {
            setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, password: newPass } : u));
        }
        flash(`Password for "${targetUser.username}" updated!`);
        closeModal();
    };

    const allUsers = [
        ...BUILTIN_USERS
            .filter(u => !deletedBuiltins.includes(u.id))
            .map(u => ({
                ...u,
                displayPassword: builtinPasswords[u.username] || 'Pass1234',
            })),
        ...users,
    ];

    const ActionBtn = ({ onClick, color, children }) => (
        <button onClick={onClick} style={{ background: 'none', border: `1px solid ${color}`, color, borderRadius: '6px', padding: '4px 9px', cursor: 'pointer', fontSize: '11px', whiteSpace: 'nowrap' }}>
            {children}
        </button>
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">👥 User Management</h1>
                    <p className="page-subtitle">Create, edit, and manage all portal user accounts</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setCreateForm({ username: '', password: '', role: 'user' }); setCreateErr(''); setModal('create'); }}>
                    + Create User
                </button>
            </div>

            {success && (
                <div style={{ background: '#51cf6622', border: '1px solid #51cf66', color: '#51cf66', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
                    ✅ {success}
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <div><h3>All Users</h3><p>{allUsers.length} total accounts</p></div>
                    <span className="badge badge-accent">{users.length} created</span>
                </div>

                {/* Desktop Table */}
                <div className="table-container mobile-hide">
                    <table className="compact-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Username</th>
                                <th>Password</th>
                                <th>Role</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allUsers.map((u, i) => (
                                <tr key={u.id}>
                                    <td>{i + 1}</td>
                                    <td style={{ fontWeight: 600 }}>
                                        {u.username}
                                        {u.builtin && <span style={{ marginLeft: 6, fontSize: '10px', background: '#667eea33', color: '#667eea', padding: '2px 6px', borderRadius: 4 }}>built-in</span>}
                                    </td>
                                    <td>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                                                {showPassFor === u.id ? (u.displayPassword || u.password) : '••••••••'}
                                            </span>
                                            <button onClick={() => setShowPassFor(showPassFor === u.id ? null : u.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: 0 }}>
                                                {showPassFor === u.id ? '🙈' : '👁️'}
                                            </button>
                                        </span>
                                    </td>
                                    <td><span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-accent'}`}>{u.role}</span></td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{u.createdAt}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                            <ActionBtn onClick={() => openEdit(u)} color="#667eea">✏️ Edit</ActionBtn>
                                            <ActionBtn onClick={() => openChangePass(u)} color="#ffd43b">🔑 Password</ActionBtn>
                                            <ActionBtn onClick={() => handleDelete(u.id, u.username, u.builtin)} color="#ff6b6b">🗑️ Delete</ActionBtn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="card-list mobile-only">
                    {allUsers.map(u => (
                        <div className="item-card" key={u.id}>
                            <div className="item-card-header">
                                <div className="item-card-title">
                                    {u.username}
                                    {u.builtin && <span style={{ marginLeft: 6, fontSize: '10px', background: '#667eea33', color: '#667eea', padding: '2px 6px', borderRadius: 4 }}>built-in</span>}
                                </div>
                                <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-accent'}`}>{u.role}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                                <button onClick={() => openEdit(u)} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: '1px solid #667eea', background: 'transparent', color: '#667eea', cursor: 'pointer', fontSize: '12px' }}>✏️ Edit</button>
                                <button onClick={() => openChangePass(u)} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: '1px solid #ffd43b', background: 'transparent', color: '#ffd43b', cursor: 'pointer', fontSize: '12px' }}>🔑 Password</button>
                                <button onClick={() => handleDelete(u.id, u.username, u.builtin)} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: '1px solid #ff6b6b', background: 'transparent', color: '#ff6b6b', cursor: 'pointer', fontSize: '12px' }}>🗑️ Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Shared Modal Shell ── */}
            {modal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#1e2a3a', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>

                        {/* ── CREATE ── */}
                        {modal === 'create' && (
                            <>
                                <h2 style={{ color: '#fff', marginBottom: 6 }}>👤 Create New User</h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: 20 }}>User can log in immediately with these credentials.</p>
                                <form onSubmit={handleCreate}>
                                    <div style={{ marginBottom: 14 }}>
                                        <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', display: 'block', marginBottom: 6 }}>Username</label>
                                        <input type="text" placeholder="Enter username" value={createForm.username} onChange={e => setCreateForm(p => ({ ...p, username: e.target.value }))} required style={inputStyle} autoFocus />
                                    </div>
                                    <div style={{ marginBottom: 14 }}>
                                        <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', display: 'block', marginBottom: 6 }}>Password</label>
                                        <input type="text" placeholder="Min 4 characters" value={createForm.password} onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} required style={inputStyle} />
                                    </div>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', display: 'block', marginBottom: 6 }}>Role</label>
                                        <select value={createForm.role} onChange={e => setCreateForm(p => ({ ...p, role: e.target.value }))} style={{ ...inputStyle, background: '#1e2a3a' }}>
                                            <option value="user">User (read-only access)</option>
                                            <option value="admin">Admin (full access)</option>
                                        </select>
                                    </div>
                                    {createErr && <div style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: 12 }}>⚠️ {createErr}</div>}
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button type="submit" style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>✅ Create</button>
                                        <button type="button" onClick={closeModal} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* ── EDIT ── */}
                        {modal === 'edit' && targetUser && (
                            <>
                                <h2 style={{ color: '#fff', marginBottom: 6 }}>✏️ Edit User</h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: 20 }}>Update username or role for this account.</p>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', display: 'block', marginBottom: 6 }}>
                                        Username {targetUser.builtin && <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>(built-in — cannot change)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.username}
                                        onChange={e => setEditForm(p => ({ ...p, username: e.target.value }))}
                                        disabled={targetUser.builtin}
                                        style={{ ...inputStyle, opacity: targetUser.builtin ? 0.4 : 1 }}
                                        autoFocus={!targetUser.builtin}
                                    />
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', display: 'block', marginBottom: 6 }}>Role</label>
                                    <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} style={{ ...inputStyle, background: '#1e2a3a' }}>
                                        <option value="user">User (read-only access)</option>
                                        <option value="admin">Admin (full access)</option>
                                    </select>
                                </div>
                                {editErr && <div style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: 12 }}>⚠️ {editErr}</div>}
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={handleEdit} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>✅ Save Changes</button>
                                    <button onClick={closeModal} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                                </div>
                            </>
                        )}

                        {/* ── CHANGE PASSWORD ── */}
                        {modal === 'password' && targetUser && (
                            <>
                                <h2 style={{ color: '#fff', marginBottom: 6 }}>🔑 Change Password</h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: 20 }}>
                                    For: <strong style={{ color: '#fff' }}>{targetUser.username}</strong>
                                </p>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', display: 'block', marginBottom: 6 }}>New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            placeholder="Min 4 characters"
                                            value={newPass}
                                            onChange={e => { setNewPass(e.target.value); setPassErr(''); }}
                                            onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
                                            style={{ ...inputStyle, paddingRight: 42 }}
                                            autoFocus
                                        />
                                        <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'rgba(255,255,255,0.5)' }}>
                                            {showPass ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                    {passErr && <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: 6 }}>⚠️ {passErr}</div>}
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={handleChangePassword} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>✅ Save</button>
                                    <button onClick={closeModal} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                                </div>
                            </>
                        )}

                        {/* ── DELETE CONFIRM ── */}
                        {modal === 'delete' && targetUser && (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                                    <div style={{ fontSize: '2.5rem' }}>🗑️</div>
                                    <h2 style={{ color: '#ff6b6b', marginBottom: 4 }}>Delete User</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', lineHeight: 1.6 }}>
                                        You are about to delete <strong style={{ color: '#fff' }}>"{targetUser.username}"</strong>.<br />
                                        Enter the <strong style={{ color: '#fff' }}>Admin password</strong> to confirm.
                                    </p>
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', display: 'block', marginBottom: 6 }}>Admin Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={deletePassVisible ? 'text' : 'password'}
                                            placeholder="Enter admin password"
                                            value={deletePass}
                                            onChange={e => { setDeletePass(e.target.value); setDeleteErr(''); }}
                                            onKeyDown={e => e.key === 'Enter' && confirmDelete()}
                                            style={{ ...inputStyle, paddingRight: 42, border: deleteErr ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.2)' }}
                                            autoFocus
                                        />
                                        <button onClick={() => setDeletePassVisible(v => !v)}
                                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'rgba(255,255,255,0.5)' }}>
                                            {deletePassVisible ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                    {deleteErr && <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: 6 }}>⚠️ {deleteErr}</div>}
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={confirmDelete}
                                        style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#ff4d6d,#c0392b)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                                        🗑️ Confirm Delete
                                    </button>
                                    <button onClick={closeModal}
                                        style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
