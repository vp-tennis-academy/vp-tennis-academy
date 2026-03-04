import { useState, useEffect } from 'react';
import Login from './Login';
import { fetchAds, fetchStats, fetchContactInfo, fetchOffers, fetchTournaments } from '../firebaseData';

const DEFAULT_TOURNAMENTS = [
    { id: 1, name: 'VP Tennis Open Championship', date: '2026-03-20', time: '09:00', venue: 'Main Court', type: 'Singles', category: 'Open', prize: '25000', match: 'Rahul Sharma vs Arjun Mehta' },
    { id: 2, name: 'Inter-Academy Doubles Cup', date: '2026-03-22', time: '10:30', venue: 'Court 2', type: 'Doubles', category: 'U-18', prize: '15000', match: 'Team Alpha vs Team Beta' },
    { id: 3, name: 'Spring Junior Series', date: '2026-03-28', time: '08:00', venue: 'Court 1', type: 'Singles', category: 'U-14', prize: '10000', match: 'Multiple Round Matches' },
    { id: 4, name: 'City Grand Slam Qualifier', date: '2026-04-05', time: '09:00', venue: 'Main Court', type: 'Singles', category: 'Pro / Open', prize: '50000', match: 'Qualification Rounds' },
];

const DEFAULT_ADS = [
    { id: 'a1', title: 'Professional Coaching', desc: 'Morning & Evening batches. Expert coaches with 10+ yrs.', color: '#667eea', cta: 'Enroll Now', imageBase64: '', imageUrl: '/ads/ad_coaching.png' },
    { id: 'a2', title: 'Racket Collection 2026', desc: 'Wilson, Babolat & Head at special academy prices.', color: '#51cf66', cta: 'Shop Now', imageBase64: '', imageUrl: '/ads/ad_rackets.png' },
    { id: 'a3', title: 'Summer Camp Open', desc: 'Intensive 4-week program for ages 8–18.', color: '#ff9f43', cta: 'Register', imageBase64: '', imageUrl: '/ads/ad_summer_camp.png' },
    { id: 'a4', title: 'Court Booking', desc: 'Book private court slots. AI-lit courts available.', color: '#ee5a24', cta: 'Book Now', imageBase64: '', imageUrl: '/ads/ad_court_booking.png' },
];

const DEFAULT_ICONS = { 'a1': '🎓', 'a2': '🎾', 'a3': '☀️', 'a4': '📅' };

const DEFAULT_STATS = [
    { icon: '🏆', val: '50+', label: 'Tournaments' },
    { icon: '🎾', val: '200+', label: 'Students' },
    { icon: '⭐', val: '10+', label: 'Years' },
    { icon: '🥇', val: '30+', label: 'Champions' },
];

const DEFAULT_CONTACTS = [
    { id: 'c1', type: 'address', icon: '📍', text: 'Vadodara, Gujarat' },
    { id: 'c2', type: 'email', icon: '✉️', text: 'vptennis@academy.com' },
    { id: 'c3', type: 'phone', icon: '📞', text: '+91 98765 43210' },
];

function getDaysLeft(d) { return Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000)); }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

export default function LandingPage() {
    const [showLogin, setShowLogin] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [tournaments, setTournaments] = useState(DEFAULT_TOURNAMENTS);
    const [ads, setAds] = useState(DEFAULT_ADS);
    const [offers, setOffers] = useState([]);
    const [stats, setStats] = useState(DEFAULT_STATS);
    const [contactInfo, setContactInfo] = useState(DEFAULT_CONTACTS);
    const [adIdx, setAdIdx] = useState(0);
    const adTimer = useState(() => ({ ref: null }))[0];

    // Load all data from Supabase
    const loadAll = async () => {
        const [dbAds, dbStats, dbContact, dbOffers, dbTours] = await Promise.all([
            fetchAds(), fetchStats(), fetchContactInfo(), fetchOffers(), fetchTournaments()
        ]);
        if (dbAds) setAds(dbAds);
        if (dbStats) setStats(dbStats);
        if (dbContact) setContactInfo(dbContact);
        if (dbOffers) setOffers(dbOffers); else setOffers([]);
        if (dbTours) setTournaments(dbTours);
    };

    useEffect(() => { loadAll(); }, []);

    // Refresh every 30 seconds to reflect admin changes on all devices
    useEffect(() => {
        const id = setInterval(loadAll, 30000);
        return () => clearInterval(id);
    }, []);

    // Also reload when the window regains focus
    useEffect(() => {
        window.addEventListener('focus', loadAll);
        return () => window.removeEventListener('focus', loadAll);
    }, []);

    // Reset adIdx if ads change
    useEffect(() => { setAdIdx(0); }, [ads.length]);

    const startAdTimer = () => {
        if (adTimer.ref) clearInterval(adTimer.ref);
        adTimer.ref = setInterval(() => setAdIdx(i => (i + 1) % (ads.length || 1)), 4000);
    };
    useEffect(() => {
        startAdTimer();
        return () => clearInterval(adTimer.ref);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ads.length]);

    const prevAd = () => { setAdIdx(i => (i - 1 + ads.length) % ads.length); startAdTimer(); };
    const nextAd = () => { setAdIdx(i => (i + 1) % ads.length); startAdTimer(); };
    const goAd = (i) => { setAdIdx(i); startAdTimer(); };

    if (showLogin) return <Login onBack={() => setShowLogin(false)} />;
    const login = () => setShowLogin(true);

    return (
        <>
            <style>{`
            *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
            html, body { overflow-x: hidden; scroll-behavior: smooth; }
            body { background: #060b14; color: #fff; font-family: 'Inter', system-ui, sans-serif; }
            ::-webkit-scrollbar { width: 5px; }
            ::-webkit-scrollbar-track { background: #0a0e1a; }
            ::-webkit-scrollbar-thumb { background: #667eea44; border-radius: 3px; }

            /* === NAV === */
            .lp-nav {
                position: fixed; top: 0; left: 0; right: 0; z-index: 999;
                height: 60px;
                display: flex; align-items: center;
                padding: 0 20px; gap: 12px;
                background: rgba(6,11,20,0.9);
                backdrop-filter: blur(18px);
                border-bottom: 1px solid rgba(255,255,255,0.07);
            }
            .lp-brand { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
            .lp-ball {
                width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
                background: linear-gradient(135deg,#667eea,#764ba2);
                display: flex; align-items: center; justify-content: center;
                font-size: 1rem; box-shadow: 0 0 18px #667eea55;
            }
            .lp-brand-title { font-weight: 800; font-size: clamp(13px,2vw,15px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .lp-brand-sub { font-size: 9px; color: rgba(255,255,255,0.3); letter-spacing: 1.5px; text-transform: uppercase; }
            .lp-nav-links { display: flex; gap: 24px; flex-shrink: 0; }
            .lp-nav-links a { color: rgba(255,255,255,0.5); text-decoration: none; font-size: 13px; font-weight: 500; transition: color .2s; }
            .lp-nav-links a:hover { color: #fff; }
            .lp-btn {
                display: flex; align-items: center; gap: 6px;
                padding: 8px 18px; border-radius: 50px; flex-shrink: 0;
                background: linear-gradient(135deg,#667eea,#764ba2);
                border: none; color: #fff; font-weight: 700; cursor: pointer;
                font-size: 13px; white-space: nowrap;
                box-shadow: 0 4px 18px #667eea44;
                transition: transform .15s;
            }
            .lp-btn:hover { transform: scale(1.04); }
            .lp-burger { display: none; background: none; border: none; color: #fff; font-size: 1.3rem; cursor: pointer; }
            .lp-mob { display: none; flex-direction: column; gap: 12px;
                position: fixed; top: 60px; left: 0; right: 0; z-index: 998;
                background: rgba(6,11,20,0.98); border-bottom: 1px solid rgba(255,255,255,0.08);
                padding: 18px 20px; }
            .lp-mob.open { display: flex; }
            .lp-mob a { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 15px; font-weight: 500; }

            /* === STATS STRIP === */
            .lp-stats {
                width: 100%;
                display: grid; grid-template-columns: repeat(4,1fr);
                border-top: 1px solid rgba(255,255,255,.07);
                border-bottom: 1px solid rgba(255,255,255,.07);
                background: rgba(102,126,234,.04);
            }
            .lp-stat {
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                padding: 28px 12px; text-align: center;
                border-right: 1px solid rgba(255,255,255,.07);
                transition: background .2s;
            }
            .lp-stat:last-child { border-right: none; }
            .lp-stat:hover { background: rgba(102,126,234,.07); }
            .lp-si { font-size: 1.6rem; margin-bottom: 8px; }
            .lp-sv {
                font-size: clamp(1.6rem,3vw,2.2rem); font-weight: 900;
                background: linear-gradient(135deg,#fff,#a78bfa);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
            }
            .lp-sl { color: rgba(255,255,255,.38); font-size: 11px; margin-top: 3px; }

            /* === BODY GRID === */
            .lp-body {
                display: flex; flex-direction: column; gap: 40px;
                width: 100%;
                padding: 40px 20px 80px; max-width: 1240px; margin: 0 auto;
                min-height: 40vh;
            }

            /* === TOURNAMENTS === */
            .lp-tour-col {
                width: 100%;
                min-width: 0;
            }
            .lp-tour-grid {
                display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;
            }
            .lp-sh { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
            .lp-sh h2 { font-size: clamp(14px,2vw,17px); font-weight: 700; white-space: nowrap; color: #fff; }
            .lp-sdiv { flex: 1; height: 1px; background: linear-gradient(to right, rgba(255,255,255,.12), transparent); }

            .lp-tc {
                background: rgba(255,255,255,.035); border: 1px solid rgba(255,255,255,.08);
                border-radius: 14px; padding: 18px 20px; margin-bottom: 12px;
                display: flex; gap: 14px; align-items: flex-start;
                transition: border-color .2s, transform .2s;
                min-width: 0;
            }
            .lp-tc:last-child { margin-bottom: 0; }
            .lp-tc:hover { border-color: rgba(102,126,234,.4); transform: translateX(3px); }
            .lp-tc-body { flex: 1; min-width: 0; }
            .lp-tc-name { font-weight: 700; font-size: 14px; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 4px; color: #fff; }
            .lp-tag { font-size: 10px; padding: 2px 8px; border-radius: 50px; font-weight: 600; flex-shrink: 0;
                background: rgba(102,126,234,.15); color: #a78bfa; border: 1px solid rgba(102,126,234,.3); }
            .lp-tag-g { background: rgba(255,255,255,.06); color: rgba(255,255,255,.45); border: 1px solid rgba(255,255,255,.1); }
            .lp-tc-match { color: rgba(255,255,255,.42); font-size: 12px; margin-bottom: 8px; }
            .lp-tc-meta { display: flex; flex-wrap: wrap; gap: 12px; }
            .lp-mi { display: flex; align-items: center; gap: 4px; font-size: 11px; color: rgba(255,255,255,.35); }
            .lp-tc-cd { text-align: center; flex-shrink: 0; min-width: 68px; }
            .lp-cdn { font-weight: 900; font-size: 1.8rem; line-height: 1; }
            .lp-cdl { font-size: 9px; color: rgba(255,255,255,.3); letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
            .lp-rbtn {
                margin-top: 8px; padding: 5px 10px; border-radius: 50px;
                font-size: 10px; font-weight: 600; cursor: pointer;
                background: transparent; border: 1px solid rgba(102,126,234,.45); color: #a78bfa;
                transition: background .2s;
            }
            .lp-rbtn:hover { background: rgba(102,126,234,.15); }

            /* === TOP ROW (ADS & NEWS) === */
            .lp-top-row {
                width: 100%; max-width: 1240px; margin: 0 auto; padding: 90px 20px 30px;
                display: flex; flex-direction: row; gap: 20px; align-items: stretch;
                height: 520px;
            }
            @media (max-width: 960px) {
                .lp-top-row { flex-direction: column; height: auto; }
                .lp-ads-col { width: 100% !important; height: 320px; }
                .lp-news-col { width: 100% !important; height: 260px; }
            }

            /* === ADS CAROUSEL === */
            .lp-ads-col {
                width: 65%;
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            .lp-carousel {
                flex: 1; position: relative; overflow: hidden;
                border-radius: 16px; width: 100%; height: 100%;
                background: #0b1322;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            }
            .lp-carousel-track {
                position: relative; width: 100%; height: 100%;
            }
            .lp-carousel-slide {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                opacity: 0; transition: opacity .5s cubic-bezier(.4,0,.2,1);
                pointer-events: none; z-index: 0;
            }
            .lp-carousel-slide.active {
                opacity: 1; pointer-events: auto; z-index: 1;
            }
            .lp-carousel-slide img {
                width: 100%; height: 100%; object-fit: contain; display: block;
                /* Background handles outer curves, so no inner radius/padding needed */
            }
            .lp-carousel-placeholder {
                width: 100%; height: 100%;
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                font-size: 3.5rem; gap: 10px;
            }
            .lp-carousel-overlay {
                position: absolute; bottom: 0; left: 0; right: 0;
                padding: 20px 18px 16px;
                background: linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.3) 70%, transparent 100%);
            }
            .lp-carousel-title { font-weight: 800; font-size: 16px; color: #fff; margin-bottom: 4px; }
            .lp-carousel-desc { font-size: 12px; color: rgba(255,255,255,.55); margin-bottom: 10px; line-height: 1.5; }
            .lp-carousel-cta {
                padding: 6px 16px; border-radius: 50px;
                font-size: 12px; font-weight: 700; cursor: pointer;
                background: transparent; transition: background .2s;
            }
            .lp-carousel-cta:hover { opacity: .85; }
            /* prev/next arrows */
            .lp-carr-btn {
                position: absolute; top: 50%; transform: translateY(-50%);
                width: 34px; height: 34px; border-radius: 50%;
                background: rgba(0,0,0,.5); backdrop-filter: blur(8px);
                border: 1px solid rgba(255,255,255,.15);
                color: #fff; cursor: pointer; font-size: 14px;
                display: flex; align-items: center; justify-content: center; z-index: 2;
                transition: background .2s;
            }
            .lp-carr-btn:hover { background: rgba(0,0,0,.8); }
            .lp-carr-prev { left: 10px; }
            .lp-carr-next { right: 10px; }
            /* dots */
            .lp-carr-dots {
                display: flex; justify-content: center; gap: 6px;
                margin-top: 12px;
            }
            .lp-carr-dot {
                width: 7px; height: 7px; border-radius: 50%;
                border: none; cursor: pointer; padding: 0;
                transition: background .2s, width .2s;
            }
            .lp-carr-dot.active { width: 22px; border-radius: 4px; }

            /* === NEWS & OFFERS COLUMN === */
            .lp-news-col {
                flex: 1;
                height: 100%;
                background: linear-gradient(145deg, #0b1527, #060b14);
                border-radius: 16px; border: 1px solid rgba(102,126,234,.15);
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                display: flex; flex-direction: column; overflow: hidden;
            }
            .lp-news-header {
                padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,.05);
                font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 10px;
                background: rgba(0,0,0,0.2);
            }
            .lp-news-list {
                flex: 1; overflow-y: auto; padding: 0; margin: 0; list-style: none;
                display: flex; flex-direction: column; max-height: 480px;
            }
            .lp-news-list::-webkit-scrollbar { width: 4px; }
            .lp-news-list::-webkit-scrollbar-track { background: transparent; }
            .lp-news-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 4px; }
            .lp-news-item {
                padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,.03);
                display: flex; flex-direction: column; gap: 6px;
            }
            .lp-news-item:last-child { border-bottom: none; }
            .lp-news-tag-row { display: flex; align-items: center; gap: 8px; }
            .lp-news-tag { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
            .lp-news-title { font-size: 14px; font-weight: 600; line-height: 1.3; }
            .lp-news-desc { font-size: 12px; color: rgba(255,255,255,.5); line-height: 1.4; }

            /* === FOOTER === */
            .lp-footer {
                width: 100%;
                background: rgba(0,0,0,.35); border-top: 1px solid rgba(255,255,255,.07);
                padding: 28px clamp(16px,4vw,48px);
                display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;
            }
            .lp-fname { font-weight: 800; font-size: 14px; margin-bottom: 3px; }
            .lp-finfo { color: rgba(255,255,255,.3); font-size: 12px; line-height: 1.7; }
            .lp-fcopy { color: rgba(255,255,255,.15); font-size: 11px; margin-top: 5px; }

            /* === RESPONSIVE === */
            @media (max-width: 900px) {
                .lp-nav-links { display: none; }
                .lp-burger { display: block; }
                .lp-stats { grid-template-columns: repeat(2,1fr); }
                .lp-stat:nth-child(2) { border-right: none; }
                .lp-stat:nth-child(1), .lp-stat:nth-child(2) { border-bottom: 1px solid rgba(255,255,255,.07); }
                .lp-body { grid-template-columns: 1fr; }
                .lp-tour-col { border-right: none; border-bottom: 1px solid rgba(255,255,255,.07); }
            }
            @media (max-width: 550px) {
                .lp-tc { flex-direction: column; }
                .lp-tc-cd { display: flex; align-items: center; gap: 12px; border-top: 1px solid rgba(255,255,255,.06); padding-top: 10px; width: 100%; }
                .lp-ctas { flex-direction: column; align-items: stretch; }
                .lp-cta-p, .lp-cta-o { justify-content: center; }
                .lp-footer { flex-direction: column; align-items: flex-start; }
            }
        `}</style>

            <div style={{ background: '#060b14', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>

                {/* NAV */}
                <nav className="lp-nav">
                    <div className="lp-brand">
                        <div className="lp-ball">🎾</div>
                        <div>
                            <div className="lp-brand-title">VP Tennis Academy</div>
                            <div className="lp-brand-sub">Management Portal</div>
                        </div>
                    </div>
                    <div className="lp-nav-links">
                        <a href="#matches">Tournaments</a>
                        <a href="#offers">Offers</a>
                        <a href="#footer">Contact</a>
                    </div>
                    <button className="lp-btn" onClick={login}>👤 Login</button>
                    <button className="lp-burger" onClick={() => setMenuOpen(m => !m)}>{menuOpen ? '✕' : '☰'}</button>
                </nav>

                {menuOpen && (
                    <div className="lp-mob open">
                        <a href="#matches" onClick={() => setMenuOpen(false)}>🏆 Tournaments</a>
                        <a href="#offers" onClick={() => setMenuOpen(false)}>📢 Offers</a>
                        <a href="#footer" onClick={() => setMenuOpen(false)}>📍 Contact</a>
                        <button className="lp-btn" onClick={login} style={{ alignSelf: 'flex-start', marginTop: 4 }}>🚀 Login to Portal</button>
                    </div>
                )}

                {/* TOP SECTION: ADS & NEWS */}
                <div className="lp-top-row" id="offers">

                    {/* LEFT: ADS SLIDER */}
                    <div className="lp-ads-col">
                        {ads.length === 0 ? (
                            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.15)', fontSize: 14, minHeight: 240, border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16 }}>
                                No advertisements added
                            </div>
                        ) : (
                            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {/* Slide track */}
                                <div className="lp-carousel"
                                    onMouseEnter={() => clearInterval(adTimer.ref)}
                                    onMouseLeave={startAdTimer}>
                                    <div className="lp-carousel-track">
                                        {ads.map((ad, idx) => (
                                            <div className={`lp-carousel-slide ${idx === adIdx ? 'active' : ''}`} key={ad.id || idx}>
                                                {(ad.imageBase64 || ad.imageUrl)
                                                    ? <img src={ad.imageBase64 || ad.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                                                    : <div className="lp-carousel-placeholder" style={{ background: `linear-gradient(135deg,${ad.color || '#667eea'}22,${ad.color || '#667eea'}08)` }}>
                                                        {DEFAULT_ICONS[ad.id] || '📢'}
                                                    </div>
                                                }
                                            </div>
                                        ))}
                                    </div>
                                    {/* Arrows */}
                                    {ads.length > 1 && <>
                                        <button className="lp-carr-btn lp-carr-prev" onClick={e => { e.stopPropagation(); prevAd(); }}>&#8249;</button>
                                        <button className="lp-carr-btn lp-carr-next" onClick={e => { e.stopPropagation(); nextAd(); }}>&#8250;</button>
                                    </>}
                                </div>
                                {/* Dots */}
                                {ads.length > 1 && (
                                    <div className="lp-carr-dots">
                                        {ads.map((ad, i) => (
                                            <button key={i} className={`lp-carr-dot ${i === adIdx ? 'active' : ''}`}
                                                style={{ background: i === adIdx ? (ads[adIdx]?.color || '#667eea') : 'rgba(255,255,255,0.2)' }}
                                                onClick={() => goAd(i)} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: OFFERS & NEWS — always visible */}
                    <div className="lp-news-col">
                        <div className="lp-news-header">
                            📢 Offers &amp; Updates
                        </div>
                        {offers.length === 0 ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.2)', gap: 10, padding: 24 }}>
                                <span style={{ fontSize: '2rem' }}>📭</span>
                                <span style={{ fontSize: 13 }}>No offers yet</span>
                            </div>
                        ) : (
                            <ul className="lp-news-list">
                                {offers.map((off, i) => (
                                    <li className="lp-news-item" key={off.id || i}>
                                        <div className="lp-news-tag-row">
                                            <span style={{ fontSize: '1.2rem' }}>{off.icon}</span>
                                            <span className="lp-news-tag" style={{ background: `${off.color}25`, color: off.color, border: `1px solid ${off.color}40` }}>{off.tag}</span>
                                        </div>
                                        <div className="lp-news-title">{off.title}</div>
                                        {off.desc && <div className="lp-news-desc">{off.desc}</div>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* STATS STRIP */}
                <div className="lp-stats" style={{ marginTop: 40 }}>
                    {stats.map(s => (
                        <div className="lp-stat" key={s.label}>
                            <div className="lp-si">{s.icon}</div>
                            <div className="lp-sv">{s.val}</div>
                            <div className="lp-sl">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* BODY — Full Width */}
                <div className="lp-body" id="matches">
                    {/* TOURNAMENTS */}
                    <div className="lp-tour-col">
                        <div className="lp-sh"><h2>🏆 Upcoming Tournaments &amp; Matches</h2><div className="lp-sdiv" /></div>
                        <div className="lp-tour-grid">
                            {tournaments.map(t => {
                                const days = getDaysLeft(t.date);
                                const dColor = days <= 7 ? '#ff6b6b' : days <= 14 ? '#ffd43b' : '#4ade80';
                                const prizeNum = Number(t.prize);
                                return (
                                    <div className="lp-tc" key={t.id}>
                                        <div className="lp-tc-body">
                                            <div className="lp-tc-name">
                                                {t.name}
                                                <span className="lp-tag">{t.type}</span>
                                                <span className="lp-tag lp-tag-g">{t.category}</span>
                                            </div>
                                            {t.match && <div className="lp-tc-match">⚡ {t.match}</div>}
                                            <div className="lp-tc-meta">
                                                {t.date && <span className="lp-mi">📅 {fmtDate(t.date)}</span>}
                                                {t.time && <span className="lp-mi">🕐 {t.time.substring(0, 5)}</span>}
                                                {t.venue && <span className="lp-mi">📍 {t.venue}</span>}
                                                {t.prize && <span className="lp-mi" style={{ color: '#ffd43b' }}>🏅 ₹{prizeNum ? prizeNum.toLocaleString() : t.prize}</span>}
                                            </div>
                                        </div>
                                        <div className="lp-tc-cd">
                                            <div className="lp-cdn" style={{ color: dColor }}>{days}</div>
                                            <div className="lp-cdl">days left</div>
                                            <button className="lp-rbtn" onClick={login}>Register</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <footer className="lp-footer" id="footer">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBot: 6 }}>
                            <div className="lp-ball" style={{ width: 30, height: 30, fontSize: '0.8rem' }}>🎾</div>
                            <div className="lp-fname">VP Tennis Academy</div>
                        </div>
                        <div className="lp-finfo">
                            {contactInfo.map((c, i) => (
                                <span key={c.id}>
                                    {c.icon} {c.text}
                                    {i < contactInfo.length - 1 && <span> &nbsp;·&nbsp; </span>}
                                </span>
                            ))}
                        </div>
                        <div className="lp-fcopy">© 2026 VP Tennis Academy. All rights reserved.</div>
                    </div>
                </footer>
            </div >
        </>
    );
}
