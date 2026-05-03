import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { Toaster } from './components/ui/sonner';

const Home          = lazy(() => import('./pages/Home'));
const Shop          = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart          = lazy(() => import('./pages/Cart'));
const Checkout      = lazy(() => import('./pages/Checkout'));
const Profile       = lazy(() => import('./pages/Profile'));
const Login         = lazy(() => import('./pages/Login'));
const About         = lazy(() => import('./pages/About'));
const FAQ           = lazy(() => import('./pages/FAQ'));
const Shipping      = lazy(() => import('./pages/Shipping'));
const SizeGuide     = lazy(() => import('./pages/SizeGuide'));
const TrackOrder    = lazy(() => import('./pages/TrackOrder'));

// Admin — nested under AdminLayout
const AdminLayout      = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard   = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts    = lazy(() => import('./pages/admin/Products'));
const AdminProductForm = lazy(() => import('./pages/admin/ProductForm'));
const AdminCategories  = lazy(() => import('./pages/admin/Categories'));
const AdminOrders      = lazy(() => import('./pages/admin/Orders'));
const AdminPolicies    = lazy(() => import('./pages/admin/Policies'));
const AdminSizeGuide   = lazy(() => import('./pages/admin/SizeGuideAdmin'));
const AdminDiscounts   = lazy(() => import('./pages/admin/Discounts'));

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
          <WishlistProvider>
          <div className="min-h-screen flex flex-col font-sans selection:bg-brand-accent selection:text-brand-primary">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Login — no chrome */}
                <Route path="/login" element={<Login />} />

                {/* Admin — protected, uses its own AdminLayout (no main Header/Footer) */}
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <Suspense fallback={<PageLoader />}>
                      <AdminLayout />
                    </Suspense>
                  </ProtectedRoute>
                }>
                  <Route index element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
                  <Route path="products" element={<Suspense fallback={<PageLoader />}><AdminProducts /></Suspense>} />
                  <Route path="products/:id" element={<Suspense fallback={<PageLoader />}><AdminProductForm /></Suspense>} />
                  <Route path="categories" element={<Suspense fallback={<PageLoader />}><AdminCategories /></Suspense>} />
                  <Route path="orders" element={<Suspense fallback={<PageLoader />}><AdminOrders /></Suspense>} />
                  <Route path="policies" element={<Suspense fallback={<PageLoader />}><AdminPolicies /></Suspense>} />
                  <Route path="size-guide" element={<Suspense fallback={<PageLoader />}><AdminSizeGuide /></Suspense>} />
                  <Route path="discounts" element={<Suspense fallback={<PageLoader />}><AdminDiscounts /></Suspense>} />
                </Route>

                {/* All other pages — with header + footer */}
                <Route
                  path="*"
                  element={
                    <>
                      <Header />
                      <main className="flex-1">
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            <Route path="/"            element={<Home />} />
                            <Route path="/shop"        element={<Shop />} />
                            <Route path="/product/:id" element={<ProductDetail />} />
                            <Route path="/cart"        element={<Cart />} />
                            <Route path="/about"       element={<About />} />
                            <Route path="/faq"         element={<FAQ />} />
                            <Route path="/shipping"    element={<Shipping />} />
                            <Route path="/size-guide"  element={<SizeGuide />} />
                            <Route path="/track"       element={<TrackOrder />} />

                            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                            <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />

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
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
