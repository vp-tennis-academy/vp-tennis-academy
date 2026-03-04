function formatINR(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

export default function StatsCards({ students, expenses, feeHistory }) {
    const totalRevenue = students.reduce((s, st) => s + st.totalPaid, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const netBalance = totalRevenue - totalExpenses;
    const activeStudents = students.filter(s => s.status === 'Active').length;

    return (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
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
    );
}
