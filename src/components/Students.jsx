import { useState } from 'react';
import { getCategories } from '../data/categories';

function formatINR(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const batchColors = {
    Morning: { bg: 'rgba(204,255,0,0.12)', color: '#ccff00' },
    Evening: { bg: 'rgba(76,201,240,0.12)', color: '#4cc9f0' },
    Weekend: { bg: 'rgba(255,183,3,0.12)', color: '#ffb703' },
};

export default function Students({ students, setStudents, feeHistory, setFeeHistory, expenses, isAdmin }) {
    const BATCHES = getCategories().batches;
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showFeeModal, setShowFeeModal] = useState(null); // student object
    const [newStudent, setNewStudent] = useState({ name: '', phone: '', batch: 'Morning', monthlyFee: '', feeStatus: 'pending', feeDate: new Date().toISOString().split('T')[0], feeAmount: '' });
    const [feeAmount, setFeeAmount] = useState('');

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.batch.toLowerCase().includes(search.toLowerCase())
    );

    const handleAddStudent = () => {
        if (!newStudent.name || !newStudent.monthlyFee) return;
        const student = {
            id: Date.now(),
            name: newStudent.name,
            phone: newStudent.phone,
            joinDate: new Date().toISOString().split('T')[0],
            monthlyFee: Number(newStudent.monthlyFee),
            totalPaid: newStudent.feeStatus === 'paid' && newStudent.feeAmount ? Number(newStudent.feeAmount) : 0,
            status: 'Active',
            batch: newStudent.batch,
        };
        setStudents(prev => [...prev, student]);

        // If fee is marked as paid, record it in fee history
        if (newStudent.feeStatus === 'paid' && newStudent.feeAmount) {
            const d = new Date(newStudent.feeDate || new Date());
            setFeeHistory(prev => [...prev, {
                id: Date.now() + 1,
                studentId: student.id,
                studentName: student.name,
                amount: Number(newStudent.feeAmount),
                date: newStudent.feeDate || new Date().toISOString().split('T')[0],
                month: d.toLocaleString('default', { month: 'long' }) + ' ' + d.getFullYear(),
            }]);
        }

        setNewStudent({ name: '', phone: '', batch: 'Morning', monthlyFee: '', feeStatus: 'pending', feeDate: new Date().toISOString().split('T')[0], feeAmount: '' });
        setShowAddModal(false);
    };

    const handleCollectFee = () => {
        if (!feeAmount || !showFeeModal) return;
        const amount = Number(feeAmount);
        setStudents(prev => prev.map(s => s.id === showFeeModal.id ? { ...s, totalPaid: s.totalPaid + amount } : s));
        const now = new Date();
        setFeeHistory(prev => [...prev, {
            id: Date.now(),
            studentId: showFeeModal.id,
            studentName: showFeeModal.name,
            amount,
            date: now.toISOString().split('T')[0],
            month: now.toLocaleString('default', { month: 'long' }) + ' ' + now.getFullYear(),
        }]);
        setFeeAmount('');
        setShowFeeModal(null);
    };

    const toggleStatus = (id) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s));
    };

    const handleDeleteStudent = (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name}? This will remove all their records.`)) {
            setStudents(prev => prev.filter(s => s.id !== id));
            // Also cleanup fee history if needed, but usually it's kept for records. 
            // For now, let's just delete the student.
        }
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-title">
                    <h1>Students & Fees</h1>
                    <p>{students.length} students enrolled • {students.filter(s => s.status === 'Active').length} active</p>
                </div>
                <div className="toolbar">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    {isAdmin && <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Add Student</button>}
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div>
                        <h3>Student Roster</h3>
                        <p>Manage students and collect fees</p>
                    </div>
                    <span className="badge badge-accent">{filtered.length} records</span>
                </div>
                <div className="table-container mobile-hide">
                    <table className="compact-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Batch</th>
                                <th>Join Date</th>
                                <th>Monthly Fee</th>
                                <th>Total Paid</th>
                                <th>Status</th>
                                {isAdmin && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(student => (
                                <tr key={student.id}>
                                    <td>
                                        <div className="student-cell">
                                            <div className="avatar">{getInitials(student.name)}</div>
                                            <div>
                                                <div className="student-name">{student.name}</div>
                                                <div className="student-phone">{student.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge" style={{ background: batchColors[student.batch]?.bg, color: batchColors[student.batch]?.color }}>
                                            {student.batch}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{student.joinDate}</td>
                                    <td style={{ fontWeight: 600 }}>{formatINR(student.monthlyFee)}/mo</td>
                                    <td style={{ color: 'var(--success)', fontWeight: 700 }}>{formatINR(student.totalPaid)}</td>
                                    <td>
                                        <span className={`badge ${student.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            <div className="toolbar" style={{ gap: '8px' }}>
                                                <button className="btn btn-sm btn-success" onClick={() => { setShowFeeModal(student); setFeeAmount(String(student.monthlyFee)); }}>
                                                    💳 Collect Fee
                                                </button>
                                                <button className="btn btn-sm btn-ghost" onClick={() => toggleStatus(student.id)}>
                                                    {student.status === 'Active' ? '⏸' : '▶'}
                                                </button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteStudent(student.id, student.name)}>
                                                    🗑
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card Layout for Students */}
                <div className="card-list mobile-only">
                    {filtered.map(student => (
                        <div className="item-card" key={student.id}>
                            <div className="item-card-header">
                                <div className="item-card-info">
                                    <div className="avatar">{getInitials(student.name)}</div>
                                    <div className="item-card-details">
                                        <div className="item-card-title">{student.name}</div>
                                        <div className="item-card-sub">{student.phone}</div>
                                    </div>
                                </div>
                                <span className={`badge ${student.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                                    {student.status}
                                </span>
                            </div>
                            <div className="item-card-stats">
                                <div className="item-card-stat">
                                    <div className="item-card-stat-label">Batch</div>
                                    <div className="item-card-stat-value" style={{ color: batchColors[student.batch]?.color }}>{student.batch}</div>
                                </div>
                                <div className="item-card-stat">
                                    <div className="item-card-stat-label">Monthly Fee</div>
                                    <div className="item-card-stat-value">{formatINR(student.monthlyFee)}</div>
                                </div>
                                <div className="item-card-stat">
                                    <div className="item-card-stat-label">Total Paid</div>
                                    <div className="item-card-stat-value" style={{ color: 'var(--success)' }}>{formatINR(student.totalPaid)}</div>
                                </div>
                                <div className="item-card-stat">
                                    <div className="item-card-stat-label">Joined</div>
                                    <div className="item-card-stat-value" style={{ color: 'var(--text-secondary)' }}>{student.joinDate}</div>
                                </div>
                            </div>
                            {isAdmin && (
                                <div className="item-card-actions">
                                    <button className="btn btn-primary" onClick={() => { setShowFeeModal(student); setFeeAmount(String(student.monthlyFee)); }}>
                                        💳 Collect Fee
                                    </button>
                                    <button className="btn btn-ghost" onClick={() => toggleStatus(student.id)}>
                                        {student.status === 'Active' ? 'Pause' : 'Resume'}
                                    </button>
                                    <button className="btn btn-danger" onClick={() => handleDeleteStudent(student.id, student.name)}>
                                        🗑 Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🎾</div>
                        <p>No students found</p>
                    </div>
                )}
            </div>

            {/* Fee History */}
            <div className="card" style={{ marginTop: 20 }}>
                <div className="card-header">
                    <div>
                        <h3>Fee Payment History</h3>
                        <p>All recorded fee transactions</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="badge badge-accent">{feeHistory.length} transactions</span>
                        {isAdmin && feeHistory.length > 0 && (
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to clear ALL fee payment history? This cannot be undone.')) {
                                        setFeeHistory([]);
                                    }
                                }}
                                style={{
                                    padding: '5px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ff6b6b',
                                    background: 'transparent',
                                    color: '#ff6b6b',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                }}
                            >
                                🗑️ Clear All
                            </button>
                        )}
                    </div>
                </div>
                <div className="table-container mobile-hide">
                    <table className="compact-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Month</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...feeHistory].sort((a, b) => new Date(b.date) - new Date(a.date)).map(f => (
                                <tr key={f.id}>
                                    <td style={{ fontWeight: 600 }}>{f.studentName}</td>
                                    <td><span className="badge badge-accent">{f.month}</span></td>
                                    <td style={{ color: 'var(--success)', fontWeight: 700 }}>{formatINR(f.amount)}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{f.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card Layout for Fee History */}
                <div className="card-list mobile-only">
                    {[...feeHistory].sort((a, b) => new Date(b.date) - new Date(a.date)).map(f => (
                        <div className="item-card" key={f.id}>
                            <div className="item-card-header">
                                <div className="item-card-title">{f.studentName}</div>
                                <span className="badge badge-accent">{f.month}</span>
                            </div>
                            <div className="item-card-stats" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div className="item-card-stat">
                                    <div className="item-card-stat-label">Amount</div>
                                    <div className="item-card-stat-value" style={{ color: 'var(--success)' }}>{formatINR(f.amount)}</div>
                                </div>
                                <div className="item-card-stat">
                                    <div className="item-card-stat-label">Paid On</div>
                                    <div className="item-card-stat-value" style={{ color: 'var(--text-secondary)' }}>{f.date}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {feeHistory.length === 0 && (
                        <div className="empty-state">
                            <p>No transactions recorded</p>
                        </div>
                    )}
                </div>
            </div>


            {/* Add Student Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Student</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="two-col">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input placeholder="e.g. Rahul Sharma" value={newStudent.name} onChange={e => setNewStudent(p => ({ ...p, name: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input placeholder="e.g. 9876543210" value={newStudent.phone} onChange={e => setNewStudent(p => ({ ...p, phone: e.target.value }))} />
                                </div>
                            </div>
                            <div className="two-col">
                                <div className="form-group">
                                    <label>Batch *</label>
                                    <select value={newStudent.batch} onChange={e => setNewStudent(p => ({ ...p, batch: e.target.value }))}>
                                        {BATCHES.map(b => <option key={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Monthly Fee (₹) *</label>
                                    <input type="number" placeholder="e.g. 2500" value={newStudent.monthlyFee} onChange={e => setNewStudent(p => ({ ...p, monthlyFee: e.target.value }))} />
                                </div>
                            </div>

                            {/* Fee Status */}
                            <div className="form-group">
                                <label>Fee Status</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {['pending', 'paid'].map(status => (
                                        <button
                                            key={status}
                                            type="button"
                                            onClick={() => setNewStudent(p => ({ ...p, feeStatus: status }))}
                                            style={{
                                                flex: 1, padding: '9px', borderRadius: '8px', fontWeight: 600,
                                                fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                                                border: newStudent.feeStatus === status
                                                    ? 'none'
                                                    : '1px solid rgba(255,255,255,0.15)',
                                                background: newStudent.feeStatus === status
                                                    ? status === 'paid' ? 'linear-gradient(135deg,#51cf66,#2f9e44)' : 'linear-gradient(135deg,#ff6b6b,#c0392b)'
                                                    : 'transparent',
                                                color: newStudent.feeStatus === status ? '#fff' : 'var(--text-secondary)',
                                            }}
                                        >
                                            {status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Conditional Paid Fields */}
                            {newStudent.feeStatus === 'paid' && (
                                <div className="two-col" style={{ animation: 'fadeIn 0.2s ease' }}>
                                    <div className="form-group">
                                        <label>Payment Date *</label>
                                        <input
                                            type="date"
                                            value={newStudent.feeDate}
                                            onChange={e => setNewStudent(p => ({ ...p, feeDate: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Amount Paid (₹) *</label>
                                        <input
                                            type="number"
                                            placeholder={`e.g. ${newStudent.monthlyFee || 2500}`}
                                            value={newStudent.feeAmount}
                                            onChange={e => setNewStudent(p => ({ ...p, feeAmount: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddStudent}>Add Student</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Collect Fee Modal */}
            {showFeeModal && (
                <div className="modal-overlay" onClick={() => setShowFeeModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Collect Fee</h3>
                            <button className="modal-close" onClick={() => setShowFeeModal(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', borderRadius: 12, padding: '16px' }}>
                                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent)' }}>{showFeeModal.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Monthly Fee: {formatINR(showFeeModal.monthlyFee)} • Total Paid: {formatINR(showFeeModal.totalPaid)}</div>
                            </div>
                            <div className="form-group">
                                <label>Amount Collecting (₹) *</label>
                                <input type="number" value={feeAmount} onChange={e => setFeeAmount(e.target.value)} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowFeeModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCollectFee}>✓ Confirm Payment</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
