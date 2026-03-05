import { useState, useEffect } from 'react';
import './index.css';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Expenses from './components/Expenses';
import Reports from './components/Reports';
import UserManagement from './components/UserManagement';
import BackupRestore from './components/BackupRestore';
import Categories from './components/Categories';
import TournamentsManager from './components/TournamentsManager';
import AdvertisementsManager from './components/AdvertisementsManager';
import OffersNews from './components/OffersNews';
import StatsManager from './components/StatsManager';
import ContactManager from './components/ContactManager';
import { initialStudents, initialExpenses, feeHistory as initialFeeHistory } from './data/mockData';

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mockUser, setMockUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeView, setActiveView] = useState('dashboard');

  // Load from localStorage first, fall back to mockData
  const [students, setStudents] = useState(() => {
    try { const s = localStorage.getItem('vp_students'); return s ? JSON.parse(s) : initialStudents; } catch { return initialStudents; }
  });
  const [expenses, setExpenses] = useState(() => {
    try { const e = localStorage.getItem('vp_expenses'); return e ? JSON.parse(e) : initialExpenses; } catch { return initialExpenses; }
  });
  const [feeHistory, setFeeHistory] = useState(() => {
    try { const f = localStorage.getItem('vp_feeHistory'); return f ? JSON.parse(f) : initialFeeHistory; } catch { return initialFeeHistory; }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-save to localStorage whenever data changes
  useEffect(() => { localStorage.setItem('vp_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('vp_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('vp_feeHistory', JSON.stringify(feeHistory)); }, [feeHistory]);

  useEffect(() => {
    // Check for local mock user
    const savedMock = localStorage.getItem('vp_mock_user');
    if (savedMock) {
      setMockUser(JSON.parse(savedMock));
    }
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    if (mockUser) {
      localStorage.removeItem('vp_mock_user');
      setMockUser(null);
    }

    setActiveView('dashboard');
    setMobileOpen(false);
  };

  if (loading) {
    return (
      <div className="login-page">
        <div className="login-spinner"></div>
      </div>
    );
  }

  if (!mockUser) {
    return <LandingPage />;
  }

  const user = {
    name: mockUser.name,
    role: mockUser.role,
    email: `${mockUser.name.toLowerCase()}@vptennis.com`,
    avatar: null
  };

  const isAdmin = user.role === 'admin';

  return (
    <div className="layout">
      <header className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setMobileOpen(o => !o)} aria-label="Open menu">
          <span className={`hamburger-icon ${mobileOpen ? 'open' : ''}`}>
            <span /><span /><span />
          </span>
        </button>
        <div className="topbar-brand">
          <span>🎾</span>
          <span>VP Tennis Court</span>
        </div>
        <div style={{ width: 44 }} />
      </header>

      <Sidebar
        active={activeView}
        setActive={setActiveView}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        user={user}
        onLogout={handleLogout}
        isAdmin={isAdmin}
      />

      <main className="main-content">
        {activeView === 'dashboard' && (
          <Dashboard
            students={students}
            expenses={expenses}
            feeHistory={feeHistory}
            setActive={setActiveView}
            isAdmin={isAdmin}
          />
        )}
        {activeView === 'students' && (
          <Students
            students={students}
            setStudents={setStudents}
            feeHistory={feeHistory}
            setFeeHistory={setFeeHistory}
            expenses={expenses}
            isAdmin={isAdmin}
          />
        )}
        {activeView === 'expenses' && (
          <Expenses
            expenses={expenses}
            setExpenses={setExpenses}
            students={students}
            feeHistory={feeHistory}
            isAdmin={isAdmin}
          />
        )}
        {activeView === 'reports' && isAdmin && (
          <Reports
            students={students}
            expenses={expenses}
            feeHistory={feeHistory}
          />
        )}
        {activeView === 'users' && isAdmin && (
          <UserManagement />
        )}
        {activeView === 'categories' && isAdmin && (
          <Categories />
        )}
        {activeView === 'tournaments' && isAdmin && (
          <TournamentsManager />
        )}
        {activeView === 'advertisements' && isAdmin && (
          <AdvertisementsManager />
        )}
        {activeView === 'offers_news' && isAdmin && (
          <OffersNews />
        )}
        {activeView === 'stats' && isAdmin && (
          <StatsManager />
        )}
        {activeView === 'contact' && isAdmin && (
          <ContactManager />
        )}
        {activeView === 'backup' && isAdmin && (
          <BackupRestore
            students={students}
            expenses={expenses}
            feeHistory={feeHistory}
          />
        )}
      </main>
    </div>
  );
}

export default App;
