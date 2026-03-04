import { useState, useEffect } from 'react';
import { getCategories, saveCategories, DEFAULT_BATCHES, DEFAULT_EXPENSE_CATEGORIES } from '../data/categories';

const PALETTE = [
    '#667eea', '#51cf66', '#ff6b6b', '#ffd43b', '#4cc9f0',
    '#ff9f43', '#a29bfe', '#fd79a8', '#55efc4', '#fdcb6e',
];

function CategorySection({ title, icon, description, items, onAdd, onDelete, color }) {
    const [input, setInput] = useState('');
    const [err, setErr] = useState('');

    const handleAdd = () => {
        const val = input.trim();
        if (!val) { setErr('Please enter a name.'); return; }
        if (items.map(i => i.toLowerCase()).includes(val.toLowerCase())) {
            setErr('This category already exists.'); return;
        }
        onAdd(val);
        setInput('');
        setErr('');
    };

    return (
        <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    {icon}
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{title}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{description}</div>
                </div>
            </div>

            {/* Existing items */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, minHeight: 36, marginTop: 16 }}>
                {items.map((item, idx) => (
                    <div key={item} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: PALETTE[idx % PALETTE.length] + '22',
                        border: `1px solid ${PALETTE[idx % PALETTE.length]}44`,
                        borderRadius: 20, padding: '4px 12px',
                    }}>
                        <span style={{ color: PALETTE[idx % PALETTE.length], fontWeight: 600, fontSize: '13px' }}>{item}</span>
                        <button
                            onClick={() => onDelete(item)}
                            title="Remove"
                            style={{ background: 'none', border: 'none', color: PALETTE[idx % PALETTE.length], cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1, opacity: 0.7 }}
                        >
                            ×
                        </button>
                    </div>
                ))}
                {items.length === 0 && (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontStyle: 'italic' }}>No categories yet</span>
                )}
            </div>

            {/* Add input */}
            <div style={{ display: 'flex', gap: 8 }}>
                <input
                    value={input}
                    onChange={e => { setInput(e.target.value); setErr(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    placeholder={`Add new ${title.toLowerCase()}...`}
                    style={{
                        flex: 1, padding: '8px 12px', borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.07)',
                        color: '#fff', fontSize: '13px',
                    }}
                />
                <button
                    onClick={handleAdd}
                    style={{
                        padding: '8px 16px', borderRadius: 8, border: 'none',
                        background: color, color: '#fff',
                        fontWeight: 700, cursor: 'pointer', fontSize: '13px',
                    }}
                >
                    + Add
                </button>
            </div>
            {err && <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: 6 }}>⚠️ {err}</div>}
        </div>
    );
}

export default function Categories() {
    const [cats, setCats] = useState(getCategories);
    const [saved, setSaved] = useState(false);

    // Auto-save on every change
    useEffect(() => {
        saveCategories(cats);
        setSaved(true);
        const t = setTimeout(() => setSaved(false), 1500);
        return () => clearTimeout(t);
    }, [cats]);

    const addBatch = (val) => setCats(p => ({ ...p, batches: [...p.batches, val] }));
    const delBatch = (val) => {
        if (DEFAULT_BATCHES.includes(val) && cats.batches.length <= 1) return;
        setCats(p => ({ ...p, batches: p.batches.filter(b => b !== val) }));
    };

    const addExpCat = (val) => setCats(p => ({ ...p, expenseCategories: [...p.expenseCategories, val] }));
    const delExpCat = (val) => {
        if (cats.expenseCategories.length <= 1) return;
        setCats(p => ({ ...p, expenseCategories: p.expenseCategories.filter(c => c !== val) }));
    };

    const handleReset = () => {
        if (window.confirm('Reset all categories to defaults? Custom categories will be lost.')) {
            const defaults = { batches: DEFAULT_BATCHES, expenseCategories: DEFAULT_EXPENSE_CATEGORIES };
            setCats(defaults);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🗂️ Categories</h1>
                    <p className="page-subtitle">Manage batch types and expense categories used across the portal</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {saved && (
                        <span style={{ color: '#51cf66', fontSize: '13px', fontWeight: 600 }}>✅ Saved</span>
                    )}
                    <button
                        onClick={handleReset}
                        style={{
                            padding: '8px 14px', borderRadius: 8,
                            border: '1px solid rgba(255,100,100,0.4)',
                            background: 'transparent', color: '#ff6b6b',
                            cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                        }}
                    >
                        🔄 Reset to Defaults
                    </button>
                </div>
            </div>

            {/* Info Banner */}
            <div style={{
                padding: '12px 18px', borderRadius: 10, marginBottom: 24,
                background: '#667eea11', border: '1px solid #667eea33',
                color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.6,
            }}>
                💡 Changes here are applied <strong style={{ color: '#fff' }}>immediately</strong> and reflected in the Add Student and Add Expense forms. Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: 4 }}>Enter</kbd> or click <strong style={{ color: '#fff' }}>+ Add</strong> to add a category. Click <strong style={{ color: '#fff' }}>×</strong> on a tag to remove it.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                <CategorySection
                    title="Batch Types"
                    icon="🎾"
                    description="Used in the Add Student form"
                    items={cats.batches}
                    onAdd={addBatch}
                    onDelete={delBatch}
                    color="#667eea"
                />

                <CategorySection
                    title="Expense Categories"
                    icon="💸"
                    description="Used in the Add Expense form"
                    items={cats.expenseCategories}
                    onAdd={addExpCat}
                    onDelete={delExpCat}
                    color="#ff6b6b"
                />
            </div>
        </div>
    );
}
