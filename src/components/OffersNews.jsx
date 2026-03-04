import { useState, useEffect } from 'react';
import { fetchOffers, saveOffers } from '../firebaseData';

const TAGS = ['Offer', 'News', 'Event', 'Announcement', 'New Batch', 'Sale'];
const COLORS = ['#667eea', '#51cf66', '#ff9f43', '#ff6b6b', '#a78bfa', '#20c997', '#74c0fc', '#ffd43b'];
const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px' };
const inp = { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none' };
const lbl = { color: 'rgba(255,255,255,0.65)', fontSize: 12, display: 'block', marginBottom: 5 };

const EMPTY = { title: '', desc: '', tag: 'News', color: '#667eea', icon: '📢', link: '' };

export default function OffersNews() {
    const [items, setItems] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        fetchOffers().then(data => {
            if (data) setItems(data);
            setIsLoaded(true);
        });
    }, []);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isLoaded) saveOffers(items).catch(err => console.error("Failed to save offers:", err));
    }, [items, isLoaded]);
    const flash = m => { setSuccess(m); setTimeout(() => setSuccess(''), 2500); };
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const cancel = () => { setShowForm(false); setEditId(null); setForm(EMPTY); };
    const openNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
    const openEdit = item => { setForm({ ...item }); setEditId(item.id); setShowForm(true); };

    const save = () => {
        if (!form.title) return;
        if (editId) {
            setItems(p => p.map(x => x.id === editId ? { ...form, id: editId } : x));
            flash('Item updated!');
        } else {
            setItems(p => [...p, { ...form, id: Date.now() }]);
            flash('Item added!');
        }
        cancel();
    };

    const remove = id => {
        if (!window.confirm('Delete this item?')) return;
        setItems(p => p.filter(x => x.id !== id));
        flash('Deleted.');
    };

    const ICONS = ['📢', '🎉', '🏷️', '⭐', '🆕', '🔥', '🎾', '💰', '📅', '🏆', '✨', '🎓'];

    return (
        <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>📣 Offers &amp; News</h2>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 4 }}>Manage offers, announcements and news shown on the public dashboard</p>
                </div>
                <button onClick={openNew} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>+ New Item</button>
            </div>

            {success && <div style={{ background: 'rgba(81,207,102,0.15)', border: '1px solid #51cf66', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: '#51cf66', fontSize: 13 }}>✅ {success}</div>}

            {/* Form */}
            {showForm && (
                <div style={{ ...card, marginBottom: 24, border: '1px solid rgba(102,126,234,0.4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ color: '#fff', fontWeight: 700 }}>{editId ? '✏️ Edit Item' : '➕ New Offer / News Item'}</h3>
                        <button onClick={cancel} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16 }}>✕</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={lbl}>Title *</label>
                            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. 40% Off Summer Camp" style={inp} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={lbl}>Description</label>
                            <textarea value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="Short description or details..." rows={2} style={{ ...inp, resize: 'vertical' }} />
                        </div>
                        <div>
                            <label style={lbl}>Tag / Category</label>
                            <select value={form.tag} onChange={e => set('tag', e.target.value)} style={inp}>
                                {TAGS.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={lbl}>Icon</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {ICONS.map(ic => (
                                    <button key={ic} onClick={() => set('icon', ic)}
                                        style={{ width: 34, height: 34, borderRadius: 8, border: form.icon === ic ? '2px solid #667eea' : '1px solid rgba(255,255,255,0.12)', background: form.icon === ic ? 'rgba(102,126,234,0.2)' : 'transparent', cursor: 'pointer', fontSize: 16 }}>
                                        {ic}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={lbl}>Accent Color</label>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {COLORS.map(c => (
                                    <button key={c} onClick={() => set('color', c)}
                                        style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: form.color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
                                ))}
                                <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                                    style={{ width: 26, height: 26, padding: 0, border: '2px solid rgba(255,255,255,0.2)', borderRadius: '50%', background: 'none', cursor: 'pointer' }} />
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                        <button onClick={save} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                            {editId ? '✅ Save Changes' : '➕ Add Item'}
                        </button>
                        <button onClick={cancel} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {items.length === 0 && !showForm && (
                <div style={{ ...card, textAlign: 'center', padding: 56, color: 'rgba(255,255,255,.25)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>📣</div>
                    <div style={{ fontSize: 15, marginBottom: 6 }}>No offers or news yet</div>
                    <div style={{ fontSize: 13 }}>Click "+ New Item" to create your first announcement</div>
                </div>
            )}

            {/* Items Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
                {items.map(item => (
                    <div key={item.id} style={{ ...card, border: `1px solid ${item.color}44`, background: `linear-gradient(135deg,${item.color}18,${item.color}06)`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{item.icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 4 }}>
                                    <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{item.title}</span>
                                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 50, background: `${item.color}25`, color: item.color, border: `1px solid ${item.color}55`, fontWeight: 600 }}>{item.tag}</span>
                                </div>
                                {item.desc && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, justifyContent: 'flex-end' }}>
                            <button onClick={() => openEdit(item)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #667eea', background: 'transparent', color: '#667eea', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>✏️ Edit</button>
                            <button onClick={() => remove(item.id)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #ff6b6b', background: 'transparent', color: '#ff6b6b', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>🗑️ Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
