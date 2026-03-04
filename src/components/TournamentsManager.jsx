import { useState, useEffect } from 'react';
import { fetchTournaments, saveTournaments } from '../firebaseData';

const DEFAULT_TOURNAMENTS = [
    { id: 1, name: 'VP Tennis Open Championship', date: '2026-03-20', time: '09:00', venue: 'Main Court', type: 'Singles', category: 'Open', prize: '25000', match: 'Rahul Sharma vs Arjun Mehta' },
    { id: 2, name: 'Inter-Academy Doubles Cup', date: '2026-03-22', time: '10:30', venue: 'Court 2', type: 'Doubles', category: 'U-18', prize: '15000', match: 'Team Alpha vs Team Beta' },
    { id: 3, name: 'Spring Junior Series', date: '2026-03-28', time: '08:00', venue: 'Court 1', type: 'Singles', category: 'U-14', prize: '10000', match: 'Multiple Round Matches' },
    { id: 4, name: 'City Grand Slam Qualifier', date: '2026-04-05', time: '09:00', venue: 'Main Court', type: 'Singles', category: 'Pro / Open', prize: '50000', match: 'Qualification Rounds' },
];



const EMPTY = { name: '', date: '', time: '', venue: '', type: 'Singles', category: 'Open', prize: '', match: '' };

const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px' };
const inp = { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none' };
const label = { color: 'rgba(255,255,255,0.65)', fontSize: 12, display: 'block', marginBottom: 5 };

function getDaysLeft(d) { return Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000)); }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

export default function TournamentsManager() {
    const [items, setItems] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        fetchTournaments().then(data => {
            if (data) setItems(data);
            else setItems(DEFAULT_TOURNAMENTS);
            setIsLoaded(true);
        });
    }, []);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isLoaded) saveTournaments(items).catch(err => console.error("Failed to save tournaments:", err));
    }, [items, isLoaded]);
    const flash = m => { setSuccess(m); setTimeout(() => setSuccess(''), 2500); };
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const openNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
    const openEdit = t => { setForm({ ...t }); setEditId(t.id); setShowForm(true); };
    const cancel = () => { setShowForm(false); setEditId(null); setForm(EMPTY); };

    const save = () => {
        if (!form.name || !form.date) return;
        if (editId) {
            setItems(p => p.map(t => t.id === editId ? { ...form, id: editId } : t));
            flash('Tournament updated!');
        } else {
            setItems(p => [...p, { ...form, id: Date.now() }]);
            flash('Tournament added!');
        }
        cancel();
    };

    const remove = id => {
        if (!window.confirm('Delete this tournament?')) return;
        setItems(p => p.filter(t => t.id !== id));
        flash('Deleted.');
    };

    const reset = () => {
        if (!window.confirm('Reset to default tournaments?')) return;
        setItems(DEFAULT_TOURNAMENTS);
        flash('Reset to defaults.');
    };

    return (
        <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>🏆 Tournaments & Matches</h2>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 4 }}>Manage upcoming tournament entries shown on the public dashboard</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={reset} style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13 }}>↺ Reset Defaults</button>
                    <button onClick={openNew} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>+ Add Tournament</button>
                </div>
            </div>

            {success && <div style={{ background: 'rgba(81,207,102,0.15)', border: '1px solid #51cf66', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: '#51cf66', fontSize: 13 }}>✅ {success}</div>}

            {/* Add/Edit Form */}
            {showForm && (
                <div style={{ ...card, marginBottom: 24, border: '1px solid rgba(102,126,234,0.4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ color: '#fff', fontWeight: 700 }}>{editId ? '✏️ Edit Tournament' : '➕ Add New Tournament'}</h3>
                        <button onClick={cancel} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16 }}>✕</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
                        {[
                            { k: 'name', label: 'Tournament Name *', type: 'text', placeholder: 'VP Tennis Open...' },
                            { k: 'match', label: 'Match Details', type: 'text', placeholder: 'Player A vs Player B' },
                            { k: 'venue', label: 'Venue', type: 'text', placeholder: 'Main Court' },
                            { k: 'date', label: 'Date *', type: 'date' },
                            { k: 'time', label: 'Time', type: 'time' },
                            { k: 'prize', label: 'Prize Money (₹)', type: 'number', placeholder: '25000' },
                        ].map(f => (
                            <div key={f.k}>
                                <label style={label}>{f.label}</label>
                                <input type={f.type} value={form[f.k]} placeholder={f.placeholder || ''} onChange={e => set(f.k, e.target.value)} style={inp} />
                            </div>
                        ))}
                        <div>
                            <label style={label}>Match Type</label>
                            <select value={form.type} onChange={e => set('type', e.target.value)} style={{ ...inp }}>
                                {['Singles', 'Doubles', 'Mixed Doubles'].map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={label}>Category</label>
                            <select value={form.category} onChange={e => set('category', e.target.value)} style={{ ...inp }}>
                                {['Open', 'U-14', 'U-18', 'Pro / Open', 'Women', 'Seniors'].map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                        <button onClick={save} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                            {editId ? '✅ Save Changes' : '➕ Add Tournament'}
                        </button>
                        <button onClick={cancel} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.length === 0 && (
                    <div style={{ ...card, textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)' }}>No tournaments added yet. Click "+ Add Tournament" to create one.</div>
                )}
                {items.map((t, i) => {
                    const days = getDaysLeft(t.date);
                    const dColor = days <= 7 ? '#ff6b6b' : days <= 14 ? '#ffd43b' : '#51cf66';
                    return (
                        <div key={t.id} style={{ ...card, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#fff', flexShrink: 0 }}>
                                {i + 1}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: '#fff', marginBottom: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                                    {t.name}
                                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 50, background: 'rgba(102,126,234,0.15)', color: '#a78bfa', border: '1px solid rgba(102,126,234,0.3)' }}>{t.type}</span>
                                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 50, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>{t.category}</span>
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                                    {t.match && <span>⚡ {t.match}</span>}
                                    {t.date && <span>📅 {fmtDate(t.date)}</span>}
                                    {t.time && <span>🕐 {t.time}</span>}
                                    {t.venue && <span>📍 {t.venue}</span>}
                                    {t.prize && <span style={{ color: '#ffd43b' }}>🏅 ₹{Number(t.prize).toLocaleString()}</span>}
                                    <span style={{ color: dColor, fontWeight: 700 }}>{days} days left</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                <button onClick={() => openEdit(t)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #667eea', background: 'transparent', color: '#667eea', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>✏️ Edit</button>
                                <button onClick={() => remove(t.id)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #ff6b6b', background: 'transparent', color: '#ff6b6b', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>🗑️</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
