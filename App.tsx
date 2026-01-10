import { useState, useEffect } from 'react';
import { Heart, PieChart, User, Home, Plus, ChevronRight, ArrowUpRight, CreditCard, Check, LogOut, FileText, Bell, Share2, Phone, Mail, Copy } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { DocumentsScreen } from './src/screens/DocumentsScreen';
import { firebaseAuthService } from './src/services/firebaseAuth';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// Stripe Payment Form Component
function StripePaymentForm({ onSuccess, onError }: { onSuccess: () => void; onError: (error: Error) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        onError(new Error(error.message));
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err: any) {
      onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{
        layout: 'tabs',
        paymentMethodOrder: ['card']
      }} />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Complete Donation'}
      </button>
    </form>
  );
}

// --- MOCK DATA ---
const INITIAL_PROJECTS: Project[] = [];

const EXPENSES: any[] = [];

const MY_DONATIONS: any[] = [];

const INITIAL_MINISTRY_GOALS: MinistryGoal[] = [];

interface User {
  name: string;
  role: string;
  email?: string;
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

interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  status: 'Verified' | 'Pending';
}

interface PrayerRequest {
  id: number;
  name: string;
  email: string;
  request: string;
  isAnonymous: boolean;
  createdAt: string;
  prayers: number;
}

interface Subscription {
  id: string;
  subscriptionId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: string;
  donorName: string;
  donorEmail: string;
  projectId?: string | null;
  createdAt: any;
}

export default function SkyRavenApp() {
  const [view, setView] = useState('auth'); // auth, home, donate, expenses, profile, admin, documents
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [ministryGoals, setMinistryGoals] = useState<MinistryGoal[]>(INITIAL_MINISTRY_GOALS);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [adminPasscode, setAdminPasscode] = useState('SkyRaven');
  const [showPasscodePrompt, setShowPasscodePrompt] = useState(false);
  const [familiesSupported, setFamiliesSupported] = useState(0);
  const [stripeBalance, setStripeBalance] = useState(0);
  const [stripePending, setStripePending] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const db = getFirestore();

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChange((authUser) => {
      if (authUser) {
        console.log('Auth user detected:', authUser);
        setUser({
          name: authUser.name,
          role: authUser.role,
          email: authUser.email
        });
      } else {
        console.log('No auth user');
        // Don't clear user if it's the admin (set manually)
        if (user?.role !== 'Administrator') {
          setUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Load projects and goals from Firestore on mount
  useEffect(() => {
    loadProjectsFromFirestore();
    loadGoalsFromFirestore();
    loadFamiliesSupportedFromFirestore();
  }, []);

  const loadProjectsFromFirestore = async () => {
    try {
      console.log('📥 Loading projects from Firestore...');
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const loadedProjects: Project[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Project loaded:', doc.id, data);
        loadedProjects.push({ id: doc.id as any, ...data } as Project);
      });
      console.log(`✅ Loaded ${loadedProjects.length} projects from Firestore`);
      setProjects(loadedProjects);
    } catch (error) {
      console.error('❌ Error loading projects:', error);
      // If there's an error (like missing index), try loading without orderBy
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const loadedProjects: Project[] = [];
        querySnapshot.forEach((doc) => {
          loadedProjects.push({ id: doc.id as any, ...doc.data() } as Project);
        });
        console.log(`✅ Loaded ${loadedProjects.length} projects (fallback)`);
        setProjects(loadedProjects);
      } catch (fallbackError) {
        console.error('❌ Fallback loading also failed:', fallbackError);
      }
    }
  };

  const loadGoalsFromFirestore = async () => {
    try {
      console.log('📥 Loading ministry goals from Firestore...');
      const q = query(collection(db, 'ministryGoals'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const loadedGoals: MinistryGoal[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Goal loaded:', doc.id, data);
        loadedGoals.push({ id: doc.id as any, ...data } as MinistryGoal);
      });
      console.log(`✅ Loaded ${loadedGoals.length} ministry goals from Firestore`);
      setMinistryGoals(loadedGoals);
    } catch (error) {
      console.error('❌ Error loading goals:', error);
      // If there's an error (like missing index), try loading without orderBy
      try {
        const querySnapshot = await getDocs(collection(db, 'ministryGoals'));
        const loadedGoals: MinistryGoal[] = [];
        querySnapshot.forEach((doc) => {
          loadedGoals.push({ id: doc.id as any, ...doc.data() } as MinistryGoal);
        });
        console.log(`✅ Loaded ${loadedGoals.length} goals (fallback)`);
        setMinistryGoals(loadedGoals);
      } catch (fallbackError) {
        console.error('❌ Fallback loading also failed:', fallbackError);
      }
    }
  };

  const loadFamiliesSupportedFromFirestore = async () => {
    try {
      console.log('📥 Loading families supported from Firestore...');
      const querySnapshot = await getDocs(collection(db, 'settings'));
      let found = false;
      querySnapshot.forEach((doc) => {
        if (doc.id === 'familiesSupported') {
          const count = doc.data().count || 0;
          console.log('✅ Families supported:', count);
          setFamiliesSupported(count);
          found = true;
        }
      });
      if (!found) {
        console.log('ℹ️ No families supported count found in Firestore, using default (0)');
      }
    } catch (error) {
      console.error('❌ Error loading families supported:', error);
    }
  };

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.name || firebaseUser.email?.split('@')[0] || 'User',
          role: firebaseUser.role || 'Supporter'
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch Stripe balance on mount and when view changes to home
  useEffect(() => {
    if (view === 'home' && user) {
      fetchStripeBalance();
    }
  }, [view, user]);

  const fetchStripeBalance = async () => {
    setLoadingBalance(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/skyraven-ministries/us-central1';
      const response = await fetch(`${apiUrl}/getBalance`);
      if (response.ok) {
        const data = await response.json();
        setStripeBalance(data.available || 0);
        setStripePending(data.pending || 0);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleLogin = () => {
    // Firebase auth listener will handle setting the user
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

  const addProject = async (project: Omit<Project, 'id'>) => {
    try {
      console.log('📤 Adding new project to Firestore:', project);
      const docRef = await addDoc(collection(db, 'projects'), {
        ...project,
        createdAt: new Date().toISOString()
      });
      const newProject = { ...project, id: docRef.id as any };
      console.log('✅ Project added successfully with ID:', docRef.id);
      setProjects([newProject, ...projects]);
      // Reload projects to ensure consistency
      setTimeout(() => loadProjectsFromFirestore(), 500);
    } catch (error) {
      console.error('❌ Error adding project:', error);
      alert('Failed to add mission. Please check your internet connection and try again.');
      throw error;
    }
  };

  const deleteProject = async (projectId: number) => {
    try {
      console.log('🗑️ Deleting project:', projectId);
      await deleteDoc(doc(db, 'projects', projectId.toString()));
      console.log('✅ Project deleted successfully');
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      alert('Failed to delete mission. Please check your internet connection and try again.');
      throw error;
    }
  };

  const updateProject = async (projectId: number, updates: Partial<Project>) => {
    try {
      console.log('✏️ Updating project:', projectId, updates);
      await updateDoc(doc(db, 'projects', projectId.toString()), updates);
      console.log('✅ Project updated successfully');
      setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates } : p));
      // Reload projects to ensure consistency
      setTimeout(() => loadProjectsFromFirestore(), 500);
    } catch (error) {
      console.error('❌ Error updating project:', error);
      alert('Failed to update mission. Please check your internet connection and try again.');
      throw error;
    }
  };

  const addMinistryGoal = async (goal: Omit<MinistryGoal, 'id'>) => {
    try {
      console.log('📤 Adding new ministry goal to Firestore:', goal);
      const docRef = await addDoc(collection(db, 'ministryGoals'), {
        ...goal,
        createdAt: new Date().toISOString()
      });
      const newGoal = { ...goal, id: docRef.id as any };
      console.log('✅ Ministry goal added successfully with ID:', docRef.id);
      setMinistryGoals([newGoal, ...ministryGoals]);
      // Reload goals to ensure consistency
      setTimeout(() => loadGoalsFromFirestore(), 500);
    } catch (error) {
      console.error('❌ Error adding goal:', error);
      alert('Failed to add goal. Please check your internet connection and try again.');
      throw error;
    }
  };

  const deleteMinistryGoal = async (goalId: number) => {
    try {
      console.log('🗑️ Deleting ministry goal:', goalId);
      await deleteDoc(doc(db, 'ministryGoals', goalId.toString()));
      console.log('✅ Ministry goal deleted successfully');
      setMinistryGoals(ministryGoals.filter(g => g.id !== goalId));
    } catch (error) {
      console.error('❌ Error deleting goal:', error);
      alert('Failed to delete goal. Please check your internet connection and try again.');
      throw error;
    }
  };

  const updateMinistryGoal = async (goalId: number, updates: Partial<MinistryGoal>) => {
    try {
      console.log('✏️ Updating ministry goal:', goalId, updates);
      await updateDoc(doc(db, 'ministryGoals', goalId.toString()), updates);
      console.log('✅ Ministry goal updated successfully');
      setMinistryGoals(ministryGoals.map(g => g.id === goalId ? { ...g, ...updates } : g));
      // Reload goals to ensure consistency
      setTimeout(() => loadGoalsFromFirestore(), 500);
    } catch (error) {
      console.error('❌ Error updating goal:', error);
      alert('Failed to update goal. Please check your internet connection and try again.');
      throw error;
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      console.log('📤 Adding new expense to Firestore:', expense);
      const docRef = await addDoc(collection(db, 'expenses'), {
        ...expense,
        createdAt: new Date().toISOString()
      });
      const newExpense = { ...expense, id: docRef.id as any };
      console.log('✅ Expense added successfully with ID:', docRef.id);
      setExpenses([newExpense, ...expenses]);
    } catch (error) {
      console.error('❌ Error adding expense:', error);
      alert('Failed to add expense. Please check your internet connection and try again.');
      throw error;
    }
  };

  const deleteExpense = async (expenseId: number) => {
    try {
      console.log('🗑️ Deleting expense:', expenseId);
      await deleteDoc(doc(db, 'expenses', expenseId.toString()));
      console.log('✅ Expense deleted successfully');
      setExpenses(expenses.filter(e => e.id !== expenseId));
    } catch (error) {
      console.error('❌ Error deleting expense:', error);
      alert('Failed to delete expense. Please check your internet connection and try again.');
      throw error;
    }
  };

  const updateExpense = async (expenseId: number, updates: Partial<Expense>) => {
    try {
      console.log('✏️ Updating expense:', expenseId, updates);
      await updateDoc(doc(db, 'expenses', expenseId.toString()), updates);
      console.log('✅ Expense updated successfully');
      setExpenses(expenses.map(e => e.id === expenseId ? { ...e, ...updates } : e));
    } catch (error) {
      console.error('❌ Error updating expense:', error);
      alert('Failed to update expense. Please check your internet connection and try again.');
      throw error;
    }
  };

  const addPrayerRequest = async (prayerRequest: Omit<PrayerRequest, 'id' | 'prayers'>) => {
    try {
      console.log('📤 Adding new prayer request to Firestore:', prayerRequest);
      const docRef = await addDoc(collection(db, 'prayerRequests'), {
        ...prayerRequest,
        prayers: 0,
        createdAt: new Date().toISOString()
      });
      const newRequest = { ...prayerRequest, id: docRef.id as any, prayers: 0 };
      console.log('✅ Prayer request added successfully with ID:', docRef.id);
      setPrayerRequests([newRequest, ...prayerRequests]);
    } catch (error) {
      console.error('❌ Error adding prayer request:', error);
      alert('Failed to add prayer request. Please check your internet connection and try again.');
      throw error;
    }
  };

  const incrementPrayers = async (requestId: number) => {
    try {
      const request = prayerRequests.find(r => r.id === requestId);
      if (!request) return;
      
      const newPrayerCount = request.prayers + 1;
      await updateDoc(doc(db, 'prayerRequests', requestId.toString()), { prayers: newPrayerCount });
      setPrayerRequests(prayerRequests.map(r => r.id === requestId ? { ...r, prayers: newPrayerCount } : r));
    } catch (error) {
      console.error('❌ Error incrementing prayers:', error);
    }
  };

  const incrementFamiliesSupported = async () => {
    const newCount = familiesSupported + 1;
    console.log('⬆️ Incrementing families supported to:', newCount);
    await setFamiliesSupportedCount(newCount);
  };

  const decrementFamiliesSupported = async () => {
    const newCount = Math.max(0, familiesSupported - 1);
    console.log('⬇️ Decrementing families supported to:', newCount);
    await setFamiliesSupportedCount(newCount);
  };

  const setFamiliesSupportedCount = async (count: number) => {
    try {
      const newCount = Math.max(0, count);
      console.log('✏️ Setting families supported count to:', newCount);
      
      // Try to update first
      try {
        await updateDoc(doc(db, 'settings', 'familiesSupported'), { 
          count: newCount,
          updatedAt: new Date().toISOString()
        });
        console.log('✅ Families supported count updated successfully');
      } catch (updateError) {
        // If document doesn't exist, create it with setDoc
        console.log('ℹ️ Creating new familiesSupported document');
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'settings', 'familiesSupported'), { 
          count: newCount,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log('✅ Families supported document created successfully');
      }
      
      setFamiliesSupported(newCount);
    } catch (error) {
      console.error('❌ Error updating families supported:', error);
      alert('Failed to update families count. Please check your internet connection and try again.');
      throw error;
    }
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
                {view === 'home' && <HomeScreen onChangeView={setView} projects={projects} ministryGoals={ministryGoals} familiesSupported={familiesSupported} stripeBalance={stripeBalance} stripePending={stripePending} loadingBalance={loadingBalance} />}
                {view === 'donate' && <DonateScreen onBack={() => setView('home')} projects={projects} onPaymentSuccess={fetchStripeBalance} />}
                {view === 'expenses' && <ExpensesScreen expenses={expenses} />}
                {view === 'documents' && <DocumentsScreen onBack={() => setView('home')} />}
                {view === 'profile' && <ProfileScreen user={user} onLogout={() => { setUser(null); setView('auth'); }} prayerRequests={prayerRequests} onAddPrayerRequest={addPrayerRequest} onIncrementPrayers={incrementPrayers} />}
                {view === 'admin' && <AdminScreen projects={projects} onAddProject={addProject} onDeleteProject={deleteProject} onUpdateProject={updateProject} ministryGoals={ministryGoals} onAddMinistryGoal={addMinistryGoal} onDeleteMinistryGoal={deleteMinistryGoal} onUpdateMinistryGoal={updateMinistryGoal} expenses={expenses} onAddExpense={addExpense} onDeleteExpense={deleteExpense} onUpdateExpense={updateExpense} onLogout={async () => { await firebaseAuthService.signOut(); setUser(null); setView('auth'); }} adminPasscode={adminPasscode} onChangePasscode={setAdminPasscode} familiesSupported={familiesSupported} onIncrementFamilies={incrementFamiliesSupported} onDecrementFamilies={decrementFamiliesSupported} onSetFamiliesCount={setFamiliesSupportedCount} />}
              </main>
              
              {view !== 'admin' && <BottomNav current={view} onChange={setView} />}
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up with Firebase
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
        
        const user = await firebaseAuthService.signUp(email, password, name);
        console.log('User signed up:', user);
        onLogin();
      } else {
        // Login with Firebase
        if (!email || !password) {
          setError('Please enter email and password');
          setLoading(false);
          return;
        }
        
        const user = await firebaseAuthService.signIn(email, password);
        console.log('User signed in:', user);
        onLogin();
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');
    setLoading(true);

    try {
      if (!resetEmail) {
        setError('Please enter your email address');
        setLoading(false);
        return;
      }
      
      await firebaseAuthService.resetPassword(resetEmail);
      setResetSuccess('Password reset email sent! Check your inbox.');
      setResetEmail('');
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSuccess('');
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
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
        {showForgotPassword ? (
          // Forgot Password Form
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-white mb-2">Reset Password</h3>
              <p className="text-sm text-slate-400">Enter your email to receive a password reset link</p>
            </div>
            
            <input
              type="email"
              placeholder="Email Address"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full px-4 py-4 bg-slate-900 border border-slate-800 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              disabled={loading}
            />
            
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2">
                {error}
              </div>
            )}
            
            {resetSuccess && (
              <div className="text-green-400 text-sm text-center bg-green-500/10 border border-green-500/20 rounded-lg py-2">
                {resetSuccess}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <button 
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setError('');
                setResetSuccess('');
                setResetEmail('');
              }}
              disabled={loading}
              className="w-full py-4 bg-slate-900 border border-slate-800 text-white font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          // Regular Sign In/Sign Up Form
          <>
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

        {!isSignUp && (
          <button 
            onClick={() => {
              setShowForgotPassword(true);
              setError('');
            }}
            disabled={loading}
            className="w-full mt-3 text-sm text-sky-400 hover:text-sky-300 transition-colors disabled:opacity-50"
          >
            Forgot your password?
          </button>
        )}

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
          </>
        )}
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
function HomeScreen({ onChangeView, projects, ministryGoals, familiesSupported, stripeBalance, stripePending, loadingBalance }: { onChangeView: (view: string) => void; projects: Project[]; ministryGoals: MinistryGoal[]; familiesSupported: number; stripeBalance: number; stripePending: number; loadingBalance: boolean }) {
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
            {loadingBalance ? '...' : `$${(stripeBalance + stripePending).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          {stripePending > 0 && (
            <div className="text-xs text-sky-200 mb-2">
              ${stripePending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pending
            </div>
          )}
          <div className="h-2 bg-black/20 rounded-full w-full overflow-hidden mb-2">
            <div className="h-full bg-white" style={{ width: `${Math.min(((stripeBalance + stripePending) / 190000) * 100, 100)}%` }}></div>
          </div>
          <div className="flex justify-between text-xs font-medium text-sky-100">
            <span>{Math.round(((stripeBalance + stripePending) / 190000) * 100)}% of Annual Goal</span>
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
function DonateScreen({ onBack, projects, onPaymentSuccess }: { onBack: () => void; projects: Project[]; onPaymentSuccess: () => void }) {
  const [amount, setAmount] = useState(50);
  const [frequency, setFrequency] = useState('One-Time');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const handleDonation = async () => {
    setError('');
    
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!donorName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!donorEmail.trim() || !donorEmail.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setIsProcessing(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/skyraven-ministries/us-central1';
      
      // Try to connect to Firebase Functions
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${apiUrl}/createPaymentIntent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount, // Send dollar amount, backend will convert to cents
          currency: 'usd',
          projectId: selectedProject?.id,
          donorName,
          donorEmail,
          message,
          recurring: frequency === 'Monthly',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // If Firebase Functions not available, fall back to development mode
        throw new Error('API_NOT_AVAILABLE');
      }

      const { clientSecret } = await response.json();
      
      // Set client secret to show Stripe payment form
      setClientSecret(clientSecret);
      setIsProcessing(false);
      
    } catch (err: any) {
      console.error('Donation error:', err);
      
      // Show appropriate error message
      if (err.name === 'AbortError') {
        setError('Connection timeout. Please check your internet connection and try again.');
      } else if (err.message === 'Failed to fetch' || err.message === 'API_NOT_AVAILABLE') {
        setError('Unable to connect to payment server. Please ensure Firebase Functions are deployed and running.');
      } else {
        setError(err.message || 'Failed to process donation. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (showPaymentForm) {
    return (
      <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-900 flex items-center gap-4">
          <button onClick={() => setShowPaymentForm(false)} className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white">
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <h2 className="font-bold text-lg text-white">Complete Your Gift</h2>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Donation Summary */}
          <div className="bg-gradient-to-br from-sky-600 to-indigo-600 p-6 rounded-2xl mb-6">
            <div className="text-sky-100 text-sm font-bold uppercase tracking-widest mb-2">Your Donation</div>
            <div className="text-5xl font-black text-white mb-2">${amount}</div>
            <div className="text-sky-100 text-sm">{frequency} • {selectedProject?.title || 'General Fund'}</div>
          </div>

          {/* Donor Information Form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Full Name</label>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Email Address</label>
              <input
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a message of encouragement..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors resize-none"
                disabled={isProcessing}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-3 px-4">
                {error}
              </div>
            )}

            {/* Stripe Payment Form */}
            {clientSecret && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <Elements stripe={stripePromise} options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'night',
                  },
                }}>
                  <StripePaymentForm 
                    onSuccess={() => {
                      alert(`✅ Payment Successful!\n\nThank you ${donorName}!\n\nYour ${frequency.toLowerCase()} donation of $${amount} has been processed.\n\nConfirmation email sent to: ${donorEmail}`);
                      onPaymentSuccess(); // Refresh balance
                      setShowPaymentForm(false);
                      setClientSecret(null);
                      setAmount(50);
                      setDonorName('');
                      setDonorEmail('');
                      setMessage('');
                      setSelectedProject(null);
                    }}
                    onError={(err) => setError(err.message)}
                  />
                </Elements>
              </div>
            )}

            {/* Payment Method Info */}
            {!clientSecret && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard size={18} className="text-sky-400" />
                  <span className="text-white font-bold text-sm">Secure Payment</span>
                </div>
                <p className="text-slate-500 text-xs">
                  Your payment information is secure and encrypted. This is a {frequency.toLowerCase()} donation.
                </p>
              </div>
            )}

            {!clientSecret && (
              <button
                onClick={handleDonation}
                disabled={isProcessing}
                className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CreditCard size={18} /> Complete Donation ${amount}
                  </>
                )}
              </button>
            )}

            <p className="text-xs text-center text-slate-600 mt-4">
              By continuing, you agree to our donation terms. You will receive an email receipt for tax purposes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-6 py-6 border-b border-slate-900 flex items-center gap-4">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white">
          <ChevronRight size={20} className="rotate-180" />
        </button>
        <h2 className="font-bold text-lg text-white">Give Generously</h2>
      </div>

      <div className="flex-1 p-6 flex flex-col overflow-y-auto">
        <div className="text-center mb-8">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">I want to give</div>
          <div className="flex items-center justify-center mb-2">
            <span className="text-4xl text-slate-500 mr-2">$</span>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              className="bg-transparent text-6xl font-black text-white w-40 text-center focus:outline-none focus:border-b-2 border-slate-800 cursor-pointer hover:text-sky-400 transition-colors"
              placeholder="50"
            />
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
            <span>✏️</span> Tap amount to enter custom value
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
        <div className="mb-8">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Designation</label>
          <button
            onClick={() => setShowProjectSelector(!showProjectSelector)}
            className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Heart size={18} />
              </div>
              <span className="font-bold text-white text-sm">{selectedProject?.title || 'General Fund'}</span>
            </div>
            <span className="text-xs text-sky-500 font-bold">Change</span>
          </button>

          {/* Project Selector Dropdown */}
          {showProjectSelector && (
            <div className="mt-3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => {
                  setSelectedProject(null);
                  setShowProjectSelector(false);
                }}
                className="w-full p-4 text-left hover:bg-slate-800 transition-colors border-b border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Heart size={16} />
                  </div>
                  <span className="font-bold text-white text-sm">General Fund</span>
                </div>
              </button>
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    setSelectedProject(project);
                    setShowProjectSelector(false);
                  }}
                  className="w-full p-4 text-left hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold">
                      {project.title.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white text-sm">{project.title}</div>
                      <div className="text-xs text-slate-500">{project.category}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowPaymentForm(true)}
          className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-xl flex items-center justify-center gap-2 mt-auto"
        >
          <CreditCard size={18} /> Continue to Donation
        </button>
      </div>
    </div>
  )
}

// ==========================================
// 3. EXPENSES SCREEN (Transparency)
// ==========================================
function ExpensesScreen({ expenses }: { expenses?: Expense[] }) {
  const [filter, setFilter] = useState('All');
  const expensesList = expenses && expenses.length > 0 ? expenses : EXPENSES;

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
        {expensesList.filter(e => filter === 'All' || e.category === filter).map((expense) => (
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
function AdminScreen({ projects, onAddProject, onDeleteProject, onUpdateProject, ministryGoals, onAddMinistryGoal, onDeleteMinistryGoal, onUpdateMinistryGoal, expenses, onAddExpense, onDeleteExpense, onUpdateExpense, onLogout, adminPasscode, onChangePasscode, familiesSupported, onIncrementFamilies, onDecrementFamilies, onSetFamiliesCount }: { projects: Project[]; onAddProject: (project: Omit<Project, 'id'>) => void; onDeleteProject: (projectId: number) => void; onUpdateProject: (projectId: number, updates: Partial<Project>) => void; ministryGoals: MinistryGoal[]; onAddMinistryGoal: (goal: Omit<MinistryGoal, 'id'>) => void; onDeleteMinistryGoal: (goalId: number) => void; onUpdateMinistryGoal: (goalId: number, updates: Partial<MinistryGoal>) => void; expenses: Expense[]; onAddExpense: (expense: Omit<Expense, 'id'>) => void; onDeleteExpense: (expenseId: number) => void; onUpdateExpense: (expenseId: number, updates: Partial<Expense>) => void; onLogout: () => void; adminPasscode: string; onChangePasscode: (passcode: string) => void; familiesSupported: number; onIncrementFamilies: () => void; onDecrementFamilies: () => void; onSetFamiliesCount: (count: number) => void }) {
  const [activeTab, setActiveTab] = useState<'missions' | 'goals' | 'ledger'>('missions');
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
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [editExpenseTitle, setEditExpenseTitle] = useState('');
  const [editExpenseAmount, setEditExpenseAmount] = useState('');
  const [editExpenseCategory, setEditExpenseCategory] = useState('');
  const [editExpenseDate, setEditExpenseDate] = useState('');
  const [editExpenseStatus, setEditExpenseStatus] = useState<'Verified' | 'Pending'>('Pending');
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
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: 0,
    category: 'Infrastructure',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending' as 'Verified' | 'Pending'
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

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpense.title && newExpense.amount > 0) {
      onAddExpense(newExpense);
      setNewExpense({ title: '', amount: 0, category: 'Infrastructure', date: new Date().toISOString().split('T')[0], status: 'Pending' });
      setShowForm(false);
    }
  };

  const startEditingExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setEditExpenseTitle(expense.title);
    setEditExpenseAmount(expense.amount.toString());
    setEditExpenseCategory(expense.category);
    setEditExpenseDate(expense.date);
    setEditExpenseStatus(expense.status);
  };

  const saveExpense = (expenseId: number) => {
    const amount = parseFloat(editExpenseAmount);
    if (!isNaN(amount) && amount > 0 && editExpenseTitle.trim()) {
      onUpdateExpense(expenseId, {
        title: editExpenseTitle.trim(),
        amount: amount,
        category: editExpenseCategory,
        date: editExpenseDate,
        status: editExpenseStatus
      });
      setEditingExpenseId(null);
      setEditExpenseTitle('');
      setEditExpenseAmount('');
      setEditExpenseCategory('');
      setEditExpenseDate('');
      setEditExpenseStatus('Pending');
    }
  };

  const cancelExpenseEdit = () => {
    setEditingExpenseId(null);
    setEditExpenseTitle('');
    setEditExpenseAmount('');
    setEditExpenseCategory('');
    setEditExpenseDate('');
    setEditExpenseStatus('Pending');
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="px-6 py-8 border-b border-slate-900">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onLogout} className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
            <p className="text-slate-400 text-sm">Manage Active Missions, Goals & Expenses</p>
          </div>
        </div>

        {/* Families Supported Counter - Prominent Display */}
        <div className="mb-4 bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-700/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <span className="text-lg">👨‍👩‍👧‍👦</span>
              </div>
              <label className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Families Helped</label>
            </div>
            <div className="text-3xl font-black text-emerald-400">{familiesSupported}</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onDecrementFamilies}
              className="flex-1 h-12 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-slate-300 font-bold text-2xl transition-colors"
              title="Decrease count"
            >
              −
            </button>
            <button
              onClick={onIncrementFamilies}
              className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl transition-colors shadow-lg"
              title="Increase count"
            >
              +
            </button>
          </div>
          <div className="mt-3">
            <input
              type="number"
              value={familiesSupported}
              onChange={(e) => onSetFamiliesCount(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-center text-lg font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Set count directly..."
              min="0"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900 p-1 rounded-xl flex mb-4 border border-slate-800">
          <button
            onClick={() => { setActiveTab('missions'); setShowForm(false); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'missions' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
          >
            Missions
          </button>
          <button
            onClick={() => { setActiveTab('goals'); setShowForm(false); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'goals' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
          >
            Goals
          </button>
          <button
            onClick={() => { setActiveTab('ledger'); setShowForm(false); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'ledger' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
          >
            Ledger
          </button>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-xl flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add New {activeTab === 'missions' ? 'Mission' : activeTab === 'goals' ? 'Goal' : 'Expense'}
          </button>
          <button 
            onClick={() => setShowPasscodeForm(!showPasscodeForm)}
            className="py-3 px-4 bg-slate-900 border border-slate-800 text-slate-400 font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors"
            title="Change Passcode"
          >
            🔒
          </button>
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
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Target Number</label>
                <input 
                  type="number"
                  value={newGoal.goal || ''}
                  onChange={(e) => setNewGoal({...newGoal, goal: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. 100"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Current Progress</label>
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
                    <label className="text-xs text-slate-500 mb-1 block">Target Number</label>
                    <input
                      type="number"
                      value={editGoalAmount}
                      onChange={(e) => setEditGoalAmount(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                      placeholder="Enter target number"
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
                    <span className="font-bold text-white">{goal.raised.toLocaleString()} of {goal.goal.toLocaleString()}</span>
                    <span>{Math.round((goal.raised / goal.goal) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full bg-${goal.color}-500`} style={{ width: `${Math.min((goal.raised / goal.goal) * 100, 100)}%` }}></div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && activeTab === 'ledger' && (
        <div className="px-6 py-6 bg-slate-900/50 border-b border-slate-900">
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Expense Title</label>
              <input 
                type="text"
                value={newExpense.title}
                onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                placeholder="Enter expense description..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Amount ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={newExpense.amount || ''}
                  onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Category</label>
                <select 
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Aid">Aid</option>
                  <option value="Events">Events</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Community">Community</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Date</label>
                <input 
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Status</label>
                <select 
                  value={newExpense.status}
                  onChange={(e) => setNewExpense({...newExpense, status: e.target.value as 'Verified' | 'Pending'})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                type="submit"
                className="flex-1 py-3 bg-sky-600 text-white font-bold rounded-xl text-sm uppercase tracking-widest hover:bg-sky-700 transition-colors"
              >
                Add Expense
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

      {activeTab === 'ledger' && (
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Expense Ledger ({expenses.length})</h3>
          {expenses.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">No expenses recorded yet.</p>
              <p className="text-xs mt-2">Click "Add New Expense" to get started.</p>
            </div>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                {editingExpenseId === expense.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Expense Title</label>
                      <input
                        type="text"
                        value={editExpenseTitle}
                        onChange={(e) => setEditExpenseTitle(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                        placeholder="Enter expense title"
                        autoFocus
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Amount ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editExpenseAmount}
                          onChange={(e) => setEditExpenseAmount(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Category</label>
                        <select
                          value={editExpenseCategory}
                          onChange={(e) => setEditExpenseCategory(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                        >
                          <option value="Infrastructure">Infrastructure</option>
                          <option value="Aid">Aid</option>
                          <option value="Events">Events</option>
                          <option value="Logistics">Logistics</option>
                          <option value="Community">Community</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Date</label>
                        <input
                          type="date"
                          value={editExpenseDate}
                          onChange={(e) => setEditExpenseDate(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Status</label>
                        <select
                          value={editExpenseStatus}
                          onChange={(e) => setEditExpenseStatus(e.target.value as 'Verified' | 'Pending')}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Verified">Verified</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveExpense(expense.id)}
                        className="flex-1 py-2 bg-sky-600 text-white font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-sky-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelExpenseEdit}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-400 font-bold rounded-lg text-xs uppercase tracking-widest hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mt-1">
                          <FileText size={18} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-sm mb-1">{expense.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{expense.date}</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                            <span className="text-slate-400">{expense.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="text-right mr-2">
                          <div className="font-mono font-bold text-white text-sm">-${expense.amount.toFixed(2)}</div>
                          <div className={`text-[10px] font-bold mt-1 ${expense.status === 'Verified' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {expense.status}
                          </div>
                        </div>
                        <button
                          onClick={() => startEditingExpense(expense)}
                          className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 transition-colors flex items-center justify-center"
                          title="Edit Expense"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${expense.title}"?`)) {
                              onDeleteExpense(expense.id);
                            }
                          }}
                          className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                          title="Delete Expense"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ==========================================
// 5. PROFILE SCREEN
// ==========================================
function ProfileScreen({ user, onLogout, prayerRequests, onAddPrayerRequest, onIncrementPrayers }: { user: User | null; onLogout: () => void; prayerRequests: PrayerRequest[]; onAddPrayerRequest: (request: Omit<PrayerRequest, 'id' | 'prayers'>) => void; onIncrementPrayers: (requestId: number) => void }) {
  const [donations, setDonations] = useState<any[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [totalGiven, setTotalGiven] = useState(0);
  const [activeTab, setActiveTab] = useState<'info' | 'prayers'>('info');
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [prayerForm, setPrayerForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    request: '',
    isAnonymous: false
  });
  const db = getFirestore();

  // Load user's donations from Firestore
  useEffect(() => {
    const loadDonations = async () => {
      if (!user) return;
      
      try {
        setLoadingDonations(true);
        console.log('📥 Loading donations from Firestore...');
        
        // Query donations for this user (by email)
        const q = query(
          collection(db, 'donations'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const userDonations: any[] = [];
        let total = 0;
        
        console.log('👤 Current user email:', user.email);
        console.log('📊 Total donations in database:', querySnapshot.size);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('💰 Donation found:', {
            id: doc.id,
            donorEmail: data.donorEmail,
            amount: data.amount,
            status: data.status,
            matches: data.donorEmail === user.email
          });
          
          // Filter by user's email - only show this user's donations
          if (user.email && data.donorEmail === user.email) {
            userDonations.push({
              id: doc.id,
              ...data,
              date: data.createdAt?.toDate().toLocaleDateString() || 'N/A'
            });
            // Only count completed donations in total
            if (data.status === 'completed') {
              total += data.amount || 0;
            }
          }
        });
        
        console.log('✅ Loaded donations for user:', userDonations.length);
        console.log('💵 Total given:', total);
        setDonations(userDonations);
        setTotalGiven(total);
      } catch (error) {
        console.error('❌ Error loading donations:', error);
      } finally {
        setLoadingDonations(false);
      }
    };

    loadDonations();
  }, [user]);

  const handlePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerForm.request.trim()) return;

    try {
      await onAddPrayerRequest({
        name: prayerForm.isAnonymous ? 'Anonymous' : prayerForm.name,
        email: prayerForm.email,
        request: prayerForm.request,
        isAnonymous: prayerForm.isAnonymous,
        createdAt: new Date().toISOString()
      });
      
      setPrayerForm({ ...prayerForm, request: '' });
      setShowPrayerForm(false);
      setActiveTab('prayers');
      alert('🙏 Prayer request submitted successfully!');
    } catch (error) {
      console.error('Error submitting prayer request:', error);
    }
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent('https://sky-raven-ministries.vercel.app');
    const text = encodeURIComponent('Check out SkyRaven Ministries - making a difference in our community!');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent('https://sky-raven-ministries.vercel.app');
    const text = encodeURIComponent('Join me in supporting SkyRaven Ministries! Together we can make a difference. 🙏');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Check out SkyRaven Ministries');
    const body = encodeURIComponent('I wanted to share this amazing ministry with you: https://sky-raven-ministries.vercel.app\\n\\nSkyRaven Ministries is making a real difference in our community. Come see how you can get involved!');
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText('https://sky-raven-ministries.vercel.app');
    alert('✅ Link copied to clipboard!');
  };

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
    <div className="animate-in fade-in pb-24">
      {/* Header */}
      <div className="p-6 text-center pt-8">
        <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto mb-4 border-2 border-sky-500 p-1">
          <div className="w-full h-full bg-slate-700 rounded-full flex items-center justify-center text-2xl font-bold text-slate-400">
            {user.name.charAt(0)}
          </div>
        </div>
        <h2 className="text-xl font-bold text-white">{user.name}</h2>
        <p className="text-sm text-sky-500 font-medium">{user.role} • Member since 2021</p>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 mb-4">
        <div className="bg-slate-900 p-1 rounded-xl flex border border-slate-800">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'info' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('prayers')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'prayers' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
          >
            Prayer Feed
          </button>
        </div>
      </div>

      {activeTab === 'info' ? (
        <div className="px-6">
          {/* Donation Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Total Given</div>
              <div className="text-2xl font-black text-white">${totalGiven.toFixed(2)}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Tax Receipt</div>
              <div className="text-sm font-bold text-sky-400 flex items-center justify-center gap-1 cursor-pointer">
                Download 2023
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6 bg-gradient-to-br from-sky-900/30 to-sky-800/20 border border-sky-700/30 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-sky-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>📞</span> Contact Ministry
            </h3>
            <div className="space-y-3">
              <a href="tel:5392517999" className="flex items-center gap-3 text-white hover:text-sky-400 transition-colors">
                <div className="w-10 h-10 bg-sky-600/20 border border-sky-500/30 rounded-lg flex items-center justify-center">
                  <Phone size={18} className="text-sky-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Phone</div>
                  <div className="font-bold">539.251.7999</div>
                </div>
              </a>
              <a href="mailto:Admin@SkyRavenMinistries.com" className="flex items-center gap-3 text-white hover:text-sky-400 transition-colors">
                <div className="w-10 h-10 bg-sky-600/20 border border-sky-500/30 rounded-lg flex items-center justify-center">
                  <Mail size={18} className="text-sky-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Email</div>
                  <div className="font-bold text-sm">Admin@SkyRavenMinistries.com</div>
                </div>
              </a>
            </div>
          </div>

          {/* Social Sharing */}
          <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Share2 size={16} /> Share Ministry
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={shareOnFacebook}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
              >
                Facebook
              </button>
              <button
                onClick={shareOnTwitter}
                className="py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
              >
                Twitter
              </button>
              <button
                onClick={shareViaEmail}
                className="py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
              >
                <Mail size={14} /> Email
              </button>
              <button
                onClick={copyLink}
                className="py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
              >
                <Copy size={14} /> Copy Link
              </button>
            </div>
          </div>

          {/* Submit Prayer Request */}
          <div className="mb-6">
            <button
              onClick={() => setShowPrayerForm(!showPrayerForm)}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>🙏</span> {showPrayerForm ? 'Cancel' : 'Submit Prayer Request'}
            </button>
          </div>

          {showPrayerForm && (
            <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-lg font-bold text-white mb-4">Prayer Request</h3>
              <form onSubmit={handlePrayerSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Your Name</label>
                  <input
                    type="text"
                    value={prayerForm.name}
                    onChange={(e) => setPrayerForm({ ...prayerForm, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    placeholder="Enter your name"
                    required={!prayerForm.isAnonymous}
                    disabled={prayerForm.isAnonymous}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Prayer Request</label>
                  <textarea
                    value={prayerForm.request}
                    onChange={(e) => setPrayerForm({ ...prayerForm, request: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 min-h-[120px]"
                    placeholder="Share your prayer request..."
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={prayerForm.isAnonymous}
                    onChange={(e) => setPrayerForm({ ...prayerForm, isAnonymous: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700"
                  />
                  <label htmlFor="anonymous" className="text-sm text-slate-400">Submit anonymously</label>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm uppercase tracking-widest transition-colors"
                >
                  Submit Prayer Request
                </button>
              </form>
            </div>
          )}

          {/* Donation History */}
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Donation History</h3>
          <div className="space-y-3 mb-8">
            {loadingDonations ? (
              <div className="text-center text-slate-500 py-4">Loading donations...</div>
            ) : donations.length === 0 ? (
              <div className="text-center text-slate-500 py-4">No donations yet</div>
            ) : (
              donations.map((d) => (
                <div key={d.id} className="flex justify-between items-center py-3 border-b border-slate-900">
                  <div>
                    <div className="font-bold text-white text-sm">{d.projectId || 'General Fund'}</div>
                    <div className="text-xs text-slate-500">
                      {d.date} • {d.status}
                    </div>
                  </div>
                  <div className="font-mono text-white font-bold">${(d.amount || 0).toFixed(2)}</div>
                </div>
              ))
            )}
          </div>

          {/* Sign Out Button */}
          <button onClick={async () => {
            try {
              await firebaseAuthService.signOut();
              onLogout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }} className="w-full py-4 bg-slate-900 text-slate-500 font-bold rounded-xl text-sm uppercase tracking-widest hover:text-red-400 hover:bg-slate-900 transition-colors flex items-center justify-center gap-2">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      ) : (
        <div className="px-6">
          {/* Prayer Feed */}
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Community Prayer Requests ({prayerRequests.length})</h3>
          <div className="space-y-4">
            {prayerRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <span className="text-4xl mb-4 block">🙏</span>
                <p className="text-sm">No prayer requests yet.</p>
                <p className="text-xs mt-2">Be the first to submit one!</p>
              </div>
            ) : (
              prayerRequests.map((request) => (
                <div key={request.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-white text-sm mb-1">{request.name}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => onIncrementPrayers(request.id)}
                      className="flex items-center gap-2 py-2 px-3 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-600/30 transition-colors"
                    >
                      <span>🙏</span>
                      <span className="text-sm font-bold">{request.prayers}</span>
                    </button>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{request.request}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
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
    <div className="bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 pb-6 pt-2 px-6 flex justify-between items-center fixed bottom-0 w-full max-w-md z-20">
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
