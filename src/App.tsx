import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from './components/ui/sonner';

const Home          = lazy(() => import('./pages/Home'));
const Shop          = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart          = lazy(() => import('./pages/Cart'));
const Checkout      = lazy(() => import('./pages/Checkout'));
const Profile       = lazy(() => import('./pages/Profile'));
const Admin         = lazy(() => import('./pages/Admin'));
const Login         = lazy(() => import('./pages/Login'));
const About         = lazy(() => import('./pages/About'));
const FAQ           = lazy(() => import('./pages/FAQ'));
const Shipping      = lazy(() => import('./pages/Shipping'));
const SizeGuide     = lazy(() => import('./pages/SizeGuide'));
const TrackOrder    = lazy(() => import('./pages/TrackOrder'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="space-y-4 text-center">
      <div className="w-10 h-10 border-2 border-brand-primary/20 border-t-brand-accent animate-spin mx-auto" />
      <p className="text-[10px] uppercase tracking-widest font-bold text-brand-primary/40">Loading</p>
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col font-sans selection:bg-brand-accent selection:text-brand-primary">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Login — no header/footer chrome */}
                <Route path="/login" element={<Login />} />

                {/* All other pages — with header + footer */}
                <Route
                  path="*"
                  element={
                    <>
                      <Header />
                      <main className="flex-1">
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            {/* Public routes */}
                            <Route path="/"            element={<Home />} />
                            <Route path="/shop"        element={<Shop />} />
                            <Route path="/product/:id" element={<ProductDetail />} />
                            <Route path="/cart"        element={<Cart />} />
                            <Route path="/about"       element={<About />} />
                            <Route path="/faq"         element={<FAQ />} />
                            <Route path="/shipping"    element={<Shipping />} />
                            <Route path="/size-guide"  element={<SizeGuide />} />
                            <Route path="/track"       element={<TrackOrder />} />

                            {/* Protected routes */}
                            <Route path="/checkout" element={
                              <ProtectedRoute><Checkout /></ProtectedRoute>
                            } />
                            <Route path="/profile" element={
                              <ProtectedRoute><Profile /></ProtectedRoute>
                            } />
                            <Route path="/admin" element={
                              <ProtectedRoute><Admin /></ProtectedRoute>
                            } />

                            <Route path="*" element={<Home />} />
                          </Routes>
                        </Suspense>
                      </main>
                      <Footer />
                    </>
                  }
                />
              </Routes>
            </Suspense>
            <Toaster position="top-right" expand={false} />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
