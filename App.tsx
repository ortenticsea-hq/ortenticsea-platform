
import React, { Suspense, lazy, useState, useMemo, useCallback, useEffect } from 'react';
import Header from './components/Header.tsx';
import BottomNav from './components/BottomNav.tsx';
import Footer from './components/Footer.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import Home from './views/Home.tsx';
import CategoriesView from './views/CategoriesView.tsx';
import ProductDetailView from './views/ProductDetailView.tsx';
import SellerProfileView from './views/SellerProfileView.tsx';
import CartView from './views/CartView.tsx';
import SharedCartView from './views/SharedCartView.tsx';
import ProfileView from './views/ProfileView.tsx';
import LoginView from './views/LoginView.tsx';
import PlaceholderView from './views/PlaceholderView.tsx';
import VerifyEmailView from './views/VerifyEmailView.tsx';
import SellerOnboardingView from './views/SellerOnboardingView.tsx';
import SellerDashboardView from './views/SellerDashboardView.tsx';
import AdminDashboardView from './views/AdminDashboardView.tsx';
import SellerToolsView from './views/SellerToolsView.tsx';
import InfoView from './views/InfoView.tsx';
import PaymentReturnView from './views/PaymentReturnView.tsx';
import OrdersView from './views/OrdersView.tsx';
import { Product, ViewType, CartItem, Review, Seller, UserRole, SellerStatus, Order, OrderItem } from './types.ts';
import { REVIEWS, PRODUCTS, SELLERS } from './constants.tsx';
import { AudioService } from './services/audioService.ts';
import { FirestoreService } from './services/firestoreService.ts';
import { initializeFirestore } from './services/firestoreInit.ts';
import { useProducts, useProductsBySeller, useApplications, useShopByOwner, useShops, useSellers } from './hooks/useFirestore.ts';
import { useAuth } from './AuthContext.tsx';
import { initPaystackTransaction } from './services/paystackService.ts';

const ChatView = lazy(() => import('./views/ChatView.tsx'));

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType | string>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  // Shared Cart State - now handled by SharedCartView
  const [sharedCartId, setSharedCartId] = useState<string | null>(null);

  const { user: currentUser, setUser, signOut, refreshUser } = useAuth();
  
  // Use Firestore hooks for real-time data
  const productStatusFilter = currentUser?.role === 'admin' ? undefined : 'approved';
  const { products: firestoreProducts, loading: productsLoading } = useProducts(productStatusFilter);
  const { products: sellerProducts } = useProductsBySeller(currentUser?.id || null);
  const { applications: firestoreApplications, loading: applicationsLoading } = useApplications(currentUser);
  const { shop: currentShop } = useShopByOwner(currentUser?.id || null);
  const { shops: allShops } = useShops(currentUser?.role === 'admin');
  const { sellers: firestoreSellers } = useSellers();
  
  // Use Firestore data if available, fallback to constants for backward compatibility
  const products = firestoreProducts.length > 0 ? firestoreProducts : PRODUCTS;
  const sellers = firestoreSellers.length > 0 ? firestoreSellers : SELLERS;
  const applications = firestoreApplications.length > 0 ? firestoreApplications : [];
  
  // Reviews state - will be migrated to Firestore
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);

  // Handle URL parameters for shared cart and payment returns
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const idParam = params.get('id');
    const paymentParam = (params.get('payment') || params.get('status') || '').toLowerCase();
    if (viewParam === 'shared-cart' && idParam) {
      setSharedCartId(idParam);
      setActiveView('shared-cart');
      return;
    }

    if (viewParam === 'payment-success') {
      setActiveView('payment-success');
      return;
    }

    if (viewParam === 'payment-cancel') {
      setActiveView('payment-cancel');
      return;
    }

    if (['success', 'successful', 'paid'].includes(paymentParam)) {
      setActiveView('payment-success');
      return;
    }

    if (['cancel', 'cancelled', 'canceled', 'abandoned', 'failed'].includes(paymentParam)) {
      setActiveView('payment-cancel');
    }
  }, []);

  // Initialize Firestore on app startup
  useEffect(() => {
    const shouldAutoSeedFirestore =
      currentUser?.role === 'admin' &&
      typeof window !== 'undefined' &&
      window.localStorage.getItem('seedFirestore') === 'true';

    if (!shouldAutoSeedFirestore) return;
    initializeFirestore().catch(console.error);
  }, [currentUser?.role]);

  const cartCount = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setActiveView('product-detail');
    window.scrollTo(0, 0);
  }, []);

  const handleSellerClick = useCallback((seller: Seller) => {
    setSelectedSeller(seller);
    setActiveView('seller-profile');
    window.scrollTo(0, 0);
  }, []);

  const handleAddToCart = useCallback((product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Provide acoustic feedback for the "Add to Cart" action
    AudioService.playAddToCart();

    if (!currentUser) {
      setPendingAction(() => () => {
        setCartItems(prev => {
          const existing = prev.find(item => item.product.id === product.id);
          if (existing) return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
          return [...prev, { product, quantity: 1 }];
        });
      });
      setShowLoginModal(true);
    } else {
      setCartItems(prev => {
        const existing = prev.find(item => item.product.id === product.id);
        if (existing) return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        return [...prev, { product, quantity: 1 }];
      });
    }
  }, [currentUser]);


  const handleApproveApp = useCallback(async (appId: string) => {
    try {
      await FirestoreService.updateApplication(appId, { status: 'approved' });
      const app = applications.find(a => a.id === appId);
      if (app && currentUser && app.userId === currentUser.id) {
        await FirestoreService.updateUser(currentUser.id, { role: 'seller', sellerStatus: 'approved' });
        setUser(prev => prev ? { ...prev, role: 'seller', sellerStatus: 'approved' } : null);
        await refreshUser();
      }
    } catch (error) {
      console.error('Error approving application:', error);
    }
  }, [applications, currentUser]);

  const handleRejectApp = useCallback(async (appId: string, reason: string) => {
    try {
      await FirestoreService.updateApplication(appId, { status: 'rejected', rejectionReason: reason });
      const app = applications.find(a => a.id === appId);
      if (app && currentUser && app.userId === currentUser.id) {
        await FirestoreService.updateUser(currentUser.id, { sellerStatus: 'rejected', rejectionReason: reason });
        setUser(prev => prev ? { ...prev, sellerStatus: 'rejected', rejectionReason: reason } : null);
        await refreshUser();
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  }, [applications, currentUser]);

  const handleSellClick = useCallback(() => {
    if (!currentUser) {
      setPendingAction(() => handleSellClick);
      setShowLoginModal(true);
      return;
    }

    if (currentUser.role === 'admin') {
      setActiveView('admin-dashboard');
    } else if (currentShop) {
      if (currentShop.status === 'REJECTED') {
        setActiveView('seller-onboarding');
      } else {
        setActiveView('seller-dashboard');
      }
    } else {
      setActiveView('seller-onboarding');
    }
    window.scrollTo(0, 0);
  }, [currentUser]);

  const requireAuth = useCallback(() => {
    if (!currentUser) {
      setShowLoginModal(true);
      return false;
    }
    if (!currentUser.emailVerified) {
      return false;
    }
    return true;
  }, [currentUser]);

  const requireAdmin = useCallback(() => {
    if (!requireAuth()) return false;
    if (currentUser?.role !== 'admin') {
      setActiveView('home');
      return false;
    }
    return true;
  }, [currentUser, requireAuth]);

  const handleNavigate = useCallback((v: ViewType | string) => {
    if (v === 'sell') {
      handleSellClick();
    } else if (v === 'admin-dashboard') {
      if (!requireAdmin()) return;
      setActiveView(v);
      window.scrollTo(0, 0);
    } else if (v === 'seller-dashboard' || v === 'seller-tools' || v === 'seller-onboarding' || v === 'orders') {
      if (!requireAuth()) return;
      setActiveView(v);
      window.scrollTo(0, 0);
    } else {
      setActiveView(v);
      if (v !== 'categories') setSearchQuery('');
      // Clean up URL if navigating away from shared cart
      if (v !== 'shared-cart' && window.location.search) {
        window.history.replaceState({}, '', window.location.pathname);
      }
      window.scrollTo(0, 0);
    }
  }, [handleSellClick]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setActiveView('categories');
    window.scrollTo(0, 0);
  }, []);

  const handleProductNavigateFromChat = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      handleProductClick(product);
    }
  }, [handleProductClick, products]);

  const handleCheckout = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!currentUser) {
      setPendingAction(() => handleCheckout);
      setShowLoginModal(true);
      return;
    }
    if (cartItems.length === 0) return;

    const now = new Date().toISOString();
    const orderId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${currentUser.id}_${Date.now()}`;

    const items: OrderItem[] = cartItems.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images?.[0],
      sellerId: item.product.sellerId,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order: Order = {
      id: orderId,
      buyerId: currentUser.id,
      buyerEmail: currentUser.email,
      items,
      totalAmount,
      currency: 'NGN',
      status: 'pending',
      payment: {
        provider: 'paystack',
        status: 'pending',
        metadata: {
          orderId,
          cartItemCount: items.length,
          createdFrom: 'web',
        },
      },
      createdAt: now,
    };

    FirestoreService.createOrder(order)
      .then(async () => {
        const callbackUrl = `${window.location.origin}/?view=payment-success&orderId=${encodeURIComponent(orderId)}`;
        const { authorizationUrl } = await initPaystackTransaction({
          orderId,
          amount: totalAmount,
          email: currentUser.email,
          callbackUrl,
        });
        window.localStorage.setItem('lastOrderId', orderId);
        window.location.assign(authorizationUrl);
      })
      .catch((error) => {
        console.error('Failed to create order:', error);
        alert('Unable to start checkout right now. Please try again.');
      });
  }, [cartItems, currentUser, setPendingAction, setShowLoginModal]);

  const renderView = () => {
    if (typeof activeView === 'string' && activeView.startsWith('page-')) {
      return <InfoView pageId={activeView.replace('page-', '')} setView={handleNavigate} />;
    }

    switch (activeView) {
      case 'home':
        return <Home products={products} sellers={sellers} setView={handleNavigate} onSearch={handleSearch} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />;
      case 'categories':
        return <CategoriesView products={products} sellers={sellers} initialSearchQuery={searchQuery} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />;
      case 'product-detail':
        return selectedProduct ? (
          <ProductDetailView 
            product={selectedProduct} 
            sellers={sellers}
            reviews={reviews}
            currentUser={currentUser}
            onBack={() => handleNavigate('home')} 
            onAddToCart={handleAddToCart}
            onAddReview={async (rating, comment) => {
              if (!currentUser) return;
              const r: Review = { id: Date.now().toString(), userId: currentUser.id, userName: currentUser.name, targetId: selectedProduct.id, targetType: 'product', rating, comment, date: new Date().toISOString().split('T')[0] };
              try {
                await FirestoreService.createReview(r);
                setReviews(prev => [...prev, r]);
              } catch (error) {
                console.error('Error adding review:', error);
              }
            }}
            onLoginPrompt={() => setShowLoginModal(true)}
            onSellerClick={handleSellerClick}
          />
        ) : <Home products={products} sellers={sellers} setView={handleNavigate} onSearch={handleSearch} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />;
      case 'cart':
        return (
          <CartView 
            items={cartItems} 
            onRemove={(id) => setCartItems(prev => prev.filter(i => i.product.id !== id))} 
            onUpdateQty={(id, delta) => setCartItems(prev => prev.map(i => i.product.id === id ? {...i, quantity: Math.max(1, i.quantity + delta)} : i))} 
            onCheckout={handleCheckout}
            setView={handleNavigate}
            currentUser={currentUser}
            onLoginRequired={() => setShowLoginModal(true)}
          />
        );
      case 'shared-cart':
        return <SharedCartView shareId={sharedCartId} setView={handleNavigate} />;
      case 'payment-success':
        return <PaymentReturnView status="success" setView={handleNavigate} />;
      case 'payment-cancel':
        return <PaymentReturnView status="cancel" setView={handleNavigate} />;
      case 'orders':
        return currentUser ? (
          <OrdersView currentUser={currentUser} isAdmin={currentUser.role === 'admin'} />
        ) : (
          <Home products={products} sellers={sellers} setView={handleNavigate} onSearch={handleSearch} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />
        );
      case 'chat': 
        return (
          <Suspense
            fallback={
              <div className="container mx-auto px-4 py-16 text-center text-sm text-gray-500">
                Loading assistant...
              </div>
            }
          >
            <ChatView onProductNavigate={handleProductNavigateFromChat} onAddToCart={(p) => handleAddToCart(p)} />
          </Suspense>
        );
      case 'profile': return <ProfileView user={currentUser} onLogout={async () => { await signOut(); setUser(null); handleNavigate('home'); }} onLoginClick={() => setShowLoginModal(true)} setView={handleNavigate} />;
      
      case 'seller-onboarding':
        return currentUser ? (
          <SellerOnboardingView 
            user={currentUser}
            shop={currentShop}
            onCancel={() => handleNavigate('home')} 
          />
        ) : (
          <Home products={products} sellers={sellers} setView={handleNavigate} onSearch={handleSearch} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />
        );
      case 'seller-dashboard':
        return currentUser && currentUser.emailVerified ? (
          <SellerDashboardView
            user={currentUser}
            products={sellerProducts}
            applicationStatus={applications.find(a => a.userId === currentUser.id)?.status}
            applicationRejectionReason={applications.find(a => a.userId === currentUser.id)?.rejectionReason}
            shopStatus={currentShop?.status}
            shopRejectionReason={currentShop?.rejectionReason}
            onCreateProduct={async (data) => {
              if (!currentUser) return;
              const newProduct: Product = {
                id: Date.now().toString(),
                name: data.name,
                price: data.price,
                condition: data.condition,
                images: data.images,
                sellerId: currentUser.id,
                shopId: currentUser.id,
                category: data.category,
                description: data.description,
                status: 'pending',
                availableQuantity: 1,
                submittedAt: new Date().toISOString(),
              };
              await FirestoreService.createProduct(newProduct);
            }}
            onRefreshStatus={async () => {
              await refreshUser();
            }}
            onOpenTools={() => {
              if (currentShop?.status === 'APPROVED') {
                setActiveView('seller-tools');
              }
            }}
            onReapply={() => setActiveView('seller-onboarding')}
          />
        ) : <Home products={products} sellers={sellers} setView={handleNavigate} onSearch={handleSearch} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />;
      case 'seller-tools':
        return currentUser && currentUser.emailVerified ? (
          <SellerToolsView onBack={() => setActiveView('seller-dashboard')} />
        ) : <Home products={products} sellers={sellers} setView={handleNavigate} onSearch={handleSearch} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />;
      case 'admin-dashboard':
        return currentUser?.role === 'admin' && currentUser.emailVerified ? (
          <AdminDashboardView 
            products={products}
            shops={allShops}
            onApproveProduct={async (productId) => {
              await FirestoreService.updateProduct(productId, { status: 'approved', rejectionReason: '' });
            }}
            onRejectProduct={async (productId, reason) => {
              await FirestoreService.updateProduct(productId, { status: 'rejected', rejectionReason: reason });
            }}
            onApproveShop={async (shopId) => {
              await FirestoreService.updateShop(shopId, { status: 'APPROVED', rejectionReason: '' });
              const approvedShop = allShops.find((shop) => shop.id === shopId);
              if (approvedShop) {
                await FirestoreService.updateUser(approvedShop.ownerId, {
                  role: 'seller',
                  sellerStatus: 'approved',
                  rejectionReason: '',
                });
                await FirestoreService.createSeller({
                  id: approvedShop.ownerId,
                  name: approvedShop.shopName,
                  isVerified: true,
                  rating: 0,
                  reviewCount: 0,
                  joinDate: new Date().toISOString().split('T')[0],
                  description: approvedShop.description || '',
                });
              }
            }}
            onRejectShop={async (shopId, reason) => {
              await FirestoreService.updateShop(shopId, { status: 'REJECTED', rejectionReason: reason });
              const rejectedShop = allShops.find((shop) => shop.id === shopId);
              if (rejectedShop) {
                await FirestoreService.updateUser(rejectedShop.ownerId, {
                  sellerStatus: 'rejected',
                  rejectionReason: reason,
                });
              }
            }}
            onSetShopUnderReview={async (shopId) => {
              await FirestoreService.updateShop(shopId, { status: 'UNDER_REVIEW', rejectionReason: '' });
            }}
          />
        ) : <Home products={products} sellers={sellers} setView={handleNavigate} onSearch={handleSearch} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />;
      case 'seller-profile':
        return selectedSeller ? (
          <SellerProfileView
            seller={selectedSeller}
            products={products}
            reviews={reviews}
            currentUser={currentUser}
            onBack={() => handleNavigate('home')} 
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
            onAddReview={async (rating, comment) => {
              if (!currentUser) return;
              const r: Review = { id: Date.now().toString(), userId: currentUser.id, userName: currentUser.name, targetId: selectedSeller.id, targetType: 'seller', rating, comment, date: new Date().toISOString().split('T')[0] };
              try {
                await FirestoreService.createReview(r);
                setReviews(prev => [...prev, r]);
              } catch (error) {
                console.error('Error adding review:', error);
              }
            }}
            onLoginPrompt={() => setShowLoginModal(true)}
            setView={handleNavigate}
          />
        ) : <Home products={products} sellers={sellers} setView={handleNavigate} onSearch={handleSearch} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />;
      default:
        return <Home products={products} sellers={sellers} setView={handleNavigate} onSearch={handleSearch} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Header 
        activeView={activeView} 
        setView={handleNavigate} 
        onSearch={handleSearch}
        cartCount={cartCount} 
        currentUser={currentUser}
        onProfileClick={() => {
          if (!currentUser) setShowLoginModal(true);
          else handleNavigate('profile');
        }}
      />
      
      <main className="flex-grow pb-16 md:pb-0 pt-4 md:pt-6 relative z-10">
        {renderView()}
      </main>

      <Footer onBecomeSeller={handleSellClick} setView={handleNavigate} />
      <ScrollToTop />

      <BottomNav 
        activeView={activeView} 
        setView={handleNavigate} 
        onProfileClick={() => {
          if (!currentUser) setShowLoginModal(true);
          else handleNavigate('profile');
        }}
      />

      {showVerifyBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[150] bg-green-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
          Email verified successfully. Welcome aboard!
        </div>
      )}

      {currentUser && !currentUser.emailVerified && (
        <VerifyEmailView 
          user={currentUser} 
          onLogout={async () => { await signOut(); setUser(null); handleNavigate('home'); }} 
          onRefresh={async () => {
            const refreshed = await refreshUser();
            if (refreshed?.emailVerified) {
              setShowVerifyBanner(true);
              window.setTimeout(() => setShowVerifyBanner(false), 3000);
            }
            return refreshed;
          }}
        />
      )}

      {showLoginModal && (
        <LoginView 
          onClose={() => { setShowLoginModal(false); setPendingAction(null); }} 
          onSuccess={(user) => {
            let role: UserRole = user.role || 'buyer';

            const existingApp = applications.find(a => a.email === user.email);
            // Crucial: Determine role based on application status
            let sellerStatus: SellerStatus = 'none';
            if (existingApp) {
              sellerStatus = existingApp.status;
              if (sellerStatus === 'approved' && role !== 'admin') role = 'seller';
            }
            
            setUser({ ...user, role, sellerStatus, rejectionReason: existingApp?.rejectionReason });
            setShowLoginModal(false);
            if (pendingAction) { pendingAction(); setPendingAction(null); }
          }}
        />
      )}
    </div>
  );
};

export default App;
