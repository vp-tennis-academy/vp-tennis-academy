import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Parse different date formats to Date object
function parseDate(str) {
    if (!str) return null;
    const ddmmyyyy = str.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (ddmmyyyy) return new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`);
    return new Date(str);
}

function inRange(dateStr, from, to) {
    const d = parseDate(dateStr);
    if (!d || isNaN(d)) return true;
    if (from && d < new Date(from)) return false;
    if (to) { const t = new Date(to); t.setHours(23, 59, 59); if (d > t) return false; }
    return true;
}

function formatINR(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function todayStr() { return new Date().toLocaleDateString('en-IN'); }

export default function Reports({ students, expenses, feeHistory }) {
    const [generating, setGenerating] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // ── Filtered data based on date range ──
    const filtStudents = students.filter(s => inRange(s.joinDate, fromDate, toDate));
    const filtFees = feeHistory.filter(f => inRange(f.date, fromDate, toDate));
    const filtExpenses = expenses.filter(e => inRange(e.date, fromDate, toDate));

    const totalFees = filtFees.reduce((s, f) => s + Number(f.amount), 0);
    const totalExp = filtExpenses.reduce((s, e) => s + Number(e.amount), 0);

    const dateLabel = fromDate || toDate
        ? `Period: ${fromDate ? new Date(fromDate).toLocaleDateString('en-IN') : 'Start'} — ${toDate ? new Date(toDate).toLocaleDateString('en-IN') : 'Today'}`
        : 'All Time';

    // ── PDF ──
    function makePDF(title, head, rows, filename) {
        setGenerating(filename + '_pdf');
        setTimeout(() => {
            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.setTextColor(40, 40, 40);
            doc.text('VP Tennis Court — Management Portal', 14, 16);
            doc.setFontSize(12);
            doc.setTextColor(70);
            doc.text(title, 14, 25);
            doc.setFontSize(9);
            doc.setTextColor(120);
            doc.text(`Generated: ${todayStr()}   |   ${dateLabel}`, 14, 32);
            autoTable(doc, {
                startY: 38,
                head: [head],
                body: rows,
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [102, 126, 234], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 247, 255] },
            });
            doc.save(filename + '.pdf');
            setGenerating('');
        }, 100);
    }

    // ── Excel ──
    function makeExcel(sheetName, head, rows, filename) {
        setGenerating(filename + '_excel');
        setTimeout(() => {
            const ws = XLSX.utils.aoa_to_sheet([
                [`VP Tennis Court — ${sheetName}`],
                [`Generated: ${todayStr()}`, dateLabel],
                [],
                head,
                ...rows,
            ]);
            ws['!cols'] = head.map(() => ({ wch: 20 }));
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
            XLSX.writeFile(wb, filename + '.xlsx');
            setGenerating('');
        }, 100);
    }

    // ── Report definitions (use filtered data) ──
    const reports = [
        {
            id: 'students',
            title: 'Students Report',
            description: 'Students enrolled within the selected date range (filtered by join date).',
            icon: '🎾',
            color: '#667eea',
            count: filtStudents.length,
            label: 'students',
            head: ['#', 'Name', 'Age', 'Phone', 'Email', 'Join Date', 'Fee/Month'],
            rows: () => filtStudents.map((s, i) => [
                i + 1, s.name, s.age || '-', s.phone || '-', s.email || '-',
                s.joinDate || '-', formatINR(s.monthlyFee || 0),
            ]),
        },
        {
            id: 'fees',
            title: 'Fee Collection Report',
            description: 'Fee transactions within the selected date range.',
            icon: '💰',
            color: '#51cf66',
            count: filtFees.length,
            label: 'transactions',
            head: ['#', 'Student', 'Month', 'Amount', 'Date'],
            rows: () => [...filtFees]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((f, i) => [i + 1, f.studentName, f.month, formatINR(f.amount), f.date]),
        },
        {
            id: 'expenses',
            title: 'Expenses Report',
            description: 'Expenses recorded within the selected date range.',
            icon: '💸',
            color: '#ff6b6b',
            count: filtExpenses.length,
            label: 'entries',
            head: ['#', 'Description', 'Category', 'Amount', 'Date'],
            rows: () => [...filtExpenses]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((e, i) => [i + 1, e.description, e.category || '-', formatINR(e.amount), e.date]),
        },
        {
            id: 'summary',
            title: 'Financial Summary',
            description: 'Overview of fees vs expenses for the selected date range.',
            icon: '📊',
            color: '#ffd43b',
            count: null,
            label: null,
            head: ['Metric', 'Value'],
            rows: () => [
                ['Period', dateLabel],
                ['Students (in range)', filtStudents.length],
                ['Fee Transactions', filtFees.length],
                ['Total Fees Collected', formatINR(totalFees)],
                ['Total Expenses', formatINR(totalExp)],
                ['Net Balance', formatINR(totalFees - totalExp)],
                ['Generated On', todayStr()],
            ],
        },
    ];

    const inputStyle = {
        padding: '8px 12px', borderRadius: '8px',
        border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
        background: 'var(--input-bg, rgba(255,255,255,0.07))',
        color: 'var(--text-primary, #fff)', fontSize: '13px', cursor: 'pointer',
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📋 Reports</h1>
                    <p className="page-subtitle">Generate and download date-wise reports in PDF or Excel format</p>
                </div>
            </div>

            {/* ── Date Filter Bar ── */}
            <div className="card" style={{ padding: '18px 22px', marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>📅 Date Range:</span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>From</label>
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={inputStyle} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>To</label>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={inputStyle} />
                    </div>

                    {(fromDate || toDate) && (
                        <button
                            onClick={() => { setFromDate(''); setToDate(''); }}
                            style={{
                                padding: '7px 14px', borderRadius: '8px',
                                border: '1px solid rgba(255,100,100,0.4)', background: 'transparent',
                                color: '#ff6b6b', fontSize: '12px', cursor: 'pointer', fontWeight: 600,
                            }}
                        >
                            ✕ Clear Filter
                        </button>
                    )}

                    <span style={{
                        marginLeft: 'auto', fontSize: '12px', fontWeight: 600,
                        color: fromDate || toDate ? '#51cf66' : 'var(--text-secondary)',
                        background: (fromDate || toDate) ? '#51cf6622' : 'transparent',
                        padding: '4px 10px', borderRadius: '20px',
                    }}>
                        {dateLabel}
                    </span>
                </div>
            </div>

            {/* ── Summary Stats (filtered) ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '14px', marginBottom: '28px',
            }}>
                {[
                    { label: 'Students', value: filtStudents.length, icon: '🎾' },
                    { label: 'Fee Transactions', value: filtFees.length, icon: '💰' },
                    { label: 'Total Collected', value: formatINR(totalFees), icon: '✅' },
                    { label: 'Total Expenses', value: formatINR(totalExp), icon: '💸' },
                    { label: 'Net Balance', value: formatINR(totalFees - totalExp), icon: '📈', color: totalFees - totalExp >= 0 ? '#51cf66' : '#ff6b6b' },
                ].map(stat => (
                    <div key={stat.label} className="card" style={{ padding: '14px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.6rem' }}>{stat.icon}</div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px', color: stat.color || 'inherit' }}>{stat.value}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Report Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '20px' }}>
                {reports.map(r => (
                    <div key={r.id} className="card" style={{ padding: '22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: '10px',
                                background: r.color + '22', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
                            }}>
                                {r.icon}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.title}</div>
                                {r.count !== null && (
                                    <div style={{ color: r.color, fontSize: '12px', fontWeight: 600 }}>
                                        {r.count} {r.label}
                                    </div>
                                )}
                            </div>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px', lineHeight: 1.5 }}>
                            {r.description}
                        </p>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => makePDF(r.title, r.head, r.rows(), r.id + '_report')}
                                disabled={!!generating}
                                style={{
                                    flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
                                    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                                    color: '#fff', fontWeight: 600, cursor: generating ? 'wait' : 'pointer',
                                    fontSize: '13px', opacity: generating ? 0.6 : 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                                }}
                            >
                                {generating === r.id + '_report_pdf' ? '⏳' : '📄'} PDF
                            </button>
                            <button
                                onClick={() => makeExcel(r.title, r.head, r.rows(), r.id + '_report')}
                                disabled={!!generating}
                                style={{
                                    flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
                                    background: 'linear-gradient(135deg, #27ae60, #1e8449)',
                                    color: '#fff', fontWeight: 600, cursor: generating ? 'wait' : 'pointer',
                                    fontSize: '13px', opacity: generating ? 0.6 : 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                                }}
                            >
                                {generating === r.id + '_report_excel' ? '⏳' : '📊'} Excel
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
