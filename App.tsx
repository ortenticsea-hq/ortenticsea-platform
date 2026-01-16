
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Header from './components/Header.tsx';
import BottomNav from './components/BottomNav.tsx';
import Footer from './components/Footer.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import Home from './views/Home.tsx';
import CategoriesView from './views/CategoriesView.tsx';
import ProductDetailView from './views/ProductDetailView.tsx';
import SellerProfileView from './views/SellerProfileView.tsx';
import CartView from './views/CartView.tsx';
import ChatView from './views/ChatView.tsx';
import ProfileView from './views/ProfileView.tsx';
import LoginView from './views/LoginView.tsx';
import PlaceholderView from './views/PlaceholderView.tsx';
import SellerOnboardingView from './views/SellerOnboardingView.tsx';
import SellerDashboardView from './views/SellerDashboardView.tsx';
import AdminDashboardView from './views/AdminDashboardView.tsx';
import SellerToolsView from './views/SellerToolsView.tsx';
import { Product, ViewType, User, CartItem, Review, Seller, SellerApplication, UserRole, SellerStatus, SharedCartComment } from './types.ts';
import { REVIEWS, PRODUCTS, SELLERS } from './constants.tsx';
import { AudioService } from './services/audioService.ts';
import { FirebaseAuthService } from './services/firebaseAuthService.ts';

const REVIEWS_STORAGE_KEY = 'ortenticsea_reviews_v1';
const APPS_STORAGE_KEY = 'ortenticsea_applications_v1';
const SHARED_COMMENTS_KEY = 'ortenticsea_shared_comments_v1';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  // Shared Cart State
  const [sharedCartItems, setSharedCartItems] = useState<CartItem[]>([]);
  const [sharedCartId, setSharedCartId] = useState<string | null>(null);
  const [sharedCartComments, setSharedCartComments] = useState<Record<string, SharedCartComment[]>>(() => {
    const saved = localStorage.getItem(SHARED_COMMENTS_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(SHARED_COMMENTS_KEY, JSON.stringify(sharedCartComments));
  }, [sharedCartComments]);

  // Handle URL parameters for shared cart
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const dataParam = params.get('data');
    const idParam = params.get('id');

    if (viewParam === 'shared-cart' && dataParam && idParam) {
      try {
        const decoded = JSON.parse(atob(dataParam));
        // Hydrate products
        const items: CartItem[] = decoded.map((item: { id: string, qty: number }) => {
          const product = PRODUCTS.find(p => p.id === item.id);
          return product ? { product, quantity: item.qty } : null;
        }).filter(Boolean);

        setSharedCartItems(items);
        setSharedCartId(idParam);
        setActiveView('shared-cart');
      } catch (e) {
        console.error("Failed to decode shared cart", e);
      }
    }
  }, []);

  const [applications, setApplications] = useState<SellerApplication[]>(() => {
    const saved = localStorage.getItem(APPS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [
      {
        id: 'app-1',
        userId: 'u123',
        shopName: 'Wuse Electronics Store',
        description: 'Quality used home appliances',
        email: 'wuse@market.com',
        phone: '08012345678',
        status: 'approved', // Default set to approved for demo purposes
        submittedAt: new Date().toISOString(),
        idDocument: 'mock_url',
        sourcingProof: 'mock_url'
      }
    ];
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(applications));
  }, [applications]);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = FirebaseAuthService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : REVIEWS;
    } catch (e) {
      return REVIEWS;
    }
  });

  useEffect(() => {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews]);

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

  const handleAddSharedComment = (commentText: string) => {
    if (!sharedCartId) return;
    const newComment: SharedCartComment = {
      id: Date.now().toString(),
      userName: currentUser?.name || 'Friend from Abuja',
      text: commentText,
      timestamp: new Date().toISOString()
    };
    setSharedCartComments(prev => ({
      ...prev,
      [sharedCartId]: [...(prev[sharedCartId] || []), newComment]
    }));
  };

  const handleSellerApplication = useCallback((appData: any) => {
    if (!currentUser) return;
    const newApp: SellerApplication = {
      ...appData,
      userId: currentUser.id,
      shopName: appData.shopName || currentUser.name,
      email: appData.email || currentUser.email
    };
    setApplications(prev => [...prev, newApp]);
    setCurrentUser(prev => prev ? { ...prev, sellerStatus: 'pending' } : null);
    setActiveView('seller-dashboard');
  }, [currentUser]);

  const handleApproveApp = useCallback((appId: string) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'approved' } : a));
    const app = applications.find(a => a.id === appId);
    if (app && currentUser && app.userId === currentUser.id) {
       setCurrentUser(prev => prev ? { ...prev, role: 'seller', sellerStatus: 'approved' } : null);
    }
  }, [applications, currentUser]);

  const handleRejectApp = useCallback((appId: string, reason: string) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'rejected', rejectionReason: reason } : a));
    const app = applications.find(a => a.id === appId);
    if (app && currentUser && app.userId === currentUser.id) {
       setCurrentUser(prev => prev ? { ...prev, sellerStatus: 'rejected', rejectionReason: reason } : null);
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
    } else if (currentUser.role === 'seller' || currentUser.sellerStatus === 'approved' || currentUser.sellerStatus === 'pending' || currentUser.sellerStatus === 'rejected') {
      setActiveView('seller-dashboard');
    } else {
      setActiveView('seller-onboarding');
    }
    window.scrollTo(0, 0);
  }, [currentUser]);

  const handleNavigate = useCallback((v: ViewType) => {
    if (v === 'sell') {
      handleSellClick();
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
    const product = PRODUCTS.find(p => p.id === productId);
    if (product) {
      handleProductClick(product);
    }
  }, [handleProductClick]);

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <Home setView={handleNavigate} onSearch={handleSearch} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />;
      case 'categories':
        return <CategoriesView initialSearchQuery={searchQuery} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />;
      case 'product-detail':
        return selectedProduct ? (
          <ProductDetailView 
            product={selectedProduct} 
            reviews={reviews}
            currentUser={currentUser}
            onBack={() => handleNavigate('home')} 
            onAddToCart={handleAddToCart}
            onAddReview={(rating, comment) => {
              if (!currentUser) return;
              const r: Review = { id: Date.now().toString(), userId: currentUser.id, userName: currentUser.name, targetId: selectedProduct.id, targetType: 'product', rating, comment, date: new Date().toISOString().split('T')[0] };
              setReviews(prev => [...prev, r]);
            }}
            onLoginPrompt={() => setShowLoginModal(true)}
            onSellerClick={handleSellerClick}
          />
        ) : <Home setView={handleNavigate} onSearch={handleSearch} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />;
      case 'cart':
        return (
          <CartView 
            items={cartItems} 
            onRemove={(id) => setCartItems(prev => prev.filter(i => i.product.id !== id))} 
            onUpdateQty={(id, delta) => setCartItems(prev => prev.map(i => i.product.id === id ? {...i, quantity: Math.max(1, i.quantity + delta)} : i))} 
            onCheckout={() => alert('Checkout flow starting...')} 
            setView={handleNavigate} 
          />
        );
      case 'shared-cart':
        return (
          <CartView 
            items={sharedCartItems} 
            isShared 
            sharedId={sharedCartId || ''}
            comments={sharedCartId ? sharedCartComments[sharedCartId] || [] : []}
            onAddComment={handleAddSharedComment}
            onRemove={() => {}} 
            onUpdateQty={() => {}} 
            onCheckout={() => {}} 
            setView={handleNavigate} 
          />
        );
      case 'chat': 
        return <ChatView onProductNavigate={handleProductNavigateFromChat} onAddToCart={(p) => handleAddToCart(p)} />;
      case 'profile': return <ProfileView user={currentUser} onLogout={() => { setCurrentUser(null); handleNavigate('home'); }} onLoginClick={() => setShowLoginModal(true)} setView={handleNavigate} />;
      
      case 'seller-onboarding':
        return <SellerOnboardingView 
          onSubmit={handleSellerApplication} 
          onCancel={() => handleNavigate('home')} 
        />;
      case 'seller-dashboard':
        return currentUser ? (
          <SellerDashboardView 
            user={currentUser} 
            products={PRODUCTS} 
            onCreateProduct={() => alert('Product listing module coming soon!')}
            onRefreshStatus={() => {
              const userApp = applications.find(a => a.userId === currentUser.id);
              if (userApp) {
                setCurrentUser(prev => prev ? { 
                  ...prev, 
                  sellerStatus: userApp.status, 
                  role: userApp.status === 'approved' ? 'seller' : prev.role,
                  rejectionReason: userApp.rejectionReason 
                } : null);
              }
            }}
            onOpenTools={() => setActiveView('seller-tools')}
          />
        ) : <Home setView={handleNavigate} onSearch={handleSearch} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />;
      case 'seller-tools':
        return <SellerToolsView onBack={() => setActiveView('seller-dashboard')} />;
      case 'admin-dashboard':
        return <AdminDashboardView 
          applications={applications} 
          onApprove={handleApproveApp} 
          onReject={handleRejectApp} 
        />;
      case 'seller-profile':
        return selectedSeller ? (
          <SellerProfileView 
            seller={selectedSeller} 
            products={PRODUCTS} 
            reviews={reviews}
            currentUser={currentUser}
            onBack={() => handleNavigate('home')} 
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
            onAddReview={(rating, comment) => {
              if (!currentUser) return;
              const r: Review = { id: Date.now().toString(), userId: currentUser.id, userName: currentUser.name, targetId: selectedSeller.id, targetType: 'seller', rating, comment, date: new Date().toISOString().split('T')[0] };
              setReviews(prev => [...prev, r]);
            }}
            onLoginPrompt={() => setShowLoginModal(true)}
            setView={handleNavigate}
          />
        ) : <Home setView={handleNavigate} onSearch={handleSearch} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />;
      default:
        return <Home setView={handleNavigate} onSearch={handleSearch} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />;
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

      <Footer onBecomeSeller={handleSellClick} />
      <ScrollToTop />

      <BottomNav 
        activeView={activeView} 
        setView={handleNavigate} 
        onProfileClick={() => {
          if (!currentUser) setShowLoginModal(true);
          else handleNavigate('profile');
        }}
      />

      {showLoginModal && (
        <LoginView 
          onClose={() => { setShowLoginModal(false); setPendingAction(null); }} 
          onSuccess={(user) => {
            let role: UserRole = 'buyer';
            // Access logic: Only francisetham01@gmail.com is granted administrative privileges
            if (user.email === 'francisetham01@gmail.com') role = 'admin';
            
            const existingApp = applications.find(a => a.email === user.email);
            // Crucial: Determine role based on application status
            let sellerStatus: SellerStatus = 'none';
            if (existingApp) {
              sellerStatus = existingApp.status;
              if (sellerStatus === 'approved') role = 'seller';
            }
            
            setCurrentUser({ ...user, role, sellerStatus, rejectionReason: existingApp?.rejectionReason });
            setShowLoginModal(false);
            if (pendingAction) { pendingAction(); setPendingAction(null); }
          }}
        />
      )}
    </div>
  );
};

export default App;
