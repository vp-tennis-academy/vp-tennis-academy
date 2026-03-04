function formatINR(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

export default function Dashboard({ students, expenses, feeHistory, setActive }) {
    const totalRevenue = students.reduce((s, st) => s + st.totalPaid, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const netBalance = totalRevenue - totalExpenses;
    const activeStudents = students.filter(s => s.status === 'Active').length;

    const recentFees = [...feeHistory].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const recentExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    const categoryColors = {
        Equipment: '#4cc9f0',
        Maintenance: '#ffb703',
        Salary: '#ff4d6d',
        Utilities: '#2dd36f',
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-title">
                    <h1>Dashboard</h1>
                    <p>Tennis Academy Overview — March 2026</p>
                </div>
            </div>
            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-icon">👥</div>
                    <div className="stat-label">Total Students</div>
                    <div className="stat-value">{students.length}</div>
                    <div className="stat-sub">{activeStudents} Active</div>
                </div>
                <div className="stat-card accent">
                    <div className="stat-icon">💰</div>
                    <div className="stat-label">Fee Collected</div>
                    <div className="stat-value">{formatINR(totalRevenue)}</div>
                    <div className="stat-sub">All time</div>
                </div>
                <div className="stat-card red">
                    <div className="stat-icon">📤</div>
                    <div className="stat-label">Total Expenses</div>
                    <div className="stat-value">{formatINR(totalExpenses)}</div>
                    <div className="stat-sub">All time</div>
                </div>
                <div className={`stat-card ${netBalance >= 0 ? 'green' : 'red'} net-balance-card`}>
                    <div className="stat-icon">{netBalance >= 0 ? '📈' : '📉'}</div>
                    <div className="stat-label">Net Balance</div>
                    <div className="stat-value">{formatINR(Math.abs(netBalance))}</div>
                    <div className="stat-sub">{netBalance >= 0 ? 'Profit' : 'Loss'}</div>
                </div>
            </div>

            <div className="dash-summary-grid">
                {/* Students & Fees Box */}
                <div className="dash-summary-card dash-students" onClick={() => setActive('students')} style={{ cursor: 'pointer' }}>
                    <div className="dash-summary-top">
                        <div>
                            <div className="dash-summary-icon">🎾</div>
                            <div className="dash-summary-title">Students &amp; Fees</div>
                        </div>
                        <span className="dash-summary-arrow">→</span>
                    </div>
                    <div className="dash-summary-stats">
                        <div className="dash-summary-stat">
                            <div className="dash-summary-stat-value">{students.length}</div>
                            <div className="dash-summary-stat-label">Total Students</div>
                        </div>
                        <div className="dash-summary-divider" />
                        <div className="dash-summary-stat">
                            <div className="dash-summary-stat-value">{activeStudents}</div>
                            <div className="dash-summary-stat-label">Active</div>
                        </div>
                        <div className="dash-summary-divider" />
                        <div className="dash-summary-stat">
                            <div className="dash-summary-stat-value" style={{ color: 'var(--accent)' }}>{formatINR(totalRevenue)}</div>
                            <div className="dash-summary-stat-label">Fee Collected</div>
                        </div>
                        <div className="dash-summary-divider" />
                        <div className="dash-summary-stat">
                            <div className="dash-summary-stat-value">{feeHistory.length}</div>
                            <div className="dash-summary-stat-label">Transactions</div>
                        </div>
                    </div>
                </div>

                {/* Expenses Box */}
                <div className="dash-summary-card dash-expenses" onClick={() => setActive('expenses')} style={{ cursor: 'pointer' }}>
                    <div className="dash-summary-top">
                        <div>
                            <div className="dash-summary-icon">💸</div>
                            <div className="dash-summary-title">Expenses</div>
                        </div>
                        <span className="dash-summary-arrow">→</span>
                    </div>
                    <div className="dash-summary-stats">
                        <div className="dash-summary-stat">
                            <div className="dash-summary-stat-value" style={{ color: 'var(--danger)' }}>{formatINR(totalExpenses)}</div>
                            <div className="dash-summary-stat-label">Total Spent</div>
                        </div>
                        <div className="dash-summary-divider" />
                        <div className="dash-summary-stat">
                            <div className="dash-summary-stat-value">{expenses.length}</div>
                            <div className="dash-summary-stat-label">Records</div>
                        </div>
                        <div className="dash-summary-divider" />
                        <div className="dash-summary-stat">
                            <div className="dash-summary-stat-value" style={{ color: netBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                {netBalance >= 0 ? '+' : '-'}{formatINR(Math.abs(netBalance))}
                            </div>
                            <div className="dash-summary-stat-label">Net Balance</div>
                        </div>
                        <div className="dash-summary-divider" />
                        <div className="dash-summary-stat">
                            <div className="dash-summary-stat-value" style={{ color: netBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                {netBalance >= 0 ? '📈 Profit' : '📉 Loss'}
                            </div>
                            <div className="dash-summary-stat-label">Status</div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3>Recent Fee Collections</h3>
                            <p>Latest payments received</p>
                        </div>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Month</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentFees.map(f => (
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
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3>Recent Expenses</h3>
                            <p>Latest outgoing payments</p>
                        </div>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentExpenses.map(e => (
                                    <tr key={e.id}>
                                        <td style={{ fontWeight: 500 }}>{e.description}</td>
                                        <td>
                                            <span className="category-chip" style={{
                                                background: (categoryColors[e.category] || '#888') + '22',
                                                color: categoryColors[e.category] || '#888',
                                            }}>{e.category}</span>
                                        </td>
                                        <td style={{ color: 'var(--danger)', fontWeight: 700 }}>{formatINR(e.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
