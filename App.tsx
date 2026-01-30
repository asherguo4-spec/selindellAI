
import React, { useState, useEffect } from 'react';
import { AppView, GeneratedCreation, Address, UserProfile, UserLevel } from './types.ts';
import Navbar from './components/Navbar.tsx';
import Home from './views/Home.tsx';
import Orders from './views/Orders.tsx';
import Profile from './views/Profile.tsx';
import Checkout from './views/Checkout.tsx';
import AddressList from './views/AddressList.tsx';
import CustomerService from './views/CustomerService.tsx';
import SettingsView from './views/Settings.tsx';
import Register from './views/Register.tsx';
import { supabase } from './lib/supabase.ts';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [myCreations, setMyCreations] = useState<GeneratedCreation[]>([]);
  const [pendingOrder, setPendingOrder] = useState<GeneratedCreation | null>(null);
  const [orderCount, setOrderCount] = useState(0);

  const generateShortId = (id: string) => {
    if (!id) return 'GUEST-0000';
    return `SLD-${id.substring(0, 4).toUpperCase()}`;
  };

  const getDefaultProfile = (id: string | null): UserProfile => ({
    id: id || '',
    shortId: generateShortId(id || ''),
    nickname: id ? '同步中...' : '访客造物主',
    avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${id || 'guest'}`,
    email: '',
    bio: id ? '正在加载您的造物灵魂...' : '登录后开启私人馆藏',
    isRegistered: !!id,
    level: 'visitor',
    orderCount: 0
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(getDefaultProfile(null));
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthChange = async (session: any) => {
    if (session?.user) {
      const uid = session.user.id;
      setUserId(uid);
      
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid);
      
      const currentOrderCount = count || 0;
      setOrderCount(currentOrderCount);

      const level: UserLevel = currentOrderCount > 0 ? 'elite' : 'creator';

      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      if (profileData) {
        setUserProfile({
          id: uid,
          shortId: generateShortId(uid),
          nickname: profileData.nickname,
          bio: profileData.bio || '追求极致的造物美学',
          avatar: profileData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.nickname}`,
          email: session.user.email || '',
          isRegistered: true,
          level: level,
          orderCount: currentOrderCount
        });
      } else {
        setUserProfile({
          ...getDefaultProfile(uid),
          level: level,
          orderCount: currentOrderCount
        });
      }

      const { data: addrData } = await supabase.from('addresses').select('*').eq('user_id', uid);
      if (addrData) {
        setAddresses(addrData.map(a => ({
          id: a.id,
          userId: a.user_id,
          name: a.name,
          phone: a.phone,
          location: a.location,
          isDefault: a.is_default
        })));
      }

    } else {
      setUserId(null);
      setUserProfile(getDefaultProfile(null));
      setAddresses([]);
      setOrderCount(0);
    }
    setIsLoadingProfile(false);
  };

  const handleRegisterSuccess = (nickname: string) => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });
    setCurrentView(AppView.PROFILE);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView(AppView.PROFILE);
  };

  const handleCreationSuccess = (creation: GeneratedCreation) => {
    setMyCreations(prev => [creation, ...prev]);
  };

  const handlePaymentComplete = (creationId: string) => {
    setMyCreations(prev => prev.map(c => 
      c.id === creationId ? { ...c, status: 'paid' as const } : c
    ));
    setOrderCount(prev => prev + 1);
    setUserProfile(prev => ({ ...prev, orderCount: prev.orderCount + 1, level: 'elite' }));
    setPendingOrder(null);
    setCurrentView(AppView.ORDERS);
  };

  const addAddress = async (newAddr: Omit<Address, 'id' | 'isDefault' | 'userId'>) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase.from('addresses').insert([{
        user_id: userId,
        name: newAddr.name,
        phone: newAddr.phone,
        location: newAddr.location,
        is_default: addresses.length === 0
      }]).select().single();
      if (error) throw error;
      if (data) {
        setAddresses(prev => [...prev, {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          phone: data.phone,
          location: data.location,
          isDefault: data.is_default
        }]);
      }
    } catch (err: any) { alert(`保存失败: ${err.message}`); }
  };

  const deleteAddress = async (id: string) => {
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err: any) { alert(`删除失败: ${err.message}`); }
  };

  const handleProfileUpdate = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    setCurrentView(AppView.PROFILE);
  };

  if (isLoadingProfile) {
    return (
      <div className="w-full h-[100dvh] bg-[#0a0514] flex flex-col items-center justify-center overflow-hidden">
        <div className="loader-dot mb-8"></div>
        <p className="text-gray-500 font-bold text-[10px] tracking-[0.3em] uppercase">Soul Link Synchronizing...</p>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.REGISTER: return <Register onRegisterSuccess={handleRegisterSuccess} onBack={() => setCurrentView(AppView.PROFILE)} />;
      case AppView.HOME:
      case AppView.GENERATING:
      case AppView.RESULT:
        return <Home currentView={currentView} setView={setCurrentView} onCreationSuccess={handleCreationSuccess} setPendingOrder={setPendingOrder} />;
      case AppView.CHECKOUT:
        return pendingOrder && userId ? <Checkout userId={userId} creation={pendingOrder} addresses={addresses} onPaymentComplete={handlePaymentComplete} onBack={() => setCurrentView(AppView.RESULT)} /> : null;
      case AppView.ORDERS:
        return <Orders userId={userId || ''} creations={myCreations} setView={setCurrentView} />;
      case AppView.PROFILE:
        return <Profile setView={setCurrentView} userProfile={userProfile} onLogout={handleLogout} />;
      case AppView.ADDRESS_LIST:
        return <AddressList addresses={addresses} onAddAddress={addAddress} onDeleteAddress={deleteAddress} onBack={() => setCurrentView(AppView.PROFILE)} />;
      case AppView.CUSTOMER_SERVICE:
        return <CustomerService userId={userId || ''} onBack={() => setCurrentView(AppView.PROFILE)} />;
      case AppView.SETTINGS:
        return userId ? <SettingsView userId={userId} profile={userProfile} onUpdate={handleProfileUpdate} onBack={() => setCurrentView(AppView.PROFILE)} /> : null;
      default: return <Home currentView={currentView} setView={setCurrentView} onCreationSuccess={handleCreationSuccess} setPendingOrder={setPendingOrder} />;
    }
  };

  const showNavbar = ![
    AppView.GENERATING, 
    AppView.CHECKOUT, 
    AppView.ADDRESS_LIST, 
    AppView.CUSTOMER_SERVICE,
    AppView.SETTINGS,
    AppView.REGISTER
  ].includes(currentView);

  return (
    <div className="min-h-[100dvh] bg-transparent relative flex flex-col items-center">
      {/* Dynamic wrapper that responds to screen size */}
      <div className="w-full max-w-6xl flex flex-col min-h-[100dvh] relative overflow-x-hidden">
        {![AppView.CHECKOUT, AppView.ADDRESS_LIST, AppView.CUSTOMER_SERVICE, AppView.SETTINGS, AppView.REGISTER].includes(currentView) && (
          <header className="h-16 px-6 md:px-12 flex items-center justify-between sticky top-0 z-40 bg-transparent backdrop-blur-sm shrink-0">
            <div className="flex items-center space-x-2.5">
               <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]"></div>
               <span className="text-xl font-black tracking-tighter italic bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">SELINDELL</span>
            </div>
            <button 
              onClick={() => setCurrentView(userId ? AppView.PROFILE : AppView.REGISTER)}
              className="w-8 h-8 rounded-full border border-white/10 overflow-hidden relative active:scale-95 transition-transform"
            >
              <img src={userProfile.avatar} className="w-full h-full object-cover" alt="profile" />
              {userProfile.level === 'elite' && (
                <div className="absolute inset-0 border-2 border-purple-500 rounded-full"></div>
              )}
            </button>
          </header>
        )}

        <main className="flex-1 overflow-y-auto no-scrollbar relative w-full px-4 md:px-8 lg:px-12 max-w-5xl mx-auto">
          {renderView()}
        </main>

        {showNavbar && <Navbar currentView={currentView} setView={setCurrentView} />}
      </div>
    </div>
  );
};

export default App;
