import { useState } from 'react';
import { getCategories } from '../data/categories';

function formatINR(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

const categoryColors = [
    '#4cc9f0', '#ffb703', '#ff4d6d', '#2dd36f', '#8888a0',
    '#667eea', '#ff9f43', '#a29bfe', '#fd79a8', '#55efc4',
];
function getCatColor(cat, allCats) {
    const idx = allCats.indexOf(cat);
    return categoryColors[idx % categoryColors.length] || '#8888a0';
}

export default function Expenses({ expenses, setExpenses, students, feeHistory, isAdmin }) {
    const CATEGORIES = getCategories().expenseCategories;
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ description: '', category: CATEGORIES[0] || 'Other', amount: '', date: new Date().toISOString().split('T')[0] });

    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    // Category breakdown
    const breakdown = CATEGORIES.map(cat => ({
        cat,
        total: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
        count: expenses.filter(e => e.category === cat).length,
    })).filter(b => b.count > 0);

    const filtered = expenses
        .filter(e => filterCat === 'All' || e.category === filterCat)
        .filter(e => e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const handleAdd = () => {
        if (!form.description || !form.amount) return;
        setExpenses(prev => [...prev, { id: Date.now(), ...form, amount: Number(form.amount) }]);
        setForm({ description: '', category: 'Equipment', amount: '', date: new Date().toISOString().split('T')[0] });
        setShowModal(false);
    };

    const handleDelete = (id) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-title">
                    <h1>Expenses</h1>
                    <p>Track all academy expenditures — Total: <strong style={{ color: 'var(--danger)' }}>{formatINR(totalExpenses)}</strong></p>
                </div>
                {isAdmin && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Expense</button>}
            </div>

            {/* Category Breakdown */}
            <div className="stats-grid" style={{ marginBottom: 24 }}>
                {breakdown.map((b, idx) => (
                    <div key={b.cat} className="stat-card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => setFilterCat(filterCat === b.cat ? 'All' : b.cat)}>
                        <div className="stat-icon">💸</div>
                        <div className="stat-label" style={{ color: getCatColor(b.cat, CATEGORIES) }}>{b.cat}</div>
                        <div className="stat-value" style={{ color: getCatColor(b.cat, CATEGORIES) }}>{formatINR(b.total)}</div>
                        <div className="stat-sub">{b.count} expense{b.count > 1 ? 's' : ''}</div>
                    </div>
                ))}
            </div>

            <div className="card">
                <div className="card-header">
                    <div>
                        <h3>All Expenses {filterCat !== 'All' && `— ${filterCat}`}</h3>
                        <p>{filtered.length} records found</p>
                    </div>
                    <div className="toolbar">
                        <div className="search-bar">
                            <span className="search-icon">🔍</span>
                            <input placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select
                            value={filterCat}
                            onChange={e => setFilterCat(e.target.value)}
                            style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', fontSize: 14, cursor: 'pointer', outline: 'none' }}
                        >
                            <option value="All">All Categories</option>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="table-container mobile-hide">
                    <table className="compact-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                                {isAdmin && <th>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(exp => (
                                <tr key={exp.id}>
                                    <td style={{ color: 'var(--text-secondary)' }}>{exp.date}</td>
                                    <td style={{ fontWeight: 500 }}>{exp.description}</td>
                                    <td>
                                        <span className="category-chip" style={{ background: categoryColors[exp.category]?.bg, color: categoryColors[exp.category]?.color }}>
                                            {exp.category}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--danger)', fontWeight: 700 }}>- {formatINR(exp.amount)}</td>
                                    {isAdmin && (
                                        <td>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(exp.id)}>🗑 Delete</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card Layout for Expenses */}
                <div className="card-list mobile-only">
                    {filtered.map(exp => (
                        <div className="item-card" key={exp.id}>
                            <div className="item-card-header">
                                <div className="item-card-title">{exp.description}</div>
                                <span className="category-chip" style={{ background: categoryColors[exp.category]?.bg, color: categoryColors[exp.category]?.color }}>
                                    {exp.category}
                                </span>
                            </div>
                            <div className="item-card-stats" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div className="item-card-stat">
                                    <div className="item-card-stat-label">Amount</div>
                                    <div className="item-card-stat-value" style={{ color: 'var(--danger)' }}>{formatINR(exp.amount)}</div>
                                </div>
                                <div className="item-card-stat">
                                    <div className="item-card-stat-label">Date</div>
                                    <div className="item-card-stat-value" style={{ color: 'var(--text-secondary)' }}>{exp.date}</div>
                                </div>
                            </div>
                            {isAdmin && (
                                <div className="item-card-actions">
                                    <button className="btn btn-danger" onClick={() => handleDelete(exp.id)}>🗑 Delete</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">💸</div>
                        <p>No expenses found</p>
                    </div>
                )}
            </div>


            {/* Add Expense Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Log New Expense</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Description *</label>
                                <input placeholder="e.g. Tennis balls purchase" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                            </div>
                            <div className="two-col">
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Amount (₹) *</label>
                                    <input type="number" placeholder="e.g. 5000" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Date *</label>
                                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAdd}>Add Expense</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
