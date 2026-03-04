import { useState, useEffect } from 'react';
import { fetchContactInfo, saveContactInfo } from '../firebaseData';

const DEFAULT_CONTACTS = [
    { id: 'c1', type: 'address', icon: '📍', text: 'Vadodara, Gujarat' },
    { id: 'c2', type: 'email', icon: '✉️', text: 'vptennis@academy.com' },
    { id: 'c3', type: 'phone', icon: '📞', text: '+91 98765 43210' },
];

export default function ContactManager() {
    const [contacts, setContacts] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState(false);

    useEffect(() => {
        fetchContactInfo().then(data => {
            if (data) setContacts(data);
            else setContacts([...DEFAULT_CONTACTS]);
        });
    }, []);

    const handleAdd = () => {
        const newContact = {
            id: 'c' + Date.now(),
            type: 'custom',
            icon: '🔗',
            text: 'New Contact Info'
        };
        setContacts([...contacts, newContact]);
    };

    const handleRemove = (id) => {
        if (confirm('Remove this contact item?')) {
            setContacts(contacts.filter(c => c.id !== id));
        }
    };

    const handleChange = (id, field, value) => {
        setContacts(contacts.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveContactInfo(contacts);
            setSavedMsg(true);
            setTimeout(() => setSavedMsg(false), 3000);
        } catch (err) {
            console.error('Failed to save contacts', err);
            alert('Failed to save contact info. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset contact info to default?')) {
            setContacts([...DEFAULT_CONTACTS]);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-title">
                    <h1>Contact Information</h1>
                    <p>Manage the contact details shown in the footer of the public landing page</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 800 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0 }}>Footer Contacts</h3>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 15, marginBottom: 20 }}>
                    {contacts.map((contact) => (
                        <div key={contact.id} style={{
                            display: 'flex',
                            gap: 15,
                            padding: 15,
                            background: 'var(--bg-lighter)',
                            borderRadius: 8,
                            border: '1px solid var(--border)',
                            alignItems: 'center'
                        }}>
                            <div className="form-group" style={{ marginBottom: 0, width: '80px', flexShrink: 0 }}>
                                <label>Icon</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={contact.icon}
                                    onChange={(e) => handleChange(contact.id, 'icon', e.target.value)}
                                    style={{ textAlign: 'center', fontSize: '1.2rem' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                                <label>Contact Detail (e.g. Phone, Address, Link)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={contact.text}
                                    onChange={(e) => handleChange(contact.id, 'text', e.target.value)}
                                />
                            </div>
                            <button
                                className="btn btn-outline"
                                onClick={() => handleRemove(contact.id)}
                                style={{ color: 'var(--danger)', borderColor: 'transparent', padding: '8px 12px', marginTop: 20 }}
                                title="Remove item"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}

                    {contacts.length === 0 && (
                        <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 8 }}>
                            No contact information added yet.
                        </div>
                    )}
                </div>

                <button className="btn" onClick={handleAdd} style={{ background: 'var(--bg-lighter)', border: '1px dashed var(--border)', width: '100%', color: 'var(--primary)' }}>
                    + Add New Contact Item
                </button>

                <div style={{ marginTop: 20, padding: 15, background: 'rgba(76, 201, 240, 0.1)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>💡</span>
                    <div>
                        <strong>Tip:</strong> These items will be displayed horizontally in the website footer, separated by standard bullet points (&middot;). Keep text reasonably concise.
                    </div>
                </div>
            </div>
        </div>
    );
}
