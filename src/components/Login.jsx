import { useState } from 'react';
export default function Login({ onBack }) {
    const [role, setRole] = useState('user'); // Default to user login
    const [form, setForm] = useState({ username: '', password: '', recoveryEmail: '', recoveryPhone: '', otp: '', newPassword: '' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [showOtpField, setShowOtpField] = useState(false);
    const [showNewPasswordField, setShowNewPasswordField] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Check for overridden built-in passwords first
        const builtinPasswords = JSON.parse(localStorage.getItem('vp_builtin_passwords') || '{}');
        const deletedBuiltins = JSON.parse(localStorage.getItem('vp_deleted_builtins') || '[]');
        const adminPass = builtinPasswords['Admin'] || 'Pass1234';
        const userPass = builtinPasswords['Username'] || 'Pass1234';

        // Built-in Admin bypass (only if not deleted)
        if (form.username === 'Admin' && form.password === adminPass && !deletedBuiltins.includes('builtin_admin')) {
            localStorage.setItem('vp_mock_user', JSON.stringify({ name: 'Admin', role: 'admin' }));
            window.location.reload();
            return;
        }

        // Built-in User bypass (only if not deleted)
        if (form.username === 'Username' && form.password === userPass && !deletedBuiltins.includes('builtin_user')) {
            localStorage.setItem('vp_mock_user', JSON.stringify({ name: 'Username', role: 'user' }));
            window.location.reload();
            return;
        }

        // Check admin-created users from localStorage
        try {
            const createdUsers = JSON.parse(localStorage.getItem('vp_created_users') || '[]');
            const match = createdUsers.find(
                u => u.username.toLowerCase() === form.username.toLowerCase() && u.password === form.password
            );
            if (match) {
                localStorage.setItem('vp_mock_user', JSON.stringify({ name: match.username, role: match.role }));
                window.location.reload();
                return;
            }
        } catch { /* ignore */ }

        // Fallback for invalid credentials
        setTimeout(() => {
            setError('Invalid username or password.');
            setLoading(false);
        }, 800);
    };


    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!form.recoveryEmail && !form.recoveryPhone) {
            setError('Please provide either an email address or a phone number.');
            return;
        }

        setLoading(true);

        try {
            if (form.recoveryEmail) {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(form.recoveryEmail, {
                    redirectTo: `${window.location.origin}/reset-password`,
                });
                if (resetError) throw resetError;
                setMessage('Recovery link sent to your email!');
            } else if (form.recoveryPhone) {
                const { error: resetError } = await supabase.auth.signInWithOtp({
                    phone: form.recoveryPhone,
                    options: { channel: 'whatsapp' },
                });
                if (resetError) throw resetError;
                setMessage('A 6-digit WhatsApp code has been sent!');
                setShowOtpField(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const { error: verifyError } = await supabase.auth.verifyOtp({
                phone: form.recoveryPhone,
                token: form.otp,
                type: 'sms',
            });
            if (verifyError) throw verifyError;
            setMessage('Code verified! Please set a new password.');
            setShowOtpField(false);
            setShowNewPasswordField(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({ password: form.newPassword });
            if (updateError) throw updateError;
            window.location.reload(); // Reload to activate the new session in App.jsx
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNewPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!form.username || !form.newPassword) {
            setError('Please provide your username and new password.');
            return;
        }

        setLoading(true);

        // Mock password creation/reset for direct UI flow
        setTimeout(() => {
            setMessage('Password successfully created! You can now log in.');
            setLoading(false);
        }, 1000);
    };

    if (isForgotPassword) {
        return (
            <div className="login-page">
                <div className="login-bg-circle login-bg-circle-1" />
                <div className="login-bg-circle login-bg-circle-2" />
                <div className="login-bg-circle login-bg-circle-3" />

                <div className="login-wrapper">
                    <div className="login-brand-panel">
                        <img src="/logo.png" alt="VP Tennis Court Logo" className="login-logo-img" />
                        <h1 className="login-brand-name">VP Tennis Court</h1>
                        <p className="login-brand-sub">Premium Academy Management</p>
                    </div>

                    <div className="login-card" style={{ position: 'relative' }}>
                        {onBack && (
                            <button onClick={onBack} title="Close" style={{
                                position: 'absolute', top: '14px', right: '14px',
                                width: '30px', height: '30px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                                fontSize: '16px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', lineHeight: 1,
                                transition: 'background .2s, color .2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,80,80,0.25)'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                            >
                                ✕
                            </button>
                        )}
                        <div className="login-card-header">
                            <h2>Create a new password</h2>
                            <p>Enter your account username and a new password</p>
                        </div>

                        <form className="login-form" onSubmit={handleCreateNewPassword}>
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    value={form.username}
                                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    value={form.newPassword}
                                    onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                                    required
                                    minLength={6}
                                />
                            </div>

                            {error && <div className="login-error">⚠️ {error}</div>}
                            {message && <div className="login-success">✅ {message}</div>}

                            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
                                {loading ? <span className="login-spinner" /> : 'Create Password'}
                            </button>

                            <button
                                type="button"
                                className="login-back-btn"
                                onClick={() => {
                                    setIsForgotPassword(false);
                                    setError('');
                                    setMessage('');
                                }}
                            >
                                ← Back to Login
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-bg-circle login-bg-circle-1" />
            <div className="login-bg-circle login-bg-circle-2" />
            <div className="login-bg-circle login-bg-circle-3" />

            <div className="login-wrapper">
                <div className="login-brand-panel">
                    <img src="/logo.png" alt="VP Tennis Court Logo" className="login-logo-img" />
                    <h1 className="login-brand-name">VP Tennis Court</h1>
                    <p className="login-brand-sub">Premium Academy Management</p>
                    <div className="login-brand-features">
                        <div className="login-feature">📊 Real-time Dashboard</div>
                        <div className="login-feature">🎾 Student &amp; Fee Tracking</div>
                        <div className="login-feature">💸 Expense Management</div>
                    </div>
                </div>

                <div className="login-card" style={{ position: 'relative' }}>
                    {onBack && (
                        <button onClick={onBack} title="Close" style={{
                            position: 'absolute', top: '14px', right: '14px',
                            width: '30px', height: '30px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                            fontSize: '16px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', lineHeight: 1,
                            transition: 'background .2s, color .2s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,80,80,0.25)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                        >
                            ✕
                        </button>
                    )}
                    <div className="login-card-header">
                        <h2>Welcome Back</h2>
                        <p>Sign in to your account to continue</p>
                    </div>

                    <div className="login-tabs">
                        <button
                            className={`login-tab ${role === 'admin' ? 'active' : ''}`}
                            onClick={() => setRole('admin')}
                        >
                            Admin Access
                        </button>
                        <button
                            className={`login-tab ${role === 'user' ? 'active' : ''}`}
                            onClick={() => setRole('user')}
                        >
                            User Access
                        </button>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={form.username}
                                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    autoComplete="current-password"
                                    style={{ paddingRight: 46, width: '100%' }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(p => !p)}
                                    className="login-eye-btn"
                                >
                                    {showPass ? '🙈' : '👁️'}
                                </button>
                            </div>

                        </div>

                        {error && <div className="login-error">⚠️ {error}</div>}

                        <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
                            {loading ? <span className="login-spinner" /> : 'Continue'}
                        </button>

                        <button
                            type="button"
                            className="login-forgot-link"
                            style={{ marginTop: '12px', width: '100%', textAlign: 'center', display: 'block' }}
                            onClick={() => {
                                setIsForgotPassword(true);
                                setError('');
                                setMessage('');
                            }}
                        >
                            🔑 Change Password
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}
