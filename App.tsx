
import React, { useState, useEffect } from 'react';
import { AppView, GeneratedCreation, Address, UserProfile } from './types.ts';
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

const FIXED_USER_ID = '82930415-0000-0000-0000-000000000000';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [dbStatus, setDbStatus] = useState<'online' | 'offline'>('offline');
  const [myCreations, setMyCreations] = useState<GeneratedCreation[]>([]);
  const [pendingOrder, setPendingOrder] = useState<GeneratedCreation | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: FIXED_USER_ID,
    nickname: '访客造物主',
    avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=guest',
    email: '',
    bio: '即刻注册，同步你的造物灵感',
    isRegistered: false
  });

  const [addresses, setAddresses] = useState<Address[]>([]);

  const initApp = async () => {
    setIsLoadingProfile(true);
    try {
      const { data: profileData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', FIXED_USER_ID)
        .single();

      if (!error) setDbStatus('online');

      if (profileData) {
        setUserProfile({
          id: FIXED_USER_ID,
          nickname: profileData.nickname,
          bio: profileData.bio || '追求极致的造物美学',
          avatar: profileData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.nickname}`,
          email: 'creator@selindell.ai',
          isRegistered: true
        });
        
        const { data: addrData } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', FIXED_USER_ID);
        
        if (addrData) setAddresses(addrData);
      }
    } catch (err) {
      setDbStatus('offline');
    } finally {
      setIsLoadingProfile(false);
      setCurrentView(AppView.HOME);
    }
  };

  useEffect(() => { initApp(); }, []);

  const handleRegisterSuccess = (nickname: string) => {
    setUserProfile(prev => ({ 
      ...prev, 
      nickname, 
      isRegistered: true,
      bio: '我是新进造物主',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}` 
    }));
    setCurrentView(AppView.PROFILE);
  };

  const handleLogout = async () => {
    setIsLoadingProfile(true);
    try {
      await Promise.all([
        supabase.from('users').delete().eq('id', FIXED_USER_ID),
        supabase.from('addresses').delete().eq('user_id', FIXED_USER_ID)
      ]);
      
      setUserProfile({
        id: FIXED_USER_ID,
        nickname: '访客造物主',
        avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=guest',
        email: '',
        bio: '即刻注册，同步你的造物灵感',
        isRegistered: false
      });
      setAddresses([]);
      setMyCreations([]);
      setCurrentView(AppView.HOME);
    } catch (err) {
      alert("注销失败。");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleCreationSuccess = (creation: GeneratedCreation) => {
    setMyCreations(prev => [creation, ...prev]);
  };

  const handlePaymentComplete = (creationId: string) => {
    setMyCreations(prev => prev.map(c => 
      c.id === creationId ? { ...c, status: 'paid' as const } : c
    ));
    setPendingOrder(null);
    setCurrentView(AppView.ORDERS);
  };

  const addAddress = async (newAddr: Omit<Address, 'id' | 'isDefault'>) => {
    try {
      const { data, error } = await supabase.from('addresses').insert([{
        user_id: FIXED_USER_ID,
        name: newAddr.name,
        phone: newAddr.phone,
        location: newAddr.location,
        is_default: addresses.length === 0
      }]).select().single();

      if (error) throw error;
      if (data) setAddresses(prev => [...prev, data]);
    } catch (err: any) {
      alert(`保存失败: ${err.message}`);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) throw error;
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert(`删除失败: ${err.message}`);
    }
  };

  const handleProfileUpdate = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
    setCurrentView(AppView.PROFILE);
  };

  if (isLoadingProfile) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-[#0a0514] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
        <p className="text-gray-500 font-bold text-[10px] tracking-[0.3em] uppercase animate-pulse">Initializing Digital Soul</p>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.REGISTER:
        return <Register onRegisterSuccess={handleRegisterSuccess} />;
      case AppView.HOME:
      case AppView.GENERATING:
      case AppView.RESULT:
        return (
          <Home 
            currentView={currentView} 
            setView={setCurrentView} 
            onCreationSuccess={handleCreationSuccess}
            setPendingOrder={setPendingOrder}
          />
        );
      case AppView.CHECKOUT:
        return pendingOrder ? (
          <Checkout 
            creation={pendingOrder} 
            addresses={addresses} 
            onPaymentComplete={handlePaymentComplete}
            onBack={() => setCurrentView(AppView.RESULT)}
          />
        ) : null;
      case AppView.ORDERS:
        return <Orders creations={myCreations} />;
      case AppView.PROFILE:
        return (
          <Profile 
            setView={setCurrentView} 
            userProfile={userProfile} 
            onLogout={handleLogout} 
          />
        );
      case AppView.ADDRESS_LIST:
        return (
          <AddressList 
            addresses={addresses} 
            onAddAddress={addAddress} 
            onDeleteAddress={deleteAddress}
            onBack={() => setCurrentView(AppView.PROFILE)} 
          />
        );
      case AppView.CUSTOMER_SERVICE:
        return <CustomerService onBack={() => setCurrentView(AppView.PROFILE)} />;
      case AppView.SETTINGS:
        return (
          <SettingsView 
            profile={userProfile} 
            onUpdate={handleProfileUpdate} 
            onBack={() => setCurrentView(AppView.PROFILE)} 
          />
        );
      default:
        return <Home currentView={currentView} setView={setCurrentView} onCreationSuccess={handleCreationSuccess} setPendingOrder={setPendingOrder} />;
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
    <div className="max-w-md mx-auto min-h-screen bg-transparent shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col">
      {/* 状态栏 */}
      <div className="h-1 w-full fixed top-0 left-1/2 -translate-x-1/2 max-w-md z-[100] flex">
        <div className={`h-full flex-1 transition-colors duration-1000 ${dbStatus === 'online' ? 'bg-green-500/20' : 'bg-red-500/20'}`}></div>
      </div>

      {![AppView.CHECKOUT, AppView.ADDRESS_LIST, AppView.CUSTOMER_SERVICE, AppView.SETTINGS, AppView.REGISTER].includes(currentView) && (
        <header className="h-20 px-6 flex items-end pb-4 justify-between sticky top-0 z-40 bg-transparent backdrop-blur-sm shrink-0">
          <div className="flex items-center space-x-2.5">
             <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]"></div>
             <span className="text-xl font-black tracking-tighter italic bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">SELINDELL</span>
          </div>
          <button 
            onClick={() => setCurrentView(AppView.PROFILE)}
            className="w-10 h-10 rounded-full border border-white/10 active:scale-90 transition-all overflow-hidden shadow-lg"
          >
            <img src={userProfile.avatar} className="w-full h-full object-cover" alt="profile" />
          </button>
        </header>
      )}

      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        {renderView()}
      </main>

      {showNavbar && <Navbar currentView={currentView} setView={setCurrentView} />}
    </div>
  );
};

export default App;
