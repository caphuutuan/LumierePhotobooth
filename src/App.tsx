/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';
import { About } from './components/About';
import { Services } from './components/Services';
import { Portfolio } from './components/Portfolio';
import { Pricing } from './components/Pricing';
import { Testimonials } from './components/Testimonials';
import { Process } from './components/Process';
import { FAQ } from './components/FAQ';
import { ContactForm } from './components/ContactForm';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { MobileBookingBar } from './components/MobileBookingBar';
import { ContactFloat } from './components/ContactFloat';

import { SmoothScroll } from './components/SmoothScroll';
import { BookingProvider } from './context/BookingContext';
import { BookingModal } from './components/BookingModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminBookings } from './components/admin/AdminBookings';
import { AdminContent } from './components/admin/AdminContent';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminUsers } from './components/admin/AdminUsers';
import { Login } from './components/Login';
import { Account } from './components/Account';
import { Toaster } from 'react-hot-toast';

function MainSite() {
  return (
    <div className="min-h-screen selection:bg-primary/20">
      <Navbar />
      
      <main>
        <Hero />
        <Stats />
        <About />
        <Services />
        <Portfolio />
        <Pricing />
        <Testimonials />
        <Process />
        <FAQ />
        <ContactForm />
        <FinalCTA />
      </main>

      <Footer />
      <MobileBookingBar />
      <ContactFloat />
    </div>
  );
}

export default function App() {
  return (
    <BookingProvider>
      <Router>
        <SmoothScroll>
          <Routes>
            <Route path="/" element={<MainSite />} />
            <Route path="/login" element={<Login />} />
            <Route path="/account" element={<Account />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </SmoothScroll>
      </Router>
      <BookingModal />
      <Toaster position="bottom-right" reverseOrder={false} />
    </BookingProvider>
  );
}
