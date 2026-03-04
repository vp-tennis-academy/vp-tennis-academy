import { useRef, useState } from 'react';

const DATA_KEYS = {
    students: 'vp_students',
    expenses: 'vp_expenses',
    feeHistory: 'vp_feeHistory',
    users: 'vp_created_users',
    categories: 'vp_categories',
    builtinPass: 'vp_builtin_passwords',
};

const ALL_RESET_KEYS = Object.values(DATA_KEYS);

function getAdminPassword() {
    try {
        const bp = JSON.parse(localStorage.getItem('vp_builtin_passwords') || '{}');
        return bp['Admin'] || 'Pass1234';
    } catch { return 'Pass1234'; }
}

export default function BackupRestore({ students, expenses, feeHistory }) {
    const fileInputRef = useRef();
    const [restoreMsg, setRestoreMsg] = useState('');
    const [restoreErr, setRestoreErr] = useState('');
    // Reset state
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetPass, setResetPass] = useState('');
    const [resetErr, setResetErr] = useState('');
    const [resetPassVisible, setResetPassVisible] = useState(false);

    // ── Backup: export all data as a JSON file ──
    const handleBackup = () => {
        const backup = {
            exportedAt: new Date().toISOString(),
            version: '1.0',
            students: JSON.parse(localStorage.getItem(DATA_KEYS.students) || '[]'),
            expenses: JSON.parse(localStorage.getItem(DATA_KEYS.expenses) || '[]'),
            feeHistory: JSON.parse(localStorage.getItem(DATA_KEYS.feeHistory) || '[]'),
            users: JSON.parse(localStorage.getItem(DATA_KEYS.users) || '[]'),
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vp_tennis_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Restore: read JSON file and write to localStorage, then reload ──
    const handleRestore = (e) => {
        setRestoreMsg(''); setRestoreErr('');
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = JSON.parse(evt.target.result);
                if (!data.version) throw new Error('Invalid backup file format.');

                if (data.students) localStorage.setItem(DATA_KEYS.students, JSON.stringify(data.students));
                if (data.expenses) localStorage.setItem(DATA_KEYS.expenses, JSON.stringify(data.expenses));
                if (data.feeHistory) localStorage.setItem(DATA_KEYS.feeHistory, JSON.stringify(data.feeHistory));
                if (data.users) localStorage.setItem(DATA_KEYS.users, JSON.stringify(data.users));

                setRestoreMsg(`✅ Backup restored successfully! Exported on: ${new Date(data.exportedAt).toLocaleString('en-IN')}. Reloading...`);
                setTimeout(() => window.location.reload(), 1800);
            } catch (err) {
                setRestoreErr('❌ Failed to restore: ' + err.message);
            }
        };
        reader.readAsText(file);
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    const handleReset = () => {
        if (resetPass !== getAdminPassword()) {
            setResetErr('Incorrect admin password. Please try again.');
            return;
        }
        ALL_RESET_KEYS.forEach(k => localStorage.removeItem(k));
        setShowResetModal(false);
        setTimeout(() => window.location.reload(), 400);
    };

    const statCards = [
        { label: 'Students', value: students.length, icon: '🎾' },
        { label: 'Expenses', value: expenses.length, icon: '💸' },
        { label: 'Fee Transactions', value: feeHistory.length, icon: '💰' },
        { label: 'Custom Users', value: (() => { try { return JSON.parse(localStorage.getItem('vp_created_users') || '[]').length; } catch { return 0; } })(), icon: '👥' },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🔒 Backup & Restore</h1>
                    <p className="page-subtitle">Export your data as a backup file or restore from a previous backup</p>
                </div>
            </div>

            {/* Current Data Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 28 }}>
                {statCards.map(s => (
                    <div key={s.label} className="card" style={{ padding: 16, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: '1.2rem', marginTop: 4 }}>{s.value}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 20 }}>

                {/* ── Backup Card ── */}
                <div className="card" style={{ padding: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#667eea22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            💾
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Create Backup</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Download all data as JSON</div>
                        </div>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: 20 }}>
                        Downloads a <strong style={{ color: '#fff' }}>.json</strong> file containing all your students, expenses, fee history, and created users. Store this safely to restore later.
                    </p>

                    <ul style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.8, marginBottom: 22, paddingLeft: 18 }}>
                        <li>🎾 {students.length} students</li>
                        <li>💸 {expenses.length} expense entries</li>
                        <li>💰 {feeHistory.length} fee transactions</li>
                        <li>👥 {statCards[3].value} custom users</li>
                    </ul>

                    <button
                        onClick={handleBackup}
                        style={{
                            width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}
                    >
                        💾 Download Backup File
                    </button>
                </div>

                {/* ── Restore Card ── */}
                <div className="card" style={{ padding: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#51cf6622', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            📂
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Restore Backup</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Load data from a backup file</div>
                        </div>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: 12 }}>
                        Select a previously downloaded <strong style={{ color: '#fff' }}>.json</strong> backup file to restore all your data. <strong style={{ color: '#ff6b6b' }}>This will overwrite current data.</strong>
                    </p>

                    <div style={{
                        border: '2px dashed rgba(255,255,255,0.15)', borderRadius: 10,
                        padding: '20px', textAlign: 'center', marginBottom: 16, cursor: 'pointer',
                        transition: 'border-color 0.2s',
                    }}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { const dt = new DataTransfer(); dt.items.add(f); fileInputRef.current.files = dt.files; handleRestore({ target: { files: [f], value: '' } }); } }}
                    >
                        <div style={{ fontSize: '2rem', marginBottom: 6 }}>📁</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Click to select or drag & drop backup file</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>.json files only</div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={handleRestore}
                    />

                    {restoreMsg && (
                        <div style={{ background: '#51cf6622', border: '1px solid #51cf66', color: '#51cf66', padding: '10px 14px', borderRadius: 8, fontSize: '13px', marginBottom: 12 }}>
                            {restoreMsg}
                        </div>
                    )}
                    {restoreErr && (
                        <div style={{ background: '#ff6b6b22', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '10px 14px', borderRadius: 8, fontSize: '13px', marginBottom: 12 }}>
                            {restoreErr}
                        </div>
                    )}

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            width: '100%', padding: '12px', borderRadius: '10px',
                            border: '1px solid rgba(81,207,102,0.5)', background: 'transparent',
                            color: '#51cf66', fontWeight: 700, cursor: 'pointer', fontSize: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}
                    >
                        📂 Select Backup File
                    </button>
                </div>
            </div>

            {/* ── Reset Card ── */}
            <div className="card" style={{ marginTop: 20, padding: 28, border: '1px solid rgba(255,77,109,0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#ff4d6d22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        🔄
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ff6b6b' }}>Reset All Data</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Wipe everything and start fresh</div>
                    </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: 18 }}>
                    Permanently deletes <strong style={{ color: '#fff' }}>all students, expenses, fee history, created users, and categories</strong> from this device.
                    Admin password is required. <strong style={{ color: '#ff6b6b' }}>This cannot be undone.</strong>
                </p>
                <button
                    onClick={() => { setShowResetModal(true); setResetPass(''); setResetErr(''); }}
                    style={{
                        padding: '11px 24px', borderRadius: '10px',
                        border: '1px solid #ff6b6b', background: 'transparent',
                        color: '#ff6b6b', fontWeight: 700, cursor: 'pointer', fontSize: '14px',
                        display: 'flex', alignItems: 'center', gap: 8,
                    }}
                >
                    🔄 Reset All Data
                </button>
            </div>

            {/* Warning Note */}
            <div style={{
                marginTop: 24, padding: '14px 18px', borderRadius: 10,
                background: '#ffd43b11', border: '1px solid #ffd43b44',
                color: '#ffd43b', fontSize: '13px', lineHeight: 1.6,
            }}>
                ⚠️ <strong>Important:</strong> Always create a backup before making large changes. Restored data will immediately replace current data and the page will reload.
            </div>

            {/* ── Reset Password Modal ── */}
            {showResetModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#1e2a3a', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', border: '1px solid rgba(255,77,109,0.3)' }}>
                        <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: 10 }}>⚠️</div>
                        <h2 style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: 6 }}>Confirm Reset</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center', marginBottom: 22, lineHeight: 1.6 }}>
                            This will permanently delete <strong style={{ color: '#fff' }}>all data</strong>.<br />
                            Enter the <strong style={{ color: '#fff' }}>Admin password</strong> to proceed.
                        </p>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: 6 }}>Admin Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={resetPassVisible ? 'text' : 'password'}
                                    placeholder="Enter admin password"
                                    value={resetPass}
                                    onChange={e => { setResetPass(e.target.value); setResetErr(''); }}
                                    onKeyDown={e => e.key === 'Enter' && handleReset()}
                                    autoFocus
                                    style={{ width: '100%', padding: '10px 42px 10px 14px', borderRadius: '8px', border: resetErr ? '1px solid #ff6b6b' : '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                                <button onClick={() => setResetPassVisible(v => !v)}
                                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'rgba(255,255,255,0.5)' }}>
                                    {resetPassVisible ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {resetErr && <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: 6 }}>⚠️ {resetErr}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={handleReset}
                                style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#ff4d6d,#c0392b)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                                🔄 Yes, Reset Everything
                            </button>
                            <button onClick={() => setShowResetModal(false)}
                                style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

