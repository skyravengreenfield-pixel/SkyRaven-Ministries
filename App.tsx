import { useState } from 'react';
import { Heart, PieChart, User, Home, Plus, ChevronRight, ArrowUpRight, CreditCard, Check, LogOut, FileText, Bell } from 'lucide-react';
import { DocumentsScreen } from './src/screens/DocumentsScreen';

// --- MOCK DATA ---
const INITIAL_PROJECTS: Project[] = [];

const EXPENSES: any[] = [];

const MY_DONATIONS: any[] = [];

const INITIAL_MINISTRY_GOALS: MinistryGoal[] = [];

interface User {
  name: string;
  role: string;
}

interface Project {
  id: number;
  title: string;
  goal: number;
  raised: number;
  category: string;
  image: string;
}

interface MinistryGoal {
  id: number;
  title: string;
  description: string;
  goal: number;
  raised: number;
  icon: string;
  color: string;
}

export default function SkyRavenApp() {
  const [view, setView] = useState('auth'); // auth, home, donate, expenses, profile, admin, documents
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [ministryGoals, setMinistryGoals] = useState<MinistryGoal[]>(INITIAL_MINISTRY_GOALS);
  const [adminPasscode, setAdminPasscode] = useState('SkyRaven');
  const [showPasscodePrompt, setShowPasscodePrompt] = useState(false);
  const [familiesSupported, setFamiliesSupported] = useState(0);
  const [stripeBalance, setStripeBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Fetch Stripe balance on mount and when view changes to home
  useState(() => {
    if (view === 'home' && user) {
      fetchStripeBalance();
    }
  });

  const fetchStripeBalance = async () => {
    setLoadingBalance(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/skyraven-ministries/us-central1';
      const response = await fetch(`${apiUrl}/getBalance`);
      if (response.ok) {
        const data = await response.json();
        setStripeBalance(data.available || 0);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleLogin = () => {
    setUser({ name: "Guest", role: "Supporter" });
    setView('home');
  };

  const handleAdminLogin = () => {
    setShowPasscodePrompt(true);
  };

  const verifyPasscode = (inputPasscode: string) => {
    if (inputPasscode === adminPasscode) {
      setUser({ name: "Admin", role: "Administrator" });
      setView('admin');
      setShowPasscodePrompt(false);
      return true;
    }
    return false;
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: projects.length + 1 };
    setProjects([newProject, ...projects]);
  };

  const deleteProject = (projectId: number) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const updateProject = (projectId: number, updates: Partial<Project>) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };

  const addMinistryGoal = (goal: Omit<MinistryGoal, 'id'>) => {
    const newGoal = { ...goal, id: ministryGoals.length + 1 };
    setMinistryGoals([newGoal, ...ministryGoals]);
  };

  const deleteMinistryGoal = (goalId: number) => {
    setMinistryGoals(ministryGoals.filter(g => g.id !== goalId));
  };

  const updateMinistryGoal = (goalId: number, updates: Partial<MinistryGoal>) => {
    setMinistryGoals(ministryGoals.map(g => g.id === goalId ? { ...g, ...updates } : g));
  };

  const incrementFamiliesSupported = () => {
    setFamiliesSupported(prev => prev + 1);
  };

  const decrementFamiliesSupported = () => {
    setFamiliesSupported(prev => Math.max(0, prev - 1));
  };

  const setFamiliesSupportedCount = (count: number) => {
    setFamiliesSupported(Math.max(0, count));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center font-sans text-slate-100 selection:bg-sky-500 selection:text-white">
      
      {/* MOBILE CONTAINER */}
      <div className="w-full max-w-md bg-slate-950 min-h-screen relative flex flex-col shadow-2xl overflow-hidden">
        
        {/* GLOBAL BACKGROUND ELEMENTS */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[50%] bg-sky-900/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full pointer-events-none"></div>

        {/* CONTENT */}
        <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
          {view === 'auth' && <AuthScreen onLogin={handleLogin} onAdminLogin={handleAdminLogin} />}
          
          {view !== 'auth' && (
            <div className="flex-1 flex flex-col h-full">
              <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
                {view === 'home' && <HomeScreen onChangeView={setView} projects={projects} ministryGoals={ministryGoals} familiesSupported={familiesSupported} />}
                {view === 'donate' && <DonateScreen onBack={() => setView('home')} projects={projects} />}
                {view === 'expenses' && <ExpensesScreen />}
                {view === 'documents' && <DocumentsScreen onBack={() => setView('home')} />}
                {view === 'profile' && <ProfileScreen user={user} onLogout={() => setView('auth')} />}
                {view === 'admin' && <AdminScreen projects={projects} onAddProject={addProject} onDeleteProject={deleteProject} onUpdateProject={updateProject} ministryGoals={ministryGoals} onAddMinistryGoal={addMinistryGoal} onDeleteMinistryGoal={deleteMinistryGoal} onUpdateMinistryGoal={updateMinistryGoal} onBack={() => setView('home')} adminPasscode={adminPasscode} onChangePasscode={setAdminPasscode} familiesSupported={familiesSupported} onIncrementFamilies={incrementFamiliesSupported} onDecrementFamilies={decrementFamiliesSupported} onSetFamiliesCount={setFamiliesSupportedCount} />}
              </main>
              
              <BottomNav current={view} onChange={setView} />
            </div>
          )}

          {/* PASSCODE PROMPT MODAL */}
          {showPasscodePrompt && (
            <PasscodePrompt 
              onVerify={verifyPasscode} 
              onCancel={() => setShowPasscodePrompt(false)} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 1. AUTH SCREEN
// ==========================================
function AuthScreen({ onLogin, onAdminLogin }: { onLogin: () => void; onAdminLogin: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up logic - would connect to Firebase Auth
        if (!name || !email || !password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        // TODO: Implement Firebase signUp from firebaseAuth.ts
        console.log('Sign up:', { name, email, password });
        // Simulate success
        setTimeout(() => {
          onLogin();
          setLoading(false);
        }, 500);
      } else {
        // Login logic
        if (!email || !password) {
          setError('Please enter email and password');
          setLoading(false);
          return;
        }
        // TODO: Implement Firebase signIn from firebaseAuth.ts
        console.log('Login:', { email, password });
        // Simulate success
        setTimeout(() => {
          onLogin();
          setLoading(false);
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 justify-end relative">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-sky-900/20 to-transparent"></div>
      
      <div className="relative z-10 mb-12">
        <div className="w-24 h-24 flex items-center justify-center mb-6 rounded-2xl overflow-hidden">
          <img src="/logo.png" alt="SkyRaven Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-5xl font-black text-white mb-2 tracking-tight">SkyRaven</h1>
        <p className="text-xl text-slate-400 font-light">Transparency in Ministry.</p>
      </div>

      <div className="relative z-10 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-4 bg-slate-900 border border-slate-800 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              disabled={loading}
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-4 bg-slate-900 border border-slate-800 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-4 bg-slate-900 border border-slate-800 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            disabled={loading}
          />
          
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button 
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
          disabled={loading}
          className="w-full mt-4 py-4 bg-slate-900 border border-slate-800 text-white font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>

        <button 
          onClick={onAdminLogin}
          disabled={loading}
          className="w-full mt-4 py-3 bg-sky-600/20 border border-sky-600/40 text-sky-400 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-sky-600/30 transition-colors disabled:opacity-50"
        >
          Admin Dashboard
        </button>
      </div>
      
      <div className="text-center text-xs text-slate-600 font-medium">
        By continuing, you agree to our <span className="underline cursor-pointer">Mission Statement</span>.
      </div>
    </div>
  );
}

// ==========================================
// 2. HOME SCREEN (Dashboard)
// ==========================================
function HomeScreen({ onChangeView, projects, ministryGoals, familiesSupported }: { onChangeView: (view: string) => void; projects: Project[]; ministryGoals: MinistryGoal[]; familiesSupported: number }) {
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 overflow-hidden">
            <img src="/logo.png" alt="SkyRaven" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Ministries Impact</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">October 2023 Overview</p>
          </div>
        </div>
        <button 
          className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors"
          onClick={() => onChangeView('documents')}
          title="View Ministry Documents"
        >
          <FileText size={18} className="text-slate-400" />
        </button>
      </div>

      {/* MAIN STATS CARD */}
      <div className="bg-gradient-to-br from-sky-600 to-indigo-700 p-6 rounded-3xl shadow-2xl shadow-sky-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-6 -translate-y-12">
          <img src="/SkyRaven_Ministries_Logo-removebg-preview.png" alt="SkyRaven" className="w-40 h-40 object-cover mix-blend-overlay" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white">Total Raised</span>
          </div>
          <div className="text-5xl font-black text-white mb-2">
            {loadingBalance ? '...' : `$${stripeBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div className="h-2 bg-black/20 rounded-full w-full overflow-hidden mb-2">
            <div className="h-full bg-white" style={{ width: `${Math.min((stripeBalance / 190000) * 100, 100)}%` }}></div>
          </div>
          <div className="flex justify-between text-xs font-medium text-sky-100">
            <span>{Math.round((stripeBalance / 190000) * 100)}% of Annual Goal</span>
            <span>Goal: $190k</span>
          </div>
        </div>
        
        <button 
          onClick={() => onChangeView('donate')}
          className="mt-6 w-full py-3 bg-white text-sky-700 font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Plus size={16} /> Make a Donation
        </button>
      </div>

      {/* IMPACT METRICS */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
          <div className="text-3xl font-black text-white mb-1">{familiesSupported}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Families Supported</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
          <div className="text-3xl font-black text-white mb-1">{projects.length}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Missions</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
          <div className="text-3xl font-black text-white mb-1">0</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Donors</div>
        </div>
      </div>

      {/* ACTIVE PROJECTS */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-white">Active Missions</h3>
          <button className="text-xs text-sky-400 font-bold uppercase tracking-wider">View All</button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
          {projects.map((project) => (
            <div key={project.id} className="min-w-[260px] bg-slate-900 border border-slate-800 p-4 rounded-2xl relative group">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-${project.image}-500/10 blur-2xl rounded-full`}></div>
              <div className="flex justify-between items-start mb-8">
                <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-1 rounded border border-slate-700 uppercase">{project.category}</span>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                  <ArrowUpRight size={16} />
                </div>
              </div>
              <h4 className="font-bold text-white text-lg mb-1">{project.title}</h4>
              <p className="text-xs text-slate-500 mb-4">Goal: ${(project.goal / 1000)}k</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500" style={{ width: `${(project.raised / project.goal) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MINISTRY GOALS */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-white">Ministry Goals</h3>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
          {ministryGoals.map((goal) => (
            <div key={goal.id} className="min-w-[260px] bg-slate-900 border border-slate-800 p-5 rounded-2xl relative group">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-${goal.color}-500/10 blur-2xl rounded-full`}></div>
              <div className="relative z-10">
                <div className="text-4xl mb-3">{goal.icon}</div>
                <h4 className="font-bold text-white text-lg mb-2">{goal.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{goal.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>${goal.raised.toLocaleString()} raised</span>
                    <span>Goal: ${(goal.goal / 1000)}k</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full bg-${goal.color}-500`} style={{ width: `${(goal.raised / goal.goal) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRANSPARENCY TEASER */}
      <div 
        onClick={() => onChangeView('expenses')}
        className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between active:scale-[0.99] transition-transform cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <PieChart size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white">Expense Ledger</h4>
            <p className="text-xs text-slate-500">Track every dollar spent.</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-slate-600" />
      </div>

    </div>
  )
}

// ==========================================
// 3. DONATE SCREEN
// ==========================================
function DonateScreen({ onBack, projects }: { onBack: () => void; projects: Project[] }) {
  const [amount, setAmount] = useState(50);
  const [frequency, setFrequency] = useState('One-Time');

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-6 py-6 border-b border-slate-900 flex items-center gap-4">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white">
          <ChevronRight size={20} className="rotate-180" />
        </button>
        <h2 className="font-bold text-lg text-white">Give Generously</h2>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <div className="text-center mb-8">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">I want to give</div>
          <div className="flex items-center justify-center">
            <span className="text-4xl text-slate-500 mr-2">$</span>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(parseInt(e.target.value))}
              className="bg-transparent text-6xl font-black text-white w-40 text-center focus:outline-none focus:border-b-2 border-slate-800"
            />
          </div>
        </div>

        {/* Quick Amounts */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[25, 50, 100, 500].map((amt) => (
            <button 
              key={amt}
              onClick={() => setAmount(amt)}
              className={`py-3 rounded-xl font-bold text-sm transition-all ${amount === amt ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/20' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
            >
              ${amt}
            </button>
          ))}
        </div>

        {/* Frequency */}
        <div className="bg-slate-900 p-1 rounded-xl flex mb-8 border border-slate-800">
          {['One-Time', 'Monthly'].map((freq) => (
            <button 
              key={freq}
              onClick={() => setFrequency(freq)}
              className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${frequency === freq ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
            >
              {freq}
            </button>
          ))}
        </div>

        {/* Project Selection */}
        <div className="mb-auto">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Designation</label>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Heart size={18} />
              </div>
              <span className="font-bold text-white text-sm">General Fund</span>
            </div>
            <span className="text-xs text-sky-500 font-bold">Change</span>
          </div>
        </div>

        <button className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-xl flex items-center justify-center gap-2">
          <CreditCard size={18} /> Confirm Donation
        </button>
      </div>
    </div>
  )
}

// ==========================================
// 3. EXPENSES SCREEN (Transparency)
// ==========================================
function ExpensesScreen() {
  const [filter, setFilter] = useState('All');

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-2">Financial Transparency</h2>
        <p className="text-slate-400 text-sm">Real-time ledger of ministry expenditures.</p>
      </div>

      <div className="px-6 mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {['All', 'Infrastructure', 'Aid', 'Events', 'Logistics'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${filter === f ? 'bg-sky-500/10 border-sky-500 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-4">
        {EXPENSES.filter(e => filter === 'All' || e.category === filter).map((expense) => (
          <div key={expense.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mt-1">
                <FileText size={18} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm mb-1">{expense.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{expense.date}</span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                  <span className="text-slate-400">{expense.category}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-white text-sm">-${expense.amount.toFixed(2)}</div>
              <div className={`text-[10px] font-bold mt-1 ${expense.status === 'Verified' ? 'text-emerald-500' : 'text-amber-500'}`}>
                {expense.status}
              </div>
            </div>
          </div>
        ))}
        
        {/* Verification Badge */}
        <div className="mt-8 mb-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center">
            <Check size={16} strokeWidth={3} />
          </div>
          <div className="flex-1">
            <h5 className="font-bold text-emerald-400 text-sm">Audited & Verified</h5>
            <p className="text-[10px] text-emerald-500/70">All expenses are reviewed by an independent board monthly.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 4. ADMIN DASHBOARD
// ==========================================
function AdminScreen({ projects, onAddProject, onDeleteProject, onUpdateProject, ministryGoals, onAddMinistryGoal, onDeleteMinistryGoal, onUpdateMinistryGoal, onBack, adminPasscode, onChangePasscode, familiesSupported, onIncrementFamilies, onDecrementFamilies, onSetFamiliesCount }: { projects: Project[]; onAddProject: (project: Omit<Project, 'id'>) => void; onDeleteProject: (projectId: number) => void; onUpdateProject: (projectId: number, updates: Partial<Project>) => void; ministryGoals: MinistryGoal[]; onAddMinistryGoal: (goal: Omit<MinistryGoal, 'id'>) => void; onDeleteMinistryGoal: (goalId: number) => void; onUpdateMinistryGoal: (goalId: number, updates: Partial<MinistryGoal>) => void; onBack: () => void; adminPasscode: string; onChangePasscode: (passcode: string) => void; familiesSupported: number; onIncrementFamilies: () => void; onDecrementFamilies: () => void; onSetFamiliesCount: (count: number) => void }) {
  const [activeTab, setActiveTab] = useState<'missions' | 'goals'>('missions');
  const [showForm, setShowForm] = useState(false);
  const [showPasscodeForm, setShowPasscodeForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editGoalAmount, setEditGoalAmount] = useState('');
  const [editGoalTitle, setEditGoalTitle] = useState('');
  const [editGoalDescription, setEditGoalDescription] = useState('');
  const [editGoalIcon, setEditGoalIcon] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [newProject, setNewProject] = useState({
    title: '',
    goal: 0,
    raised: 0,
    category: 'Community',
    image: 'cyan'
  });
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    goal: 0,
    raised: 0,
    icon: '🤝',
    color: 'emerald'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.title && newProject.goal > 0) {
      onAddProject(newProject);
      setNewProject({ title: '', goal: 0, raised: 0, category: 'Community', image: 'cyan' });
      setShowForm(false);
    }
  };

  const handlePasscodeChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasscode && newPasscode === confirmPasscode && newPasscode.length >= 4) {
      onChangePasscode(newPasscode);
      setNewPasscode('');
      setConfirmPasscode('');
      setShowPasscodeForm(false);
      alert('Passcode changed successfully!');
    } else if (newPasscode !== confirmPasscode) {
      alert('Passcodes do not match!');
    } else {
      alert('Passcode must be at least 4 characters!');
    }
  };

  const startEditingRaised = (project: Project) => {
    setEditingProjectId(project.id);
    setEditAmount(project.goal.toString());
    setEditTitle(project.title);
  };

  const saveRaisedAmount = (projectId: number) => {
    const amount = parseInt(editAmount);
    if (!isNaN(amount) && amount >= 0 && editTitle.trim()) {
      onUpdateProject(projectId, { goal: amount, title: editTitle.trim() });
      setEditingProjectId(null);
      setEditAmount('');
      setEditTitle('');
    }
  };

  const cancelEdit = () => {
    setEditingProjectId(null);
    setEditAmount('');
    setEditTitle('');
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.title && newGoal.goal > 0) {
      onAddMinistryGoal(newGoal);
      setNewGoal({ title: '', description: '', goal: 0, raised: 0, icon: '🤝', color: 'emerald' });
      setShowForm(false);
    }
  };

  const startEditingGoal = (goal: MinistryGoal) => {
    setEditingGoalId(goal.id);
    setEditGoalAmount(goal.goal.toString());
    setEditGoalTitle(goal.title);
    setEditGoalDescription(goal.description);
    setEditGoalIcon(goal.icon);
  };

  const saveGoal = (goalId: number) => {
    const amount = parseInt(editGoalAmount);
    if (!isNaN(amount) && amount >= 0 && editGoalTitle.trim()) {
      onUpdateMinistryGoal(goalId, { goal: amount, title: editGoalTitle.trim(), description: editGoalDescription.trim(), icon: editGoalIcon });
      setEditingGoalId(null);
      setEditGoalAmount('');
      setEditGoalTitle('');
      setEditGoalDescription('');
      setEditGoalIcon('');
    }
  };

  const cancelGoalEdit = () => {
    setEditingGoalId(null);
    setEditGoalAmount('');
    setEditGoalTitle('');
    setEditGoalDescription('');
    setEditGoalIcon('');
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="px-6 py-8 border-b border-slate-900">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white">
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
            <p className="text-slate-400 text-sm">Manage Active Missions & Ministry Goals</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900 p-1 rounded-xl flex mb-4 border border-slate-800">
          <button
            onClick={() => { setActiveTab('missions'); setShowForm(false); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'missions' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
          >
            Active Missions
          </button>
          <button
            onClick={() => { setActiveTab('goals'); setShowForm(false); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'goals' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
          >
            Ministry Goals
          </button>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-xl flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add New {activeTab === 'missions' ? 'Mission' : 'Goal'}
          </button>
          <button 
            onClick={() => setShowPasscodeForm(!showPasscodeForm)}
            className="py-3 px-4 bg-slate-900 border border-slate-800 text-slate-400 font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors"
            title="Change Passcode"
          >
            🔒
          </button>
        </div>

        {/* Families Supported Counter */}
        <div className="mt-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Families Supported</label>
          <div className="flex items-center gap-3">
            <button
              onClick={onDecrementFamilies}
              className="w-10 h-10 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center justify-center text-white font-bold text-xl transition-colors"
            >
              −
            </button>
            <div className="flex-1 bg-slate-800 rounded-lg px-4 py-2 text-center">
              <span className="text-2xl font-bold text-white">{familiesSupported}</span>
            </div>
            <button
              onClick={onIncrementFamilies}
              className="w-10 h-10 bg-sky-600 hover:bg-sky-700 border border-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-xl transition-colors"
            >
              +
            </button>
          </div>
          <div className="mt-2">
            <input
              type="number"
              value={familiesSupported}
              onChange={(e) => onSetFamiliesCount(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
              placeholder="Set count directly..."
              min="0"
            />
          </div>
        </div>
      </div>

      {showPasscodeForm && (
        <div className="px-6 py-6 bg-slate-900/50 border-b border-slate-900">
          <form onSubmit={handlePasscodeChange} className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Change Admin Passcode</h3>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">New Passcode</label>
              <input 
                type="password"
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                placeholder="Enter new passcode..."
                minLength={4}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Confirm Passcode</label>
              <input 
                type="password"
                value={confirmPasscode}
                onChange={(e) => setConfirmPasscode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                placeholder="Confirm new passcode..."
                minLength={4}
                required
              />
            </div>
            <div className="flex gap-3">
              <button 
                type="submit"
                className="flex-1 py-3 bg-sky-600 text-white font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-sky-700 transition-colors"
              >
                Update Passcode
              </button>
              <button 
                type="button"
                onClick={() => setShowPasscodeForm(false)}
                className="px-6 py-3 bg-slate-900 border border-slate-800 text-slate-400 font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showForm && activeTab === 'missions' && (
        <div className="px-6 py-6 bg-slate-900/50 border-b border-slate-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Mission Title</label>
              <input 
                type="text"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                placeholder="Enter mission title..."
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Goal Amount</label>
                <input 
                  type="number"
                  value={newProject.goal || ''}
                  onChange={(e) => setNewProject({...newProject, goal: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Raised So Far</label>
                <input 
                  type="number"
                  value={newProject.raised || ''}
                  onChange={(e) => setNewProject({...newProject, raised: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Category</label>
              <select 
                value={newProject.category}
                onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Community">Community</option>
                <option value="Aid">Aid</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Evangelism">Evangelism</option>
                <option value="Events">Events</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button 
                type="submit"
                className="flex-1 py-3 bg-sky-600 text-white font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-sky-700 transition-colors"
              >
                Create Mission
              </button>
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-slate-900 border border-slate-800 text-slate-400 font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showForm && activeTab === 'goals' && (
        <div className="px-6 py-6 bg-slate-900/50 border-b border-slate-900">
          <form onSubmit={handleGoalSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Goal Title</label>
              <input 
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                placeholder="Enter goal title..."
                required
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Description</label>
              <textarea 
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 min-h-[80px]"
                placeholder="Describe the goal..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Goal Amount</label>
                <input 
                  type="number"
                  value={newGoal.goal || ''}
                  onChange={(e) => setNewGoal({...newGoal, goal: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Raised So Far</label>
                <input 
                  type="number"
                  value={newGoal.raised || ''}
                  onChange={(e) => setNewGoal({...newGoal, raised: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Icon (Emoji)</label>
                <input 
                  type="text"
                  value={newGoal.icon}
                  onChange={(e) => setNewGoal({...newGoal, icon: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  placeholder="🤝"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Color</label>
                <select 
                  value={newGoal.color}
                  onChange={(e) => setNewGoal({...newGoal, color: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="emerald">Emerald</option>
                  <option value="sky">Sky</option>
                  <option value="purple">Purple</option>
                  <option value="indigo">Indigo</option>
                  <option value="pink">Pink</option>
                  <option value="amber">Amber</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                type="submit"
                className="flex-1 py-3 bg-sky-600 text-white font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-sky-700 transition-colors"
              >
                Create Goal
              </button>
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-slate-900 border border-slate-800 text-slate-400 font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'missions' && (
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Active Missions ({projects.length})</h3>
        {projects.map((project) => (
          <div key={project.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
            {editingProjectId === project.id ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Mission Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                    placeholder="Enter mission title"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Goal Amount</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                    placeholder="Enter goal amount"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveRaisedAmount(project.id)}
                    className="flex-1 py-2 bg-sky-600 text-white font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-sky-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-400 font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-white text-sm flex-1">{project.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-1 rounded border border-slate-700 uppercase">{project.category}</span>
                    <button
                      onClick={() => startEditingRaised(project)}
                      className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 transition-colors flex items-center justify-center"
                      title="Edit Mission"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${project.title}"?`)) {
                          onDeleteProject(project.id);
                        }
                      }}
                      className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                      title="Delete Mission"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                  <span>Goal: ${project.goal.toLocaleString()}</span>
                  <span>Raised: ${project.raised.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500" style={{ width: `${(project.raised / project.goal) * 100}%` }}></div>
                </div>
              </>
            )}
          </div>
        ))}
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Ministry Goals ({ministryGoals.length})</h3>
          {ministryGoals.map((goal) => (
            <div key={goal.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
              {editingGoalId === goal.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Icon (Emoji)</label>
                    <input
                      type="text"
                      value={editGoalIcon}
                      onChange={(e) => setEditGoalIcon(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                      placeholder="Enter emoji"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Goal Title</label>
                    <input
                      type="text"
                      value={editGoalTitle}
                      onChange={(e) => setEditGoalTitle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                      placeholder="Enter goal title"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Description</label>
                    <textarea
                      value={editGoalDescription}
                      onChange={(e) => setEditGoalDescription(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500 min-h-[60px]"
                      placeholder="Enter description"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Goal Amount</label>
                    <input
                      type="number"
                      value={editGoalAmount}
                      onChange={(e) => setEditGoalAmount(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                      placeholder="Enter goal amount"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveGoal(goal.id)}
                      className="flex-1 py-2 bg-sky-600 text-white font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-sky-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelGoalEdit}
                      className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-400 font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{goal.icon}</span>
                      <h4 className="font-bold text-white text-sm flex-1">{goal.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditingGoal(goal)}
                        className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 transition-colors flex items-center justify-center"
                        title="Edit Goal"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${goal.title}"?`)) {
                            onDeleteMinistryGoal(goal.id);
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                        title="Delete Goal"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{goal.description}</p>
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                    <span>Goal: ${goal.goal.toLocaleString()}</span>
                    <span>Raised: ${goal.raised.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full bg-${goal.color}-500`} style={{ width: `${(goal.raised / goal.goal) * 100}%` }}></div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==========================================
// 5. PROFILE SCREEN
// ==========================================
function ProfileScreen({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center text-slate-400">
          <p>Please log in to view your profile</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 animate-in fade-in">
      <div className="text-center mb-8 pt-4">
        <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto mb-4 border-2 border-sky-500 p-1">
          <div className="w-full h-full bg-slate-700 rounded-full flex items-center justify-center text-2xl font-bold text-slate-400">
            {user.name.charAt(0)}
          </div>
        </div>
        <h2 className="text-xl font-bold text-white">{user.name}</h2>
        <p className="text-sm text-sky-500 font-medium">{user.role} • Member since 2021</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Total Given</div>
          <div className="text-2xl font-black text-white">$0</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Tax Receipt</div>
          <div className="text-sm font-bold text-sky-400 flex items-center justify-center gap-1 cursor-pointer">
            Download 2023
          </div>
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Donation History</h3>
      <div className="space-y-3 mb-8">
        {MY_DONATIONS.map((d) => (
          <div key={d.id} className="flex justify-between items-center py-3 border-b border-slate-900">
            <div>
              <div className="font-bold text-white text-sm">{d.project}</div>
              <div className="text-xs text-slate-500">{d.date}</div>
            </div>
            <div className="font-mono text-white font-bold">${d.amount.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <button onClick={onLogout} className="w-full py-4 bg-slate-900 text-slate-500 font-bold rounded-xl text-sm uppercase tracking-widest hover:text-red-400 hover:bg-slate-900 transition-colors flex items-center justify-center gap-2">
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  )
}

// ==========================================
// SHARED COMPONENTS
// ==========================================
function PasscodePrompt({ onVerify, onCancel }: { onVerify: (passcode: string) => boolean; onCancel: () => void }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = onVerify(passcode);
    if (!isValid) {
      setError(true);
      setPasscode('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-sky-600/20 border border-sky-600/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Admin Access</h2>
          <p className="text-sm text-slate-400">Enter passcode to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className={`w-full bg-slate-800 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-4 text-white text-center text-lg tracking-widest placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors`}
              placeholder="Enter passcode"
              autoFocus
              required
            />
            {error && (
              <p className="text-red-400 text-xs mt-2 text-center font-medium">Incorrect passcode. Please try again.</p>
            )}
          </div>

          <div className="flex gap-3">
            <button 
              type="submit"
              className="flex-1 py-3 bg-sky-600 text-white font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-sky-700 transition-colors"
            >
              Unlock
            </button>
            <button 
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-slate-800 border border-slate-700 text-slate-400 font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BottomNav({ current, onChange }: { current: string; onChange: (view: string) => void }) {
  const items = [
    { id: 'home', icon: Home, label: 'Mission' },
    { id: 'donate', icon: Heart, label: 'Give' },
    { id: 'expenses', icon: PieChart, label: 'Ledger' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 pb-6 pt-2 px-6 flex justify-between items-center absolute bottom-0 w-full z-20">
      {items.map((item) => (
        <button 
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${current === item.id ? 'text-sky-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <item.icon size={24} strokeWidth={current === item.id ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
        </button>
      ))}
    </div>
  )
}

function BellIcon() {
  return (
    <div className="relative">
      <div className="w-2 h-2 bg-red-500 rounded-full absolute top-0 right-0 border border-slate-900"></div>
      <Bell size={18} className="text-slate-400" />
    </div>
  )
}

function RavenLogo({ size = 24, className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width={size} 
      height={size} 
      fill="currentColor" 
      className={className}
    >
      <path d="M22 10.5c-2.3-.5-4.5-.7-6.5-.5-2.5-2.5-6-3.5-9-2.5.5-2 2-3.5 3.5-4.5-3 0-5.5 2-6.5 4.5C2.5 8.5 2 10 2 12c0 2 1 4 2.5 5.5 2 2 5 3 8 3 3 0 6-1 8.5-3 .5 1.5 1.5 2.5 3 3-1-1.5-1.5-3.5-1-5.5 1.5-.5 3-1.5 4-3-.5 0-1 0-1.5-.5z" />
    </svg>
  );
}
