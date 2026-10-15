import { useEffect, useState } from 'react';
import { Link, Outlet, Route, Routes } from 'react-router-dom';
import { api } from './lib/api';
import { BottomNav, SiteFooter, SiteHeader } from './components/Chrome';
import Home from './pages/Home';
import CaseStudy from './pages/CaseStudy';
import Contact from './pages/Contact';
import Login from './pages/admin/Login';
import Studio from './pages/admin/Studio';

function PublicLayout() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/profile').then(setProfile).catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:font-sans focus:text-label-sm focus:text-on-primary"
      >
        Skip to content
      </a>
      <SiteHeader profile={profile} />
      <main id="main" className="flex-1 pb-20 pt-16 md:pb-0">
        <Outlet />
      </main>
      <SiteFooter profile={profile} />
      <BottomNav />
    </div>
  );
}

function NotFound() {
  return (
    <div className="shell flex min-h-[50vh] flex-col items-center justify-center gap-space-md py-space-2xl text-center">
      <span className="font-mono text-code-xs uppercase tracking-widest text-outline">Error 404</span>
      <h1 className="font-serif text-display-hero text-on-surface">Plate not found</h1>
      <p className="max-w-md text-body-md text-on-surface-variant">
        This route is not part of the archival catalog. Return to the index of works to continue reading.
      </p>
      <Link to="/" className="flex min-h-[48px] items-center gap-2 rounded-xl bg-primary px-space-md font-sans text-label-md text-on-primary shadow-sm hover:bg-primary-container">
        <span className="material-symbols-outlined text-[18px]">grid_view</span>
        Back to Selected Work
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/work/:slug" element={<CaseStudy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<Studio />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
