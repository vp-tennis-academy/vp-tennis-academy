import { useState, useEffect } from 'react';
import { fetchStats, saveStats } from '../firebaseData';

const DEFAULT_STATS = [
    { icon: '🏆', val: '50+', label: 'Tournaments' },
    { icon: '🎾', val: '200+', label: 'Students' },
    { icon: '⭐', val: '10+', label: 'Years' },
    { icon: '🥇', val: '30+', label: 'Champions' },
];

export default function StatsManager() {
    const [stats, setStats] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState(false);

    useEffect(() => {
        fetchStats().then(data => {
            if (data) setStats(data);
            else setStats([...DEFAULT_STATS]);
        });
    }, []);

    const handleChange = (index, field, value) => {
        const newStats = [...stats];
        newStats[index] = { ...newStats[index], [field]: value };
        setStats(newStats);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveStats(stats);
            setSavedMsg(true);
            setTimeout(() => setSavedMsg(false), 3000);
        } catch (err) {
            console.error('Failed to save stats', err);
            alert('Failed to save statistics. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all stats to their default values?')) {
            setStats([...DEFAULT_STATS]);
        }
    };

    if (stats.length === 0) return <div style={{ padding: 20 }}>Loading...</div>;

    return (
        <div>
            <div className="page-header">
                <div className="page-title">
                    <h1>Key Statistics</h1>
                    <p>Manage the 4 key numbers shown on the public landing page</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 800 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0 }}>Landing Page Stats</h3>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        {savedMsg && <span style={{ color: 'var(--success)', fontSize: 13 }}>✅ Saved successfully!</span>}
                        <button className="btn btn-outline" onClick={handleReset} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                            Reset Defaults
                        </button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                    {stats.map((stat, idx) => (
                        <div key={idx} style={{
                            display: 'grid',
                            gridTemplateColumns: '80px 1fr 1fr',
                            gap: 15,
                            padding: 15,
                            background: 'var(--bg-lighter)',
                            borderRadius: 8,
                            border: '1px solid var(--border)'
                        }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Icon/Emoji</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={stat.icon}
                                    onChange={(e) => handleChange(idx, 'icon', e.target.value)}
                                    style={{ textAlign: 'center', fontSize: '1.2rem' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Value (e.g. 50+)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={stat.val}
                                    onChange={(e) => handleChange(idx, 'val', e.target.value)}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Label (e.g. Tournaments)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={stat.label}
                                    onChange={(e) => handleChange(idx, 'label', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 20, padding: 15, background: 'rgba(76, 201, 240, 0.1)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>💡</span>
                    <div>
                        <strong>Tip:</strong> These 4 stats are displayed prominently in a strip across the middle of the landing page. Keep values short (e.g., "50+", "2M") and labels concise for the best look.
                    </div>
                </div>
            </div>
        </div>
    );
}
