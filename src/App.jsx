import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, CheckCircle, Sun, Smile, Zap, Send, Sparkles, Loader, Moon, 
  BookOpen, Wine, Target, Plus, ArrowRight, User, LogOut, ShieldCheck,
  Wind, Heart, Share2, Trash2, Settings, Droplets, Calendar, Clock, Book,
  Timer, Play, Pause, RotateCcw, Volume2, Utensils, Flame, X, Edit3, Gift,
  Medal, Mail, Lock, Eye, EyeOff, AlertCircle
} from 'lucide-react';

import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

const callGeminiAPI = async (prompt, systemInstruction = "") => {
  if (!apiKey) return "⚠️ API key lipsește.";
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: systemInstruction }] } }) }
    );
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Eroare.";
  } catch (error) { return "Nu pot accesa AI-ul momentan."; }
};

const knowledgeBase = {
  somn: [
    { title: 'Ciclurile REM', content: 'Somnul REM este crucial pentru stabilitate emoțională.' },
    { title: 'Temperatura Optimă', content: '18.3°C este temperatura ideală în dormitor.' },
    { title: 'Regula 10-3-2-1', content: 'Fără cofeină cu 10h înainte, fără mâncare cu 3h, fără muncă cu 2h, fără ecrane cu 1h.' },
  ],
  nutritie: [
    { title: 'Glucoza și Energia', content: 'Ordinea mâncării: Fibre -> Proteine -> Carbohidrați reduce vârful glicemic cu 73%.' },
    { title: 'Hidratarea', content: 'Deshidratarea de 2% scade performanța cognitivă.' },
  ],
  focus: [
    { title: 'Deep Work', content: 'Multitasking-ul scade IQ-ul temporar cu 10 puncte.' },
    { title: 'Regula 90 minute', content: 'După un ciclu de focus, ai nevoie de 20 min odihnă.' },
  ]
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-neutral-950 rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 p-6 ${className}`}>{children}</div>
);

const CircularProgress = ({ score, size = 24 }) => {
  const radius = size * 1.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  let color = score >= 90 ? "text-emerald-500" : score > 70 ? "text-blue-500" : score > 40 ? "text-amber-500" : "text-rose-500";
  return (
    <div style={{ width: size*4, height: size*4 }} className="flex items-center justify-center">
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200 dark:text-neutral-800" />
        <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className={`${color} transition-all duration-1000`} />
      </svg>
    </div>
  );
};

const getDefaultUserData = () => ({
  profile: { name: "", age: 0 },
  waterIntake: 0, waterGoal: 2500, waterDate: new Date().toDateString(),
  mood: null, moodDate: new Date().toDateString(),
  dailyHabits: { sleep: false, nature: false, reading: false, alcohol: false },
  dailyHabitsDate: new Date().toDateString(),
  customHabits: [],
  challengeConfig: { name: "", reward: "", isConfigured: false },
  challengeProgress: Array(30).fill(false),
  journalHistory: [],
  darkMode: false, disclaimerAccepted: false
});

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState(getDefaultUserData());
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotification, setShowNotification] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [score, setScore] = useState(0);
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [activeSound, setActiveSound] = useState(null);
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [generatedMeal, setGeneratedMeal] = useState(null);
  const [isMealLoading, setIsMealLoading] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('Start');
  const [breathingScale, setBreathingScale] = useState('scale-90');
  const [breathingDuration, setBreathingDuration] = useState('duration-[4000ms]');
  const [gratitudeLog, setGratitudeLog] = useState(["", "", ""]);
  const [newHabit, setNewHabit] = useState({ what: "", when: "" });
  const [generatedRoutine, setGeneratedRoutine] = useState(null);
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);
  const [routineMood, setRoutineMood] = useState('Obosit');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (!user) { setUserData(getDefaultUserData()); setDataLoading(false); }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setDataLoading(true);
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const today = new Date().toDateString();
        const newData = { ...data };
        if (data.waterDate !== today) { newData.waterIntake = 0; newData.waterDate = today; }
        if (data.dailyHabitsDate !== today) { newData.dailyHabits = { sleep: false, nature: false, reading: false, alcohol: false }; newData.dailyHabitsDate = today; }
        if (data.moodDate !== today) { newData.mood = null; newData.moodDate = today; }
        setUserData(newData);
        setDarkMode(data.darkMode || false);
        setShowDisclaimer(!data.disclaimerAccepted);
      } else {
        const defaultData = getDefaultUserData();
        defaultData.profile.name = currentUser.displayName || '';
        setDoc(userDocRef, defaultData);
        setUserData(defaultData);
        setShowDisclaimer(true);
      }
      setDataLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const saveUserData = async (newData) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(userDocRef, newData, { merge: true });
  };

  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);

  useEffect(() => {
    let interval;
    if (isFocusActive && focusTime > 0) { interval = setInterval(() => setFocusTime(t => t - 1), 1000); }
    else if (focusTime === 0) { setIsFocusActive(false); triggerNotification("Sesiune Completă", "Ai terminat!", "success"); }
    return () => clearInterval(interval);
  }, [isFocusActive, focusTime]);

  useEffect(() => {
    let interval, phaseTimeout;
    if (isBreathing) {
      const runCycle = () => {
        setBreathingPhase('Inspiră'); setBreathingScale('scale-125'); setBreathingDuration('duration-[4000ms]');
        phaseTimeout = setTimeout(() => {
          setBreathingPhase('Ține'); setBreathingDuration('duration-[7000ms]');
          phaseTimeout = setTimeout(() => { setBreathingPhase('Expiră'); setBreathingScale('scale-90'); setBreathingDuration('duration-[8000ms]'); }, 7000);
        }, 4000);
      };
      runCycle();
      interval = setInterval(runCycle, 19100);
    } else { setBreathingPhase('Start'); setBreathingScale('scale-90'); }
    return () => { clearInterval(interval); clearTimeout(phaseTimeout); };
  }, [isBreathing]);

  useEffect(() => {
    let newScore = 0;
    newScore += Math.min((userData.waterIntake / userData.waterGoal) * 25, 25);
    Object.values(userData.dailyHabits).forEach(val => { if(val) newScore += 15; });
    if(userData.mood !== null) newScore += 15;
    setScore(Math.round(Math.min(newScore, 100)));
  }, [userData]);

  const formatTime = (s) => `${Math.floor(s/60)}:${s%60 < 10 ? '0' : ''}${s%60}`;
  const triggerNotification = (title, message, type = 'info') => { setShowNotification({ title, message, type }); setTimeout(() => setShowNotification(null), 4000); };

  const toggleHabit = (key) => {
    const newHabits = { ...userData.dailyHabits, [key]: !userData.dailyHabits[key] };
    const newData = { ...userData, dailyHabits: newHabits, dailyHabitsDate: new Date().toDateString() };
    setUserData(newData); saveUserData(newData);
  };

  const addWater = (amount) => {
    const newData = { ...userData, waterIntake: userData.waterIntake + amount, waterDate: new Date().toDateString() };
    setUserData(newData); saveUserData(newData);
  };

  const setMoodValue = (val) => {
    const newData = { ...userData, mood: val, moodDate: new Date().toDateString() };
    setUserData(newData); saveUserData(newData);
  };

  const addCustomHabit = () => {
    if (newHabit.what && newHabit.when) {
      const newData = { ...userData, customHabits: [...userData.customHabits, { ...newHabit, id: Date.now() }] };
      setUserData(newData); saveUserData(newData);
      setNewHabit({ what: "", when: "" });
      triggerNotification("Protocol Salvat", "Sincronizat în cloud!", "success");
    }
  };

  const removeHabit = (id) => {
    const newData = { ...userData, customHabits: userData.customHabits.filter(h => h.id !== id) };
    setUserData(newData); saveUserData(newData);
  };

  const updateChallenge = (config, progress) => {
    const newData = { ...userData };
    if (config !== undefined) newData.challengeConfig = config;
    if (progress !== undefined) newData.challengeProgress = progress;
    setUserData(newData); saveUserData(newData);
  };

  const saveJournalEntry = () => {
    if (gratitudeLog.some(e => e.trim())) {
      const newEntry = { id: Date.now(), date: new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' }), time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }), entries: gratitudeLog.filter(e => e.trim()) };
      const newData = { ...userData, journalHistory: [newEntry, ...userData.journalHistory] };
      setUserData(newData); saveUserData(newData);
      setGratitudeLog(["", "", ""]);
      triggerNotification("Salvat în Cloud", "Jurnalul tău e în siguranță!", "success");
    }
  };

  const toggleDarkMode = () => {
    const newData = { ...userData, darkMode: !darkMode };
    setDarkMode(!darkMode); setUserData(newData); saveUserData(newData);
  };

  const acceptDisclaimer = () => {
    const newData = { ...userData, disclaimerAccepted: true };
    setShowDisclaimer(false); setUserData(newData); saveUserData(newData);
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setAuthError('');
    const formData = new FormData(e.target);
    const email = formData.get('email'), password = formData.get('password'), name = formData.get('name'), age = parseInt(formData.get('age')) || 30;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const initialData = getDefaultUserData();
      initialData.profile = { name, age };
      initialData.waterGoal = age > 55 ? 2200 : 2500;
      await setDoc(doc(db, 'users', cred.user.uid), initialData);
      triggerNotification(`Bun venit, ${name}!`, "Cont creat cu succes.", "success");
    } catch (error) {
      setAuthError(error.code === 'auth/email-already-in-use' ? 'Email deja folosit.' : error.code === 'auth/weak-password' ? 'Parolă prea scurtă (min 6 caractere).' : 'Eroare la înregistrare.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setAuthError('');
    const formData = new FormData(e.target);
    try {
      await signInWithEmailAndPassword(auth, formData.get('email'), formData.get('password'));
      triggerNotification("Bun venit înapoi!", "Datele tale sunt sincronizate.", "success");
    } catch (error) { setAuthError('Email sau parolă incorectă.'); }
  };

  const handleLogout = async () => { await signOut(auth); triggerNotification("Deconectat", "Pe curând!", "info"); };

  const generateMealPlan = async () => {
    if(!ingredientsInput.trim()) return;
    setIsMealLoading(true);
    const result = await callGeminiAPI(`Am: ${ingredientsInput}. Dă-mi o rețetă sănătoasă, scurtă.`, "Ești chef nutriționist.");
    setGeneratedMeal(result); setIsMealLoading(false);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput; setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: msg }]);
    setIsTyping(true);
    const response = await callGeminiAPI(msg, `Ești BioSync AI, vorbești cu ${userData.profile?.name || 'utilizatorul'}. Fii empatic și pozitiv.`);
    setChatHistory(prev => [...prev, { role: 'ai', content: response }]);
    setIsTyping(false);
  };

  const generateRoutine = async () => {
    setIsGeneratingRoutine(true);
    const response = await callGeminiAPI(`Rutină de 3 minute pentru: ${routineMood}. Scurt.`);
    setGeneratedRoutine(response); setIsGeneratingRoutine(false);
  };

  // AUTH SCREEN
  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader className="w-8 h-8 text-indigo-400 animate-spin"/></div>;
  
  if (!currentUser) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-white/10 rounded-2xl p-8 text-white">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full mx-auto flex items-center justify-center shadow-lg mb-6 animate-pulse"><Activity className="w-10 h-10"/></div>
          <h1 className="text-4xl font-bold mb-2">BioSync Pro</h1>
          <p className="text-neutral-400">Contul tău, progresul tău.</p>
        </div>
        <div className="flex bg-neutral-800 rounded-xl p-1 mb-6">
          <button onClick={() => { setAuthMode('login'); setAuthError(''); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${authMode === 'login' ? 'bg-indigo-600' : 'text-neutral-400'}`}>Autentificare</button>
          <button onClick={() => { setAuthMode('register'); setAuthError(''); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${authMode === 'register' ? 'bg-indigo-600' : 'text-neutral-400'}`}>Cont Nou</button>
        </div>
        {authError && <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-sm"><AlertCircle className="w-4 h-4"/>{authError}</div>}
        <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {authMode === 'register' && (<><div><label className="block text-sm text-neutral-300 mb-1">Numele tău</label><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500"/><input required name="name" placeholder="Alex" className="w-full pl-12 pr-4 py-4 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500"/></div></div><div><label className="block text-sm text-neutral-300 mb-1">Vârsta</label><input required name="age" type="number" placeholder="30" className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-xl text-white"/></div></>)}
          <div><label className="block text-sm text-neutral-300 mb-1">Email</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500"/><input required name="email" type="email" placeholder="email@exemplu.com" className="w-full pl-12 pr-4 py-4 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500"/></div></div>
          <div><label className="block text-sm text-neutral-300 mb-1">Parolă</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500"/><input required name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full pl-12 pr-12 py-4 bg-neutral-800 border border-neutral-700 rounded-xl text-white"/><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">{showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}</button></div></div>
          <button type="submit" className="w-full bg-white text-indigo-900 font-bold py-4 rounded-xl hover:bg-neutral-200 transition flex items-center justify-center gap-2">{authMode === 'login' ? 'Intră în cont' : 'Creează cont'} <ArrowRight className="w-5 h-5"/></button>
        </form>
        <p className="text-center text-xs text-neutral-500 mt-6">© {new Date().getFullYear()} Cristian Puravu</p>
      </div>
    </div>
  );

  if (dataLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader className="w-8 h-8 text-indigo-400 animate-spin"/><p className="text-neutral-400 ml-3">Se încarcă...</p></div>;

  // MAIN APP
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-neutral-100 flex flex-col md:flex-row">
      {showDisclaimer && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white dark:bg-neutral-900 rounded-3xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center mb-4"><Heart className="w-8 h-8 text-white"/></div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Bun venit în BioSync Pro!</h2>
              <p className="text-slate-500 dark:text-neutral-400 text-sm">Creat cu pasiune de Cristian Puravu</p>
            </div>
            <div className="bg-slate-50 dark:bg-neutral-800 rounded-xl p-4 mb-6 text-sm text-slate-600 dark:text-neutral-300 space-y-2">
              <p><strong>📋 Disclaimer:</strong></p>
              <p>Aplicația este în scop educațional. <strong>Nu constituie sfaturi medicale.</strong></p>
              <p>Consultă un specialist înainte de schimbări majore în stilul de viață.</p>
              <p>Utilizarea se face pe propria răspundere.</p>
            </div>
            <button onClick={acceptDisclaimer} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5"/> Am înțeles</button>
            <p className="text-center text-xs text-slate-400 mt-4">© {new Date().getFullYear()} Cristian Puravu</p>
          </div>
        </div>
      )}

      {showNotification && (
        <div className="fixed top-4 right-4 z-[90] bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl p-4 shadow-lg animate-fade-in max-w-sm">
          <p className="font-bold text-slate-800 dark:text-white">{showNotification.title}</p>
          <p className="text-sm text-slate-500 dark:text-neutral-400">{showNotification.message}</p>
        </div>
      )}

      <nav className="bg-white dark:bg-black border-r border-slate-200 dark:border-neutral-800 w-20 lg:w-64 h-screen fixed hidden md:flex flex-col z-50">
        <div className="p-6"><div className="flex items-center gap-3 text-indigo-700 dark:text-indigo-400 font-bold text-xl"><div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white"><Activity className="w-6 h-6"/></div><span className="hidden lg:block">BioSync</span></div></div>
        <div className="flex-1 px-4 space-y-2 mt-4">
          {[{id:'dashboard',label:'Dashboard',icon:Activity},{id:'focus',label:'Focus',icon:Timer},{id:'nutrition',label:'Nutriție',icon:Utensils},{id:'challenges',label:'Provocări',icon:Flame},{id:'mindfulness',label:'Mindfulness',icon:Smile},{id:'knowledge',label:'Bibliotecă',icon:BookOpen},{id:'profile',label:'Profil',icon:User},{id:'ai-coach',label:'AI Coach',icon:Zap}].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition ${activeTab === item.id ? 'bg-indigo-50 dark:bg-neutral-900 text-indigo-700 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-900'}`}>
              <item.icon className="w-5 h-5"/><span className="hidden lg:block text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 w-full bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t border-slate-200 dark:border-neutral-800 z-50">
        <div className="flex justify-around p-2">
          {[{id:'dashboard',icon:Activity},{id:'focus',icon:Timer},{id:'challenges',icon:Flame},{id:'mindfulness',icon:Smile},{id:'ai-coach',icon:Zap},{id:'profile',icon:User}].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-3 rounded-2xl ${activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-neutral-900' : 'text-slate-400'}`}><item.icon className="w-6 h-6"/></button>
          ))}
        </div>
      </nav>

      <main className="flex-1 md:ml-20 lg:ml-64 p-4 md:p-8 min-h-screen pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div className="relative rounded-3xl overflow-hidden bg-black text-white shadow-2xl border border-neutral-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      {['😞','😐','🙂','🤩'].map((m,idx) => (<button key={idx} onClick={() => setMoodValue(idx)} className={`text-2xl hover:scale-125 transition ${userData.mood === idx ? 'scale-125' : 'opacity-50'}`}>{m}</button>))}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Salut, {userData.profile?.name || 'Oaspete'}!</h1>
                    <div className="flex gap-4 flex-wrap mt-4">
                      <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10"><Droplets className="w-4 h-4 text-blue-400"/><span className="font-bold">{userData.waterIntake} / {userData.waterGoal} ml</span></div>
                      <div className="flex gap-2">{[250,500].map(amt => (<button key={amt} onClick={() => addWater(amt)} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-sm font-bold hover:bg-blue-500/30">+{amt}ml</button>))}</div>
                      <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10"><Zap className="w-4 h-4 text-amber-400"/><span className="font-bold">{score} / 100</span></div>
                    </div>
                  </div>
                  <div className="relative"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold">{score}</span><CircularProgress score={score} size={32}/></div>
                </div>
              </div>
              
              <h3 className="font-bold text-xl flex items-center gap-2 text-slate-800 dark:text-white"><Target className="w-6 h-6 text-indigo-500"/> Laborator de Obiceiuri</h3>
              <Card className="border-l-4 border-l-indigo-500">
                <div className="space-y-4">
                  <div className="flex items-center bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-3"><Zap className="w-5 h-5 text-indigo-500 mr-3"/><input value={newHabit.what} onChange={e => setNewHabit({...newHabit, what: e.target.value})} placeholder="Voi face..." className="w-full outline-none bg-transparent dark:text-white"/></div>
                  <div className="flex gap-4"><div className="flex-1 flex items-center bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-3"><Activity className="w-5 h-5 text-amber-500 mr-3"/><input value={newHabit.when} onChange={e => setNewHabit({...newHabit, when: e.target.value})} placeholder="După..." className="w-full outline-none bg-transparent dark:text-white"/></div><button onClick={addCustomHabit} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"><Plus className="w-5 h-5"/> Adaugă</button></div>
                </div>
              </Card>

              <h3 className="font-bold text-xl flex items-center gap-2 text-slate-800 dark:text-white mt-8"><ShieldCheck className="w-6 h-6 text-emerald-500"/> Protocoale Zilnice</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{id:'sleep',label:'Somn 7-8h',icon:Moon,color:'indigo'},{id:'nature',label:'Lumină Solară',icon:Sun,color:'amber'},{id:'reading',label:'Deep Work',icon:BookOpen,color:'emerald'},{id:'alcohol',label:'Zero Toxine',icon:Wine,color:'rose'}].map(item => (
                  <div key={item.id} onClick={() => toggleHabit(item.id)} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 cursor-pointer transition hover:scale-105 ${userData.dailyHabits[item.id] ? `bg-${item.color}-50 dark:bg-neutral-900 border-${item.color}-200` : 'bg-white dark:bg-neutral-950 border-slate-100 dark:border-neutral-800'}`}>
                    <item.icon className={`w-8 h-8 ${userData.dailyHabits[item.id] ? `text-${item.color}-500` : 'text-slate-400'}`}/>
                    <span className={`text-sm font-bold text-center ${userData.dailyHabits[item.id] ? `text-${item.color}-700 dark:text-${item.color}-300` : 'text-slate-600 dark:text-neutral-400'}`}>{item.label}</span>
                    {userData.dailyHabits[item.id] && <CheckCircle className={`w-5 h-5 text-${item.color}-500`}/>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'focus' && (
            <div className="max-w-xl mx-auto text-center space-y-8 py-10 animate-fade-in">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Focus Zen</h2>
              <Card className="flex flex-col items-center p-12 bg-neutral-900 border-neutral-800">
                <div className="text-6xl font-mono font-bold text-white mb-8">{formatTime(focusTime)}</div>
                <div className="flex gap-4">
                  <button onClick={() => setIsFocusActive(!isFocusActive)} className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-500">{isFocusActive ? <Pause className="w-8 h-8 text-white"/> : <Play className="w-8 h-8 text-white ml-1"/>}</button>
                  <button onClick={() => { setIsFocusActive(false); setFocusTime(25*60); }} className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700"><RotateCcw className="w-6 h-6 text-neutral-400"/></button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
              <div className="text-center"><h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Nutriție AI</h1></div>
              <Card className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white border-none">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Utensils className="w-6 h-6"/> Chef AI</h2>
                <div className="flex gap-2">
                  <input value={ingredientsInput} onChange={e => setIngredientsInput(e.target.value)} placeholder="ouă, spanac, avocado..." className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/30"/>
                  <button onClick={generateMealPlan} disabled={isMealLoading} className="bg-white text-emerald-900 px-4 py-2 rounded-xl font-bold">{isMealLoading ? <Loader className="w-5 h-5 animate-spin"/> : 'Generează'}</button>
                </div>
              </Card>
              {generatedMeal && <Card className="border-l-4 border-l-emerald-500"><h3 className="font-bold text-lg mb-3 text-slate-800 dark:text-white">Rețeta:</h3><p className="text-slate-600 dark:text-neutral-300 whitespace-pre-line">{generatedMeal}</p></Card>}
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              <div className="text-center"><h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Provocarea de 30 Zile</h1></div>
              {!userData.challengeConfig.isConfigured ? (
                <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none p-8">
                  <div className="flex items-center gap-3 mb-6"><div className="p-3 bg-white/10 rounded-xl"><Flame className="w-6 h-6 text-orange-400"/></div><h2 className="text-xl font-bold">Configurează Provocarea</h2></div>
                  <div className="space-y-4">
                    <input placeholder="Numele provocării..." className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-white placeholder-white/50" value={userData.challengeConfig.name} onChange={e => updateChallenge({...userData.challengeConfig, name: e.target.value})}/>
                    <input placeholder="Recompensa..." className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-white placeholder-white/50" value={userData.challengeConfig.reward} onChange={e => updateChallenge({...userData.challengeConfig, reward: e.target.value})}/>
                    <button disabled={!userData.challengeConfig.name} onClick={() => updateChallenge({...userData.challengeConfig, isConfigured: true})} className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">Start <ArrowRight className="w-5 h-5"/></button>
                  </div>
                </Card>
              ) : (
                <Card className="bg-neutral-900 border-neutral-800">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
                    <div className="flex items-center gap-4"><div className="p-3 bg-rose-600 rounded-2xl"><Flame className="w-8 h-8 text-white"/></div><div><h2 className="text-2xl font-bold text-white">{userData.challengeConfig.name}</h2><p className="text-rose-300 text-sm">{userData.challengeConfig.reward}</p></div></div>
                    <div className="text-right"><div className="text-3xl font-bold text-white">{userData.challengeProgress.filter(Boolean).length}/30</div><button onClick={() => updateChallenge({...userData.challengeConfig, isConfigured: false})} className="text-neutral-500 text-xs mt-1">Editează</button></div>
                  </div>
                  <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
                    {userData.challengeProgress.map((done, idx) => (
                      <button key={idx} onClick={() => { const newProg = [...userData.challengeProgress]; newProg[idx] = !newProg[idx]; updateChallenge(undefined, newProg); }} className={`aspect-square rounded-lg flex items-center justify-center font-bold transition ${done ? 'bg-rose-600 text-white' : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'}`}>{idx+1}</button>
                    ))}
                  </div>
                  <div className="w-full h-1 bg-neutral-800 mt-6 rounded-full overflow-hidden"><div className="h-full bg-rose-500 transition-all" style={{width: `${(userData.challengeProgress.filter(Boolean).length/30)*100}%`}}></div></div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'mindfulness' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              <div className="text-center"><h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Mindfulness</h1></div>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="flex flex-col items-center justify-center min-h-[350px] bg-gradient-to-b from-cyan-50 to-blue-50 dark:from-neutral-900 dark:to-black">
                  <div className={`w-40 h-40 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-2xl transition-all ${breathingScale} ${breathingDuration}`}>{breathingPhase}</div>
                  <button onClick={() => setIsBreathing(!isBreathing)} className={`mt-8 px-8 py-3 rounded-xl font-bold ${isBreathing ? 'bg-slate-200 dark:bg-neutral-800 text-slate-600' : 'bg-cyan-600 text-white'}`}>{isBreathing ? 'Stop' : 'Start Respirație'}</button>
                </Card>
                <Card className="bg-gradient-to-b from-rose-50 to-pink-50 dark:from-neutral-900 dark:to-black">
                  <div className="flex items-center gap-2 mb-4"><Heart className="w-6 h-6 text-rose-500 fill-rose-500"/><h2 className="text-xl font-bold text-rose-900 dark:text-white">Jurnal Recunoștință</h2></div>
                  <div className="space-y-3">
                    {gratitudeLog.map((val, idx) => (<input key={idx} value={val} onChange={e => { const n = [...gratitudeLog]; n[idx] = e.target.value; setGratitudeLog(n); }} placeholder={`${idx+1}. Sunt recunoscător pentru...`} className="w-full p-3 bg-white dark:bg-neutral-900 border border-rose-100 dark:border-neutral-800 rounded-xl text-slate-700 dark:text-white"/>))}
                  </div>
                  <button onClick={saveJournalEntry} className="w-full mt-4 bg-rose-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"><Book className="w-4 h-4"/> Salvează în Cloud</button>
                </Card>
              </div>
              {userData.journalHistory.length > 0 && (
                <div><h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Memorii</h3>
                  <div className="grid md:grid-cols-3 gap-4">{userData.journalHistory.slice(0,6).map(entry => (<Card key={entry.id}><p className="font-bold text-slate-800 dark:text-white text-sm mb-2">{entry.date}</p><ul className="space-y-1">{entry.entries.map((item,i) => (<li key={i} className="text-sm text-slate-600 dark:text-neutral-400">• {item}</li>))}</ul></Card>))}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-indigo-900 text-white p-10 rounded-3xl"><h2 className="text-3xl font-bold mb-2">Biblioteca</h2><p className="text-indigo-200">Cunoștințe esențiale pentru biohacking.</p></div>
              {Object.entries(knowledgeBase).map(([cat, items]) => (<div key={cat}><h3 className="text-xl font-bold text-slate-800 dark:text-white capitalize mb-4 mt-6">{cat}</h3><div className="grid md:grid-cols-2 gap-4">{items.map((item, i) => (<Card key={i}><h4 className="font-bold text-slate-800 dark:text-white mb-2">{item.title}</h4><p className="text-sm text-slate-600 dark:text-neutral-400">{item.content}</p></Card>))}</div></div>))}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
              <div className="relative"><div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-3xl"></div>
                <div className="bg-white dark:bg-neutral-950 rounded-b-3xl border border-slate-100 dark:border-neutral-800 p-6 pt-0">
                  <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 mb-4 gap-4">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-neutral-900 rounded-full border-4 border-white dark:border-neutral-950 flex items-center justify-center"><User className="w-10 h-10 text-slate-300 dark:text-neutral-600"/></div>
                    <div className="text-center md:text-left flex-1"><h1 className="text-2xl font-bold text-slate-800 dark:text-white">{userData.profile?.name}</h1><p className="text-slate-500 text-sm">{currentUser?.email}</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-neutral-800 pt-6 text-center">
                    <div><div className="font-bold text-xl text-slate-800 dark:text-white">{score}</div><div className="text-xs text-slate-400">Scor</div></div>
                    <div><div className="font-bold text-xl text-slate-800 dark:text-white">{userData.customHabits.length}</div><div className="text-xs text-slate-400">Protocoale</div></div>
                    <div><div className="font-bold text-xl text-slate-800 dark:text-white">{userData.challengeProgress.filter(Boolean).length}</div><div className="text-xs text-slate-400">Zile Provocare</div></div>
                  </div>
                </div>
              </div>
              <div><h3 className="font-bold text-slate-800 dark:text-white mb-4">Protocoale Active</h3>
                {userData.customHabits.length === 0 ? <p className="text-slate-500 text-center p-8 bg-slate-50 dark:bg-neutral-900 rounded-2xl">Niciun protocol.</p> : (
                  <div className="space-y-3">{userData.customHabits.map(h => (<div key={h.id} className="bg-white dark:bg-neutral-950 p-4 rounded-xl border border-slate-100 dark:border-neutral-800 flex justify-between items-center"><div><p className="font-bold text-slate-800 dark:text-white">{h.what}</p><p className="text-xs text-slate-500">{h.when}</p></div><button onClick={() => removeHabit(h.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-5 h-5"/></button></div>))}</div>
                )}
              </div>
              <Card>
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Settings className="w-5 h-5"/> Setări</h3>
                <div className="space-y-4">
                  <div onClick={toggleDarkMode} className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-neutral-900 rounded-lg cursor-pointer"><span className="text-slate-700 dark:text-neutral-200">Mod Întunecat</span><div className={`w-10 h-5 rounded-full relative ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${darkMode ? 'left-6' : 'left-1'}`}></div></div></div>
                  <div className="flex justify-between items-center p-2"><span className="text-slate-700 dark:text-neutral-200">Cloud Sync</span><span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Activ</span></div>
                  <div className="pt-4 border-t border-slate-100 dark:border-neutral-800"><button onClick={handleLogout} className="text-red-500 text-sm font-bold flex items-center gap-2 p-2 w-full hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><LogOut className="w-4 h-4"/> Deconectare</button></div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'ai-coach' && (
            <div className="h-[80vh] flex flex-col bg-white dark:bg-neutral-950 rounded-3xl shadow-lg border border-slate-100 dark:border-neutral-800 max-w-4xl mx-auto animate-fade-in">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white rounded-t-3xl"><div className="flex items-center gap-4"><div className="p-3 bg-white/20 rounded-xl"><Zap className="w-6 h-6"/></div><div><h2 className="font-bold text-lg">BioSync AI</h2><p className="text-xs text-indigo-100">Asistentul tău personal</p></div></div></div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-black">
                {chatHistory.length === 0 && <div className="flex flex-col items-center justify-center h-full text-slate-400"><Sparkles className="w-16 h-16 mb-4 text-indigo-200 dark:text-neutral-800"/><p>Cum te pot ajuta?</p></div>}
                {chatHistory.map((m, i) => (<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`p-4 rounded-2xl max-w-[80%] text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 rounded-bl-none'}`}>{m.content}</div></div>))}
                {isTyping && <div className="flex justify-start"><div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 px-4 py-3 rounded-2xl flex gap-1"><span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span><span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span></div></div>}
                <div ref={chatEndRef}/>
              </div>
              <div className="p-4 bg-white dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-800 rounded-b-3xl">
                <div className="flex gap-3 bg-slate-50 dark:bg-neutral-900 p-2 rounded-2xl border border-slate-200 dark:border-neutral-800">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Scrie mesajul..." className="flex-1 bg-transparent px-4 py-2 text-sm outline-none text-slate-800 dark:text-white"/>
                  <button onClick={handleSendMessage} className="bg-indigo-600 text-white p-3 rounded-xl"><Send className="w-5 h-5"/></button>
                </div>
              </div>
            </div>
          )}

          <footer className="mt-16 mb-8 py-8 border-t border-slate-200 dark:border-neutral-800 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-slate-400 text-sm"><Heart className="w-4 h-4 text-rose-400 fill-rose-400"/><span>Creat cu pasiune de <strong className="text-slate-600 dark:text-neutral-300">Cristian Puravu</strong></span></div>
              <p className="text-xs text-slate-400">© {new Date().getFullYear()} BioSync Pro</p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
