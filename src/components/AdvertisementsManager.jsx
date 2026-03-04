import { useState, useEffect } from 'react';
import { fetchAds, saveAds } from '../firebaseData';

const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px' };
const inp = { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none' };
const lbl = { color: 'rgba(255,255,255,0.65)', fontSize: 12, display: 'block', marginBottom: 5 };

export default function AdvertisementsManager() {
    const [ads, setAds] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        fetchAds().then(data => {
            if (data) setAds(data);
            setIsLoaded(true);
        });
    }, []);
    const [form, setForm] = useState({ title: '', desc: '', cta: 'Learn More', imageBase64: '', color: '#667eea' });
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [preview, setPreview] = useState(null);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isLoaded) saveAds(ads).catch(err => console.error("Failed to save ads:", err));
    }, [ads, isLoaded]);
    const flash = m => { setSuccess(m); setTimeout(() => setSuccess(''), 2500); };
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const cancel = () => { setShowForm(false); setEditId(null); setForm({ title: '', desc: '', cta: 'Learn More', imageBase64: '', color: '#667eea' }); setPreview(null); };
    const openNew = () => { cancel(); setShowForm(true); };
    const openEdit = a => { setForm({ title: a.title, desc: a.desc, cta: a.cta, imageBase64: a.imageBase64 || '', color: a.color || '#667eea' }); setPreview(a.imageBase64 || null); setEditId(a.id); setShowForm(true); };

    const handleImage = e => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2 MB.'); return; }
        const reader = new FileReader();
        reader.onload = ev => { setPreview(ev.target.result); set('imageBase64', ev.target.result); };
        reader.readAsDataURL(file);
    };

    const save = () => {
        if (!form.title) return;
        if (editId) {
            setAds(p => p.map(a => a.id === editId ? { ...form, id: editId } : a));
            flash('Advertisement updated!');
        } else {
            setAds(p => [...p, { ...form, id: Date.now() }]);
            flash('Advertisement added!');
        }
        cancel();
    };

    const remove = id => {
        if (!window.confirm('Delete this advertisement?')) return;
        setAds(p => p.filter(a => a.id !== id));
        flash('Deleted.');
    };

    const moveUp = (i) => { if (i === 0) return; const a = [...ads];[a[i - 1], a[i]] = [a[i], a[i - 1]]; setAds(a); };
    const moveDown = (i) => { if (i === ads.length - 1) return; const a = [...ads];[a[i], a[i + 1]] = [a[i + 1], a[i]]; setAds(a); };

    const COLORS = ['#667eea', '#51cf66', '#ff9f43', '#ee5a24', '#ff6b6b', '#a78bfa', '#20c997', '#74c0fc'];

    return (
        <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>📢 Advertisements</h2>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 4 }}>Upload and manage ads shown on the public landing dashboard</p>
                </div>
                <button onClick={openNew} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>+ New Ad</button>
            </div>

            {success && <div style={{ background: 'rgba(81,207,102,0.15)', border: '1px solid #51cf66', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: '#51cf66', fontSize: 13 }}>✅ {success}</div>}

            {/* Form */}
            {showForm && (
                <div style={{ ...card, marginBottom: 24, border: '1px solid rgba(102,126,234,0.4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ color: '#fff', fontWeight: 700 }}>{editId ? '✏️ Edit Advertisement' : '➕ New Advertisement'}</h3>
                        <button onClick={cancel} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16 }}>✕</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {/* Left: Fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={lbl}>Title *</label>
                                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Summer Camp Open" style={inp} />
                            </div>
                            <div>
                                <label style={lbl}>Description</label>
                                <textarea value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="Short description..." rows={3} style={{ ...inp, resize: 'vertical' }} />
                            </div>
                            <div>
                                <label style={lbl}>Button Label</label>
                                <input value={form.cta} onChange={e => set('cta', e.target.value)} placeholder="e.g. Enroll Now" style={inp} />
                            </div>
                            <div>
                                <label style={lbl}>Accent Color</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {COLORS.map(c => (
                                        <button key={c} onClick={() => set('color', c)}
                                            style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', outline: 'none' }} />
                                    ))}
                                    <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                                        style={{ width: 28, height: 28, padding: 0, border: '2px solid rgba(255,255,255,0.2)', borderRadius: '50%', background: 'none', cursor: 'pointer' }} />
                                </div>
                            </div>
                        </div>
                        {/* Right: Image */}
                        <div>
                            <label style={lbl}>Advertisement Image (max 2 MB)</label>
                            <label style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                border: '2px dashed rgba(255,255,255,0.15)', borderRadius: 12, cursor: 'pointer',
                                minHeight: 180, padding: 12, position: 'relative', overflow: 'hidden',
                                transition: 'border-color .2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(102,126,234,0.5)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                            >
                                {preview ? (
                                    <>
                                        <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />
                                        <span style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Click to change image</span>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🖼️</div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center' }}>Click to upload image<br /><span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>JPG, PNG, WEBP (max 2 MB)</span></div>
                                    </>
                                )}
                                <input type="file" accept="image/*" onChange={handleImage} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                            </label>
                            {preview && (
                                <button onClick={() => { setPreview(null); set('imageBase64', ''); }} style={{ marginTop: 8, fontSize: 12, background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>🗑️ Remove image</button>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                        <button onClick={save} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                            {editId ? '✅ Save Changes' : '➕ Add Ad'}
                        </button>
                        <button onClick={cancel} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {ads.length === 0 && !showForm && (
                <div style={{ ...card, textAlign: 'center', padding: 56, color: 'rgba(255,255,255,0.25)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>📢</div>
                    <div style={{ fontSize: 15, marginBottom: 6 }}>No advertisements yet</div>
                    <div style={{ fontSize: 13 }}>Click "+ New Ad" to create your first advertisement</div>
                </div>
            )}

            {/* Ad Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
                {ads.map((a, i) => (
                    <div key={a.id} style={{ ...card, border: `1px solid ${a.color || '#667eea'}44`, background: `linear-gradient(135deg,${a.color || '#667eea'}18,${a.color || '#667eea'}06)`, display: 'flex', flexDirection: 'column' }}>
                        {a.imageBase64 && (
                            <img src={a.imageBase64} alt={a.title} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />
                        )}
                        {!a.imageBase64 && (
                            <div style={{ width: '100%', height: 100, borderRadius: 10, background: `${a.color || '#667eea'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 12 }}>📢</div>
                        )}
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#fff' }}>{a.title}</div>
                        {a.desc && <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 1.6, flex: 1, marginBottom: 12 }}>{a.desc}</div>}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => moveUp(i)} disabled={i === 0} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: i === 0 ? 'not-allowed' : 'pointer', fontSize: 12 }}>↑</button>
                                <button onClick={() => moveDown(i)} disabled={i === ads.length - 1} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: i === ads.length - 1 ? 'not-allowed' : 'pointer', fontSize: 12 }}>↓</button>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => openEdit(a)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #667eea', background: 'transparent', color: '#667eea', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>✏️ Edit</button>
                                <button onClick={() => remove(a.id)} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #ff6b6b', background: 'transparent', color: '#ff6b6b', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>🗑️</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
