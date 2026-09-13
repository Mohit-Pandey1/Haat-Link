import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Building2,
  Check,
  FileCheck2,
  Handshake,
  Languages,
  LayoutGrid,
  LogOut,
  Settings2,
  Sparkles,
  Sprout,
  Store,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

const farmerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/crops', label: 'My Crops', icon: Sprout },
  {
    to: '/market',
    label: 'Market Intelligence',
    icon: TrendingUp,
    badge: 'LIVE',
  },
  { to: '/buyers', label: 'Buyers', icon: Store },
  {
    to: '/recommendation',
    label: 'Smart Recommendations',
    icon: Sparkles,
    ai: true,
  },
  { to: '/deals', label: 'My Deals', icon: Handshake, count: '3 active' },
];

const buyerLinks = [
  { to: '/buyer/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/buyer/requirements', label: 'Requirements', icon: FileCheck2 },
  { to: '/buyer/orders', label: 'Orders', icon: Building2 },
];

function Frame({ buyer = false }) {
  const { farmer, buyerUser, setRole, toast, setToast } = useApp();
  const { user: authUser, logout } = useAuth();
  const nav = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [language, setLanguage] = useState(
    () => localStorage.getItem('haatlink-language') || 'en'
  );

  const displayUser = buyer ? buyerUser : farmer;
  const items = buyer ? buyerLinks : farmerLinks;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setRole('farmer');
      nav('/login');
    }
  };

  const handlePerspectiveChange = (targetRole) => {
    setRole(targetRole);
    nav(targetRole === 'buyer' ? '/buyer/dashboard' : '/dashboard');
  };

  const toggleLanguage = () => {
    const nextLanguage = language === 'en' ? 'mr' : 'en';
    setLanguage(nextLanguage);
    localStorage.setItem('haatlink-language', nextLanguage);
    setToast(
      nextLanguage === 'mr'
        ? 'भाषा मराठीवर सेट केली'
        : 'Language set to English'
    );
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand-row">
          <div className="brand">
            <i>
              <Sprout size={18} />
            </i>{' '}
            Haat<span>Link</span>
          </div>
          <span className="apmc-live">
            <i /> APMC LIVE
          </span>
        </div>
        <small className="sidebar-context">
          {buyer ? 'Procurement desk' : 'Farmer desk'}
        </small>

        <div className="perspective-switch" title="Switch workspace view">
          <button
            type="button"
            className={!buyer ? 'active' : ''}
            onClick={() => handlePerspectiveChange('farmer')}
          >
            <Sprout size={15} /> Farmer
          </button>
          <button
            type="button"
            className={buyer ? 'active' : ''}
            onClick={() => handlePerspectiveChange('buyer')}
          >
            <Building2 size={15} /> Buyer
          </button>
        </div>

        <nav className="sidebar-nav" data-scroll-section data-scroll>
          <small className="nav-section-label">Workspace</small>
          {items.map(({ to, icon: Icon, label, badge, count, ai }) => (
            <NavLink
              key={to}
              to={to}
              className={ai ? 'nav-ai-link' : undefined}
            >
              <>
                <span className="nav-active-rail" />
                {React.createElement(Icon, {
                  className: 'nav-icon',
                  size: 18,
                  strokeWidth: 1.8,
                })}
                <span className="nav-label">{label}</span>
                {badge && <em className="nav-live-badge">{badge}</em>}
                {count && <em className="nav-count-badge">{count}</em>}
                {ai && <span className="nav-ai-sheen" />}
              </>
            </NavLink>
          ))}
        </nav>

        <div className="side-bottom">
          <small className="nav-section-label">Account</small>
          <button
            className="profile-mini-card"
            type="button"
            onClick={() => setShowProfile(true)}
          >
            <span className="profile-avatar">{displayUser.initials}</span>
            <span className="profile-mini-copy">
              <strong>{displayUser.name}</strong>
              <small>
                <Check size={11} /> MahaAgri Verified
              </small>
            </span>
            <Settings2 size={15} />
          </button>
          <button
            className="sidebar-account-action"
            type="button"
            onClick={toggleLanguage}
          >
            <Languages size={16} /> Language{' '}
            <em>{language === 'en' ? 'EN / मराठी' : 'मराठी / EN'}</em>
          </button>
          <button
            className="sidebar-logout"
            type="button"
            onClick={handleLogout}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="content">
        <header>
          <span>
            {buyer ? 'Buyer' : 'Farmer'} desk <b>/</b>{' '}
            {buyer ? 'Procurement' : 'Market prices'}
          </span>
          <div
            className="header-profile-pill"
            onClick={() => setShowProfile(true)}
            style={{ cursor: 'pointer' }}
            title="Click to view profile details"
          >
            <strong className="header-avatar">{displayUser.initials}</strong>
            <span className="header-profile-copy">
              <b>{displayUser.name}</b>
              <small>{displayUser.location}</small>
            </span>
            <span className="header-verified">
              <Check size={11} /> MahaAgri Verified Farmer
            </span>
          </div>
        </header>

        <div className="page">
          <Outlet />
        </div>
      </main>

      {showProfile && (
        <Modal title="User Profile" onClose={() => setShowProfile(false)}>
          <div
            className="detail"
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <p>
              <strong>Name:</strong> {authUser?.name || displayUser.name}
            </p>
            <p>
              <strong>Username:</strong> {authUser?.username || '—'}
            </p>
            <p>
              <strong>Phone:</strong> {authUser?.phone || displayUser.phone}
            </p>
            <p>
              <strong>Registered Role:</strong>{' '}
              <span style={{ textTransform: 'capitalize' }}>
                {authUser?.role || (buyer ? 'buyer' : 'farmer')}
              </span>
            </p>
            <p>
              <strong>Active Workspace:</strong>{' '}
              {buyer ? 'Institutional Buyer' : 'Producer / Farmer'}
            </p>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="secondary"
                onClick={() => setShowProfile(false)}
              >
                Close
              </button>
              <button type="button" className="primary" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <div className="toast">
          ✓ {toast}
          <button onClick={() => setToast(null)}>×</button>
        </div>
      )}
    </div>
  );
}

export function Layout() {
  return <Frame />;
}

export function BuyerLayout() {
  return <Frame buyer />;
}
