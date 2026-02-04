
import React, { useState, useEffect } from 'react';
import { AppView, GeneratedCreation, Address, UserProfile, UserLevel } from './types';
import Navbar from './components/Navbar';
import Home from './views/Home';
import Square from './views/Square';
import Orders from './views/Orders';
import Profile from './views/Profile';
import Checkout from './views/Checkout';
import AddressList from './views/AddressList';
import CustomerService from './views/CustomerService';
import SettingsView from './views/Settings';
import Register from './views/Register';
import AboutUs from './views/AboutUs';
import { supabase, logAction } from './lib/supabase';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [myCreations, setMyCreations] = useState<GeneratedCreation[]>([]);
  const [pendingOrder, setPendingOrder] = useState<GeneratedCreation | null>(null);
  const [orderCount, setOrderCount] = useState(0);

  const generateShortId = (id: string) => {
    if (!id) return '00000000';
    return id.substring(0, 8).toUpperCase();
  };

  const getDefaultProfile = (id: string | null): UserProfile => ({
    id: id || '',
    shortId: generateShortId(id || ''),
    nickname: id ? '加载中...' : '未登录',
    avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${id || 'guest'}`,
    email: '',
    bio: id ? '正在获取用户信息...' : '登录后查看您的作品',
    isRegistered: !!id,
    level: 'visitor',
    orderCount: 0
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(getDefaultProfile(null));
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const initAuth = async () => {
      // 增加超时强制跳过，防止移动端环境网络波动导致的假死
      const forceEndLoading = setTimeout(() => setIsLoadingProfile(false), 3000);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await handleAuthChange(session);
      } catch (e) {
        console.error("Auth initialization failed", e);
      } finally {
        clearTimeout(forceEndLoading);
        setIsLoadingProfile(false);
      }
    };

    initAuth();

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
          bio: profileData.bio || '欢迎回来',
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
  };

  const handleRegisterSuccess = () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });
    if (pendingOrder) {
      setCurrentView(AppView.RESULT);
    } else {
      setCurrentView(AppView.PROFILE);
    }
  };

  const handleLogout = async () => {
    if (userId) await logAction(userId, 'LOGOUT');
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
      <div className="w-full h-[100dvh] bg-[#F8F9FB] flex flex-col items-center justify-center overflow-hidden">
        <div className="loader-dot mb-8"></div>
        <p className="text-slate-400 font-bold text-[10px] tracking-[0.4em] uppercase">正在同步账户信息...</p>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.REGISTER: return <Register onRegisterSuccess={handleRegisterSuccess} onBack={() => setCurrentView(AppView.PROFILE)} />;
      case AppView.HOME:
      case AppView.GENERATING:
      case AppView.RESULT:
        return <Home currentView={currentView} setView={setCurrentView} onCreationSuccess={handleCreationSuccess} setPendingOrder={setPendingOrder} userId={userId} />;
      case AppView.SQUARE:
        return <Square />;
      case AppView.CHECKOUT:
        if (!userId) {
          return <Register onRegisterSuccess={handleRegisterSuccess} onBack={() => setCurrentView(AppView.RESULT)} />;
        }
        return pendingOrder ? (
          <Checkout 
            userId={userId} 
            creation={pendingOrder} 
            addresses={addresses} 
            onPaymentComplete={handlePaymentComplete} 
            onBack={() => setCurrentView(AppView.RESULT)} 
          />
        ) : (
          <Home currentView={AppView.HOME} setView={setCurrentView} onCreationSuccess={handleCreationSuccess} setPendingOrder={setPendingOrder} userId={userId} />
        );
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
      case AppView.ABOUT_US:
        return <AboutUs onBack={() => setCurrentView(AppView.PROFILE)} />;
      default: return <Home currentView={currentView} setView={setCurrentView} onCreationSuccess={handleCreationSuccess} setPendingOrder={setPendingOrder} userId={userId} />;
    }
  };

  const showNavbar = ![
    AppView.GENERATING, 
    AppView.CHECKOUT, 
    AppView.ADDRESS_LIST, 
    AppView.CUSTOMER_SERVICE,
    AppView.SETTINGS,
    AppView.REGISTER,
    AppView.ABOUT_US
  ].includes(currentView);

  return (
    <div className="min-h-[100dvh] bg-transparent relative flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col min-h-[100dvh] relative overflow-x-hidden">
        {![AppView.CHECKOUT, AppView.ADDRESS_LIST, AppView.CUSTOMER_SERVICE, AppView.SETTINGS, AppView.REGISTER, AppView.ABOUT_US].includes(currentView) && (
          <header className="h-20 px-6 md:px-12 flex items-center justify-between sticky top-0 z-40 bg-white/40 backdrop-blur-md shrink-0 border-b border-gray-100/50">
            <div className="flex items-center space-x-2.5">
               <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]"></div>
               <span className="text-xl font-black tracking-tighter italic bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent uppercase">SELINDELL</span>
            </div>
            <button 
              onClick={() => setCurrentView(userId ? AppView.PROFILE : AppView.REGISTER)}
              className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden relative active:scale-95 transition-all shadow-sm"
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
