import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Brain, Info, CheckCircle, Sun, Smile, Zap, Send, Sparkles, Loader, Moon, BookOpen, Leaf, Wine, Target, Plus, ArrowRight, User, LogOut, ChevronRight, ShieldCheck, Trophy, Wind, Heart, Share2, Camera, Trash2, Settings, Droplets, Calendar, Clock, Book, Timer, Play, Pause, RotateCcw, Volume2, Utensils, Flame, X, Edit3, Gift, Medal, Mail, Lock, Eye, EyeOff, AlertCircle
} from 'lucide-react';

// --- IMPORTURI FIREBASE ---
// Importăm instanțele deja inițializate din fișierul tău firebase.js
import { auth, db } from './firebase'; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';

// --- Configurare API Gemini ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 

// --- Funcție Helper pentru Gemini API ---
const callGeminiAPI = async (prompt, systemInstruction = "") => {
  if (!apiKey) return "⚠️ Cheia API lipsește. Verifică VITE_GEMINI_API_KEY în Vercel.";
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        }),
      }
    );
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Eroare la generare.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Momentan nu pot accesa serverul AI.";
  }
};

// --- Baza de Date Studii COMPLETĂ ---
const knowledgeBase = {
  somn: [
    { title: 'Ciclurile REM', content: 'Somnul REM este crucial pentru stabilitate emoțională. Lipsa lui crește reactivitatea amigdalei cu 60%. (Matthew Walker)' },
    { title: 'Temperatura Optimă', content: '18.3°C este temperatura ideală în dormitor. Corpul trebuie să își scadă temperatura centrală cu 1°C pentru a iniția somnul.' },
    { title: 'Regula 10-3-2-1', content: 'Fără cofeină cu 10h înainte de culcare, fără mâncare cu 3h înainte, fără muncă cu 2h înainte, fără ecrane cu 1h înainte.' },
    { title: 'Lumina de Dimineață', content: 'Expunerea la soare în primele 30-60 min după trezire setează ceasul circadian și ajută la eliberarea melatoninei cu 16 ore mai târziu. (Huberman Lab)' },
    { title: 'NSDR', content: 'Non-Sleep Deep Rest (sau Yoga Nidra) timp de 20 minute poate reface dopamina din ganglionii bazali și reduce oboseala la fel de eficient ca un pui de somn.' }
  ],
  nutritie: [
    { title: 'Glucoza și Energia', content: 'Ordinea mâncării contează: Fibre -> Proteine/Grăsimi -> Carbohidrați. Asta reduce vârful glicemic cu până la 73%. (Glucose Goddess)' },
    { title: 'Fereastra de Alimentare', content: 'Mâncatul într-o fereastră de 8-10 ore (Time Restricted Feeding) îmbunătățește sănătatea metabolică și activează genele longevității.' },
    { title: 'Hidratarea și Creierul', content: 'O deshidratare de doar 2% scade performanța cognitivă și memoria de scurtă durată. Apa cu puțină sare dimineața ajută la absorbție.' },
    { title: 'Microbiomul', content: '95% din serotonină este produsă în intestin. Consumul de alimente fermentate (kefir, murături) scade inflamația sistemică.' }
  ],
  focus: [
    { title: 'Deep Work', content: 'Capacitatea de concentrare profundă este rară. Multitasking-ul scade IQ-ul temporar cu 10 puncte, echivalentul unei nopți nedormite. (Cal Newport)' },
    { title: 'Regula celor 90 minute', content: 'Creierul funcționează în cicluri ultradiene de 90 minute. După un ciclu de focus intens, ai nevoie de 20 minute de odihnă.' },
    { title: 'Binaural Beats', content: 'Sunetele de 40Hz pot îmbunătăți concentrarea și memoria de lucru prin sincronizarea undelor cerebrale.' },
    { title: 'Dopamine Detox', content: 'Reducerea stimulilor ieftini (social media, zahăr) resetează receptorii de dopamină, făcând munca grea să pară mai ușoară.' }
  ],
  fericire: [
    { title: 'Paradoxul Hedonic', content: 'Fericirea derivată din confort dispare rapid. Fericirea derivată din sens și conexiune (Eudaimonia) este durabilă.' },
    { title: 'Recunoștința', content: 'Notarea a 3 lucruri pozitive zilnic timp de 21 de zile rescrie tiparele neuronale spre optimism. (Shawn Achor)' },
    { title: 'Conexiunea Socială', content: 'Singurătatea cronică este echivalentă cu fumatul a 15 țigări pe zi din punct de vedere al riscului de mortalitate.' },
    { title: 'Voluntariatul', content: '"Helper\'s High" este real. Actele de bunătate eliberează oxitocină și reduc stresul.' }
  ],
  longevitate: [
    { title: 'Hormesis', content: 'Stresul scurt și controlat (duș rece, saună, exerciții intense) activează mecanismele de reparare celulară și longevitate.' },
    { title: 'VO2 Max', content: 'Cel mai puternic predictor al longevității. Creșterea VO2 Max prin antrenamente cardio intense reduce riscul de mortalitate din toate cauzele.' },
    { title: 'Grip Strength', content: 'Forța de prindere a mâinii este direct corelată cu sănătatea sistemului nervos și longevitatea funcțională la bătrânețe.' }
  ],
  ergonomie: [
    { title: 'Regula 20-20-20', content: 'La fiecare 20 min, privește la 20 picioare (6m) distanță timp de 20 secunde pentru a preveni miopia și oboseala oculară.' },
    { title: 'Statul pe Scaun', content: 'Statul jos prelungit dezactivează enzima LPL (care arde grăsimi). Ridică-te 2 minute la fiecare oră.' },
    { title: 'Tech Neck', content: 'Capul aplecat la 60 de grade (uitatul în telefon) pune o presiune de 27 kg pe coloana cervicală.' }
  ]
};

// --- Componente UI ---
const Card = ({ children, className = "", onClick, noPadding }) => (
  <div onClick={onClick} className={`bg-white dark:bg-neutral-950 rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-800 ${noPadding ? '' : 'p-6'} ${className}`}>
    {children}
  </div>
);

const CircularProgress = ({ score, size = 24 }) => {
  const radius = size * 1.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let color = "text-rose-500";
  if(score > 40) color = "text-amber-500";
  if(score > 70) color = "text-blue-500";
  if(score >= 90) color = "text-emerald-500";

  return (
    <div className={`relative w-${size * 4}px h-${size * 4}px flex items-center justify-center`} style={{ width: size*4, height: size*4 }}>
      <svg className={`transform -rotate-90 w-full h-full`}>
        <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200 dark:text-neutral-800" />
        <circle 
          cx="50%" cy="50%" r={radius} 
          stroke="currentColor" strokeWidth="6" fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round"
          className={`${color} transition-all duration-1000 ease-out`} 
        />
      </svg>
    </div>
  );
};

// --- Structura Datelor ---
const getDefaultUserData = () => ({
  profile: { name: "", age: 0, bio: "Biohacker în devenire" },
  waterIntake: 0,
  waterGoal: 2500,
  waterDate: new Date().toDateString(),
  breaksTaken: 0,
  breaksTakenDate: new Date().toDateString(),
  mood: null,
  moodDate: new Date().toDateString(),
  dailyHabits: { sleep: false, nature: false, reading: false, gratitude: false, meditation: false },
  dailyHabitsDate: new Date().toDateString(),
  customHabits: [],
  challengeConfig: { name: "", reward: "", isConfigured: false },
  challengeProgress: Array(30).fill(false),
  journalHistory: [],
  darkMode: false,
  disclaimerAccepted: false
});

export default function App() {
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- User Data ---
  const [userData, setUserData] = useState(getDefaultUserData());
  const [dataLoading, setDataLoading] = useState(true);

  // --- App State ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotification, setShowNotification] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [score, setScore] = useState(0);

  // --- Local Inputs ---
  const [newHabit, setNewHabit] = useState({ what: "", when: "", where: "" });
  const [focusTime, setFocusTime] = useState(25 * 60); 
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [activeSound, setActiveSound] = useState(null); 
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [generatedMeal, setGeneratedMeal] = useState(null);
  const [isMealLoading, setIsMealLoading] = useState(false);
  
  // Mindfulness
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('Inspiră');
  const [breathingScale, setBreathingScale] = useState('scale-90'); 
  const [breathingDuration, setBreathingDuration] = useState('duration-[4000ms]'); 
  const [gratitudeLog, setGratitudeLog] = useState(["", "", ""]);

  // AI Chat
  const [generatedRoutine, setGeneratedRoutine] = useState(null);
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);
  const [routineMood, setRoutineMood] = useState('Obosit');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // --- Firebase Auth Listener (PENTRU PERSISTENȚĂ) ---
  useEffect(() => {
    // Verificăm dacă auth este inițializat corect
    if (!auth) {
       // Fallback pentru development local fără firebase configurat
       setTimeout(() => {
          setAuthLoading(false);
          setDataLoading(false);
       }, 1000);
       return;
    }
    // Acest listener detectează automat dacă userul este logat (cookies/localStorage intern Firebase)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); 
      setAuthLoading(false); 
      
      if (!user) {
        setUserData(getDefaultUserData());
        setDataLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Load User Data (când avem un user logat) ---
  useEffect(() => {
    if (!currentUser || !db) return;
    
    setDataLoading(true);
    const userDocRef = doc(db, 'users', currentUser.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const today = new Date().toDateString();
        const newData = { ...data };
        
        // Resetare zilnică automată a variabilelor care trebuie resetate
        if (data.waterDate !== today) { newData.waterIntake = 0; newData.waterDate = today; }
        if (data.dailyHabitsDate !== today) { newData.dailyHabits = getDefaultUserData().dailyHabits; newData.dailyHabitsDate = today; }
        if (data.moodDate !== today) { newData.mood = null; newData.moodDate = today; }
        if (data.breaksTakenDate !== today) { newData.breaksTaken = 0; newData.breaksTakenDate = today; }
        
        setUserData(newData);
        setDarkMode(data.darkMode || false);
        
        // Arătăm disclaimer doar dacă nu a fost acceptat
        setShowDisclaimer(!data.disclaimerAccepted);
      } else {
        // User nou - creare document inițial în baza de date
        const defaultData = getDefaultUserData();
        defaultData.profile.name = currentUser.displayName || 'Utilizator';
        setDoc(userDocRef, defaultData);
        setUserData(defaultData);
        setShowDisclaimer(true);
      }
      setDataLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // --- Save Data Helper ---
  const saveUserData = async (newData) => {
     if (currentUser && db) {
        try {
           await setDoc(doc(db, 'users', currentUser.uid), newData, { merge: true });
        } catch(e) { console.error("Eroare salvare:", e); }
     } else {
        setUserData(newData);
     }
  };

  // --- Logică Aplicație ---

  // Dark Mode Sync
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Focus Timer
  useEffect(() => {
    let interval;
    if (isFocusActive && focusTime > 0) {
        interval = setInterval(() => setFocusTime(t => t - 1), 1000);
    } else if (focusTime === 0) {
        setIsFocusActive(false);
        triggerNotification("Focus Complet", "Bravo! Ai terminat sesiunea.", "success");
        if (activeSound) setActiveSound(null);
    }
    return () => clearInterval(interval);
  }, [isFocusActive, focusTime]);

  // Breathing Animation
  useEffect(() => {
    let interval, phaseTimeout;
    if (isBreathing) {
      const runCycle = () => {
        setBreathingPhase('Inspiră'); setBreathingScale('scale-125'); setBreathingDuration('duration-[4000ms]');
        phaseTimeout = setTimeout(() => {
          setBreathingPhase('Ține'); setBreathingScale('scale-125'); setBreathingDuration('duration-[7000ms]');
          phaseTimeout = setTimeout(() => {
            setBreathingPhase('Expiră'); setBreathingScale('scale-90'); setBreathingDuration('duration-[8000ms]');
          }, 7000);
        }, 4000);
      };
      runCycle();
      interval = setInterval(runCycle, 19100);
    } else {
      setBreathingPhase('Start'); setBreathingScale('scale-90'); setBreathingDuration('duration-[4000ms]');
      clearTimeout(phaseTimeout);
    }
    return () => { clearInterval(interval); clearTimeout(phaseTimeout); };
  }, [isBreathing]);

  // Calcul Scor
  useEffect(() => {
    let s = 0;
    s += Math.min((userData.waterIntake / userData.waterGoal) * 20, 20);
    s += Math.min((userData.breaksTaken || 0) * 5, 20);
    Object.values(userData.dailyHabits).forEach(v => { if(v) s += 10; });
    if(userData.mood !== null) s += 10;
    setScore(Math.round(Math.min(s, 100)));
  }, [userData]);

  // Helper Functions
  const formatTime = (s) => `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;

  const triggerNotification = (title, message, type = 'info') => {
    setShowNotification({ title, message, type });
    setTimeout(() => setShowNotification(null), 5000);
  };

  const updateData = (field, value) => {
      const newData = { ...userData, [field]: value };
      setUserData(newData);
      saveUserData(newData);
  };

  const acceptDisclaimer = () => {
    updateData('disclaimerAccepted', true);
    setShowDisclaimer(false);
  };

  const addWater = (amount) => {
    const newData = { ...userData, waterIntake: userData.waterIntake + amount, waterDate: new Date().toDateString() };
    setUserData(newData);
    saveUserData(newData);
  };

  const setMoodValue = (val) => {
    const newData = { ...userData, mood: val, moodDate: new Date().toDateString() };
    setUserData(newData);
    saveUserData(newData);
  };

  const addCustomHabit = () => {
    if (newHabit.what && newHabit.when) {
      const newHabits = [...userData.customHabits, { ...newHabit, id: Date.now(), completed: false }];
      const newData = { ...userData, customHabits: newHabits };
      setUserData(newData);
      saveUserData(newData);
      setNewHabit({ what: "", when: "", where: "" });
      triggerNotification("Protocol Salvat", "Sincronizat în cloud!", "success");
    }
  };

  const removeHabit = (id) => {
    const newHabits = userData.customHabits.filter(h => h.id !== id);
    const newData = { ...userData, customHabits: newHabits };
    setUserData(newData);
    saveUserData(newData);
  };

  const updateChallengeConfig = (config) => {
    updateData('challengeConfig', config);
  };

  const updateChallengeProgress = (progress) => {
    updateData('challengeProgress', progress);
  };

  const saveJournalEntry = () => {
    if (gratitudeLog.some(entry => entry.trim() !== "")) {
        const newEntry = {
            id: Date.now(),
            date: new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
            entries: gratitudeLog.filter(e => e.trim() !== "")
        };
        // Folosim istoricul existent
        const currentHistory = userData.journalHistory || [];
        const newHistory = [newEntry, ...currentHistory];
        
        updateData('journalHistory', newHistory);
        setGratitudeLog(["", "", ""]); 
        triggerNotification("Jurnal Actualizat", "Salvat în cloud!", "success");
    } else {
        triggerNotification("Jurnal Gol", "Scrie măcar un lucru pentru care ești recunoscător.", "info");
    }
  };

  const shareApp = () => {
    navigator.clipboard.writeText("Încearcă BioSync Pro! Am început să mă simt excelent.");
    triggerNotification("Link Copiat", "Trimite-l unui prieten care are nevoie.", "success");
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    updateData('darkMode', newDarkMode);
  };

  const toggleHabit = (id) => {
    const newHabits = { ...userData.dailyHabits, [id]: !userData.dailyHabits[id] };
    const newData = { ...userData, dailyHabits: newHabits, dailyHabitsDate: new Date().toDateString() };
    setUserData(newData);
    saveUserData(newData);
  };

  // Auth Actions
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!auth) return;
    setAuthError('');
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthError('Email sau parolă incorectă.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!auth) return;
    setAuthError('');
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');
    const age = parseInt(formData.get('age')) || 30;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      const initialData = getDefaultUserData();
      initialData.profile = { name, age, bio: "Biohacker în devenire" };
      initialData.waterGoal = age > 55 ? 2200 : 2500;
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, initialData);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') setAuthError('Email deja folosit.');
      else if (error.code === 'auth/weak-password') setAuthError('Parolă prea slabă.');
      else setAuthError('Eroare la înregistrare.');
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      // Reset state local
      setUserData(getDefaultUserData());
      setScore(0);
      triggerNotification("Deconectat", "Ne vedem curând!", "info");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // AI & Generators
  const generateMealPlan = async () => {
      if(!ingredientsInput.trim()) return;
      setIsMealLoading(true);
      const prompt = `Am în frigider: ${ingredientsInput}. Generează o rețetă sănătoasă, rapidă, bogată în nutrienți pentru creier. Format scurt.`;
      const result = await callGeminiAPI(prompt, "Ești un chef nutriționist de top.");
      setGeneratedMeal(result);
      setIsMealLoading(false);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: msg }]);
    setIsTyping(true);
    const response = await callGeminiAPI(msg, `Ești BioSync AI. Vorbești cu ${userData.profile?.name || 'utilizatorul'}. Fii empatic, înțelept și pozitiv.`);
    setChatHistory(prev => [...prev, { role: 'ai', content: response }]);
    setIsTyping(false);
  };

  const generateRoutine = async () => {
    setIsGeneratingRoutine(true);
    const prompt = `Generează o rutină de 3 minute pentru: ${routineMood}. Format simplu.`;
    const response = await callGeminiAPI(prompt);
    setGeneratedRoutine(response);
    setIsGeneratingRoutine(false);
  };

  // --- Render Functions (Definite INTERN în componentă) ---

  const renderAuthScreen = () => (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba')] bg-cover opacity-10"></div>
      <div className="max-w-md w-full bg-neutral-900 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 animate-fade-in relative z-10 text-white">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/50 mb-6 animate-pulse">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">BioSync Pro</h1>
          <p className="text-neutral-400">Arhitectura vieții tale ideale.</p>
        </div>
        <div className="flex bg-neutral-800 rounded-xl p-1 mb-6">
          <button onClick={() => { setAuthMode('login'); setAuthError(''); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${authMode === 'login' ? 'bg-indigo-600 text-white' : 'text-neutral-400'}`}>Autentificare</button>
          <button onClick={() => { setAuthMode('register'); setAuthError(''); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${authMode === 'register' ? 'bg-indigo-600 text-white' : 'text-neutral-400'}`}>Cont Nou</button>
        </div>
        {authError && <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-sm"><AlertCircle className="w-4 h-4"/>{authError}</div>}
        <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {authMode === 'register' && (
            <>
              <div><label className="block text-sm text-neutral-300 mb-1">Nume</label><input required name="name" className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white"/></div>
              <div><label className="block text-sm text-neutral-300 mb-1">Vârsta</label><input required name="age" type="number" className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white"/></div>
            </>
          )}
          <div><label className="block text-sm text-neutral-300 mb-1">Email</label><input required name="email" type="email" className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white"/></div>
          <div><label className="block text-sm text-neutral-300 mb-1">Parolă</label>
            <div className="relative">
                <input required name="password" type={showPassword ? "text" : "password"} className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-neutral-400">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl mt-4">{authMode === 'login' ? 'Intră' : 'Creează'}</button>
        </form>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in pb-24 md:pb-0">
      {activeOverlay && (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-neutral-900 border border-white/10 rounded-3xl p-8 relative">
                  <button onClick={() => setActiveOverlay(null)} className="absolute top-4 right-4 p-2 bg-neutral-800 rounded-full text-white"><X className="w-5 h-5"/></button>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      {activeOverlay === 'morning' ? <Sun className="text-amber-400"/> : <Moon className="text-indigo-400"/>}
                      {activeOverlay === 'morning' ? 'Start Zi' : 'Închidere Zi'}
                  </h2>
                  <div className="space-y-4">
                      {(activeOverlay === 'morning' ? ['Bea 500ml apă', 'Lumină naturală', 'Patul făcut', 'Top 3 sarcini'] : ['Fără ecrane', 'Haine pregătite', 'Jurnal', 'Alarmă setată']).map((t, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-750" onClick={(e) => { e.currentTarget.classList.toggle('opacity-50'); e.currentTarget.querySelector('.check').classList.toggle('hidden'); }}>
                              <div className="w-6 h-6 border-2 border-white/30 rounded-full flex items-center justify-center"><CheckCircle className="check w-4 h-4 text-emerald-400 hidden"/></div>
                              <span className="text-white text-lg">{t}</span>
                          </div>
                      ))}
                  </div>
                  <button onClick={() => { setActiveOverlay(null); triggerNotification("Bravo!", "Protocol complet.", "success"); }} className="w-full mt-8 bg-white text-black font-bold py-3 rounded-xl">Finalizează</button>
              </div>
          </div>
      )}
      <div className="relative rounded-3xl overflow-hidden bg-black text-white shadow-2xl border border-neutral-800 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
                {['😞', '😐', '🙂', '🤩'].map((m, i) => (
                    <button key={i} onClick={() => setMoodValue(i)} className={`text-2xl hover:scale-125 transition ${userData.mood === i ? 'scale-125' : 'opacity-50'}`}>{m}</button>
                ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Salut, {userData.profile?.name || 'Oaspete'}!</h1>
            <div className="flex gap-3 mt-4 mb-6">
                <button onClick={() => setActiveOverlay('morning')} className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Sun className="w-4 h-4"/> Start</button>
                <button onClick={() => setActiveOverlay('evening')} className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Moon className="w-4 h-4"/> Stop</button>
            </div>
            <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10"><Droplets className="w-4 h-4 text-blue-400"/><span className="font-bold">{userData.waterIntake} / {userData.waterGoal} ml</span></div>
                <div className="flex gap-2">
                  {[250, 500].map(amt => (
                    <button key={amt} onClick={() => addWater(amt)} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-sm font-bold">+{amt}ml</button>
                  ))}
                </div>
            </div>
         </div>
         <CircularProgress score={score} size={32} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card className="border-l-4 border-l-indigo-500 bg-slate-50 dark:bg-black dark:border-neutral-800 p-6">
                <h3 className="font-bold text-slate-800 dark:text-neutral-100 mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-indigo-500"/> Laborator Obiceiuri</h3>
                <div className="space-y-4">
                    <input value={newHabit.what} onChange={e => setNewHabit({...newHabit, what: e.target.value})} placeholder="Voi face... (ex: 10 flotări)" className="w-full bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-3 dark:text-white"/>
                    <div className="flex gap-4">
                        <input value={newHabit.when} onChange={e => setNewHabit({...newHabit, when: e.target.value})} placeholder="Când... (ex: după cafea)" className="flex-1 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-3 dark:text-white"/>
                        <button onClick={addCustomHabit} className="bg-indigo-600 text-white px-6 rounded-xl font-bold"><Plus className="w-5 h-5"/></button>
                    </div>
                </div>
                {userData.customHabits.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {userData.customHabits.map(habit => (
                            <div key={habit.id} className="flex justify-between items-center p-3 bg-white dark:bg-neutral-900 rounded-xl border dark:border-neutral-800">
                                <span className="dark:text-white font-medium">{habit.what} <span className="text-xs text-slate-400">@ {habit.when}</span></span>
                                <button onClick={() => removeHabit(habit.id)}><Trash2 className="w-4 h-4 text-red-400"/></button>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[{ id: 'sleep', label: 'Somn 7h+', icon: Moon, color: 'indigo' }, { id: 'nature', label: 'Natură', icon: Sun, color: 'amber' }, { id: 'reading', label: 'Citit', icon: BookOpen, color: 'emerald' }, { id: 'alcohol', label: 'Fără Alcool', icon: Wine, color: 'rose' }].map(item => (
                    <div key={item.id} onClick={() => toggleHabit(item.id)} className={`p-4 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all ${userData.dailyHabits[item.id] ? `bg-${item.color}-50 dark:bg-neutral-900 border-${item.color}-200` : 'bg-white dark:bg-neutral-950 border-slate-100 dark:border-neutral-800'}`}>
                        <item.icon className={`w-6 h-6 text-${item.color}-500`}/>
                        <span className="font-bold flex-1 dark:text-white">{item.label}</span>
                        {userData.dailyHabits[item.id] && <CheckCircle className={`w-6 h-6 text-${item.color}-500`}/>}
                    </div>
                 ))}
            </div>
        </div>
        <Card className="bg-gradient-to-b from-indigo-600 to-indigo-900 text-white border-none p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-yellow-300"/> AI Coach</h3>
            {!generatedRoutine ? (
                <div className="space-y-3">
                    <select onChange={e => setRoutineMood(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white dark:text-white"><option value="Obosit" className="text-black">Obosit</option><option value="Stresat" className="text-black">Stresat</option></select>
                    <button onClick={generateRoutine} className="w-full bg-white text-indigo-700 font-bold py-3 rounded-xl">{isGeneratingRoutine ? '...' : 'Generează'}</button>
                </div>
            ) : (
                <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-sm mb-4 whitespace-pre-line">{generatedRoutine}</p>
                    <button onClick={() => setGeneratedRoutine(null)} className="text-xs underline">Închide</button>
                </div>
            )}
        </Card>
      </div>
    </div>
  );

  const renderFocus = () => (
      <div className="max-w-xl mx-auto text-center space-y-8 animate-fade-in py-10">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Zona de Focus Zen</h2>
          <Card className="p-12 bg-neutral-900 border-neutral-800 relative overflow-hidden">
              <div className="text-6xl font-mono font-bold text-white mb-8">{formatTime(focusTime)}</div>
              <div className="flex justify-center gap-4 mb-8">
                  <button onClick={() => setIsFocusActive(!isFocusActive)} className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
                      {isFocusActive ? <Pause className="w-8 h-8 text-white"/> : <Play className="w-8 h-8 text-white ml-1"/>}
                  </button>
                  <button onClick={() => { setIsFocusActive(false); setFocusTime(25*60); }} className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center"><RotateCcw className="w-6 h-6 text-white"/></button>
              </div>
              <div className="flex justify-center gap-4">
                  {['rain', 'forest', 'white'].map(sound => (
                      <button key={sound} onClick={() => setActiveSound(sound === activeSound ? null : sound)} className={`px-4 py-2 rounded-full border text-sm text-white ${activeSound === sound ? 'bg-indigo-600 border-indigo-500' : 'border-neutral-700'}`}>
                          {sound}
                      </button>
                  ))}
              </div>
          </Card>
      </div>
  );

  const renderNutrition = () => (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-center dark:text-white">Nutriție & Energie</h1>
          <Card className="bg-emerald-900 text-white border-none p-8">
              <h2 className="text-2xl font-bold mb-4 flex gap-2"><Utensils/> Chef AI</h2>
              <div className="flex gap-2">
                  <input value={ingredientsInput} onChange={e => setIngredientsInput(e.target.value)} placeholder="Ce ingrediente ai?" className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white"/>
                  <button onClick={generateMealPlan} className="bg-white text-emerald-900 px-6 font-bold rounded-xl">{isMealLoading ? '...' : 'Generează'}</button>
              </div>
          </Card>
          {generatedMeal && <Card className="border-l-4 border-emerald-500"><p className="whitespace-pre-line dark:text-white">{generatedMeal}</p></Card>}
      </div>
  );

  const renderChallenges = () => (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-center dark:text-white">Provocarea 30 Zile</h1>
          {!userData.challengeConfig.isConfigured ? (
              <div className="grid md:grid-cols-2 gap-6">
                  <Card className="dark:bg-neutral-900 p-6">
                      <h3 className="font-bold dark:text-white mb-4 flex gap-2"><Medal className="text-indigo-500"/> Sugestii</h3>
                      {[{n:"Fără Zahăr", r:"Ten curat"}, {n:"Dușuri Reci", r:"Energie"}, {n:"Alergare", r:"Condiție"}].map((s, i) => (
                          <div key={i} onClick={() => updateChallengeConfig({name:s.n, reward:s.r, isConfigured:false})} className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl mb-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-neutral-700 flex justify-between dark:text-white">
                              <span>{s.n}</span> <span className="text-xs opacity-60">{s.r}</span>
                          </div>
                      ))}
                  </Card>
                  <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none p-8">
                      <h2 className="text-xl font-bold mb-4 flex gap-2"><Flame/> Configurează</h2>
                      <input value={userData.challengeConfig.name} onChange={e => updateChallengeConfig({...userData.challengeConfig, name: e.target.value})} placeholder="Nume (ex: Fără Zahăr)" className="w-full bg-white/10 p-3 rounded-xl mb-3 text-white placeholder-white/50"/>
                      <input value={userData.challengeConfig.reward} onChange={e => updateChallengeConfig({...userData.challengeConfig, reward: e.target.value})} placeholder="Recompensă" className="w-full bg-white/10 p-3 rounded-xl mb-3 text-white placeholder-white/50"/>
                      <button onClick={() => updateChallengeConfig({...userData.challengeConfig, isConfigured: true})} className="w-full bg-orange-500 text-white px-8 py-3 rounded-xl font-bold mt-2">Start Aventură</button>
                  </Card>
              </div>
          ) : (
              <Card className="dark:bg-neutral-900 p-8">
                  <div className="flex justify-between mb-6 dark:text-white border-b dark:border-neutral-800 pb-4">
                      <div>
                          <h2 className="text-2xl font-bold flex gap-2"><Flame className="text-orange-500"/> {userData.challengeConfig.name}</h2>
                          <p className="text-sm opacity-60 flex gap-1"><Gift size={14}/> Recompensă: {userData.challengeConfig.reward}</p>
                      </div>
                      <button onClick={() => updateChallengeConfig({...userData.challengeConfig, isConfigured: false})}><Edit3 className="w-5 h-5"/></button>
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3">
                      {userData.challengeProgress.map((done, idx) => (
                          <button key={idx} onClick={() => {
                              const np = [...userData.challengeProgress]; np[idx] = !np[idx];
                              updateChallengeProgress(np);
                              if(np[idx] && (idx+1)%7===0) triggerNotification("Bravo!", `Săptămâna ${Math.ceil((idx+1)/7)} completă!`, "success");
                          }} className={`aspect-square rounded-lg font-bold transition-all ${done ? 'bg-rose-600 text-white scale-105 shadow-lg shadow-rose-500/30' : 'bg-slate-100 dark:bg-neutral-800 dark:text-white hover:bg-slate-200 dark:hover:bg-neutral-700'}`}>{idx+1}</button>
                      ))}
                  </div>
                  <div className="w-full h-1 bg-neutral-800 mt-8 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-1000" style={{width: `${(userData.challengeProgress.filter(Boolean).length / 30) * 100}%`}}></div>
                  </div>
              </Card>
          )}
      </div>
  );

  const renderMindfulness = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-center dark:text-white">Sanctuarul Minții</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-b from-cyan-50 to-blue-50 dark:from-neutral-900 dark:to-black">
                <div className={`w-48 h-48 rounded-full bg-cyan-500 flex items-center justify-center text-white text-2xl font-bold transition-all duration-1000 ${isBreathing ? breathingScale : ''}`}>{breathingPhase}</div>
                <button onClick={() => setIsBreathing(!isBreathing)} className="mt-8 bg-cyan-600 text-white px-8 py-3 rounded-xl font-bold">{isBreathing ? 'Stop' : 'Start'}</button>
            </Card>
            <Card className="dark:bg-neutral-900">
                <h2 className="text-xl font-bold mb-4 dark:text-white flex gap-2"><Heart className="text-rose-500"/> Jurnal</h2>
                <div className="space-y-3">
                    {gratitudeLog.map((val, idx) => (
                        <div key={idx}>
                             <input value={val} onChange={e => {
                                const nl = [...gratitudeLog]; nl[idx] = e.target.value; setGratitudeLog(nl);
                            }} placeholder={`${idx+1}. Sunt recunoscător pentru...`} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 dark:text-white"/>
                            {val==="" && <div className="flex gap-2 mt-1 overflow-x-auto scrollbar-hide">
                                {['Cafea', 'Soare', 'Sănătate'].map(s => <button key={s} onClick={()=>{const nl=[...gratitudeLog];nl[idx]=s;setGratitudeLog(nl)}} className="text-xs bg-slate-100 dark:bg-neutral-800 px-2 py-1 rounded dark:text-white hover:bg-slate-200">{s}</button>)}
                            </div>}
                        </div>
                    ))}
                </div>
                <button onClick={saveJournalEntry} className="w-full mt-4 bg-rose-500 text-white py-3 rounded-xl font-bold">Salvează</button>
            </Card>
        </div>
        <div className="space-y-4">
             <h3 className="text-xl font-bold dark:text-white flex gap-2"><Book/> Istoric</h3>
            {(userData.journalHistory || []).map(entry => (
                <Card key={entry.id} className="dark:bg-neutral-900 dark:text-white">
                    <p className="font-bold text-indigo-500 flex justify-between">{entry.date} <span className="text-xs text-slate-400">{entry.time}</span></p>
                    <ul className="list-disc ml-5">{entry.entries.map((t,i) => <li key={i}>{typeof t === 'string' ? t : JSON.stringify(t)}</li>)}</ul>
                </Card>
            ))}
        </div>
    </div>
  );

  const renderKnowledge = () => (
      <div className="space-y-6 animate-fade-in">
          <h1 className="text-3xl font-bold text-center dark:text-white mb-8">Biblioteca</h1>
          {Object.entries(knowledgeBase).map(([cat, items]) => (
              <div key={cat}>
                  <h3 className="text-xl font-bold capitalize mb-4 dark:text-white">{cat}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item, i) => (
                          <Card key={i} className="dark:bg-neutral-900 dark:text-white">
                              <h4 className="font-bold mb-2">{item.title}</h4>
                              <p className="text-sm opacity-80">{item.content}</p>
                          </Card>
                      ))}
                  </div>
              </div>
          ))}
      </div>
  );

  const renderProfile = () => (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
          <Card className="text-center p-8 dark:bg-neutral-900 dark:text-white">
              <div className="w-24 h-24 bg-slate-200 dark:bg-neutral-800 rounded-full mx-auto mb-4 flex items-center justify-center"><User className="w-10 h-10"/></div>
              <h2 className="text-2xl font-bold">{userData.profile.name}</h2>
              <p className="text-sm opacity-70">{currentUser?.email}</p>
              <div className="grid grid-cols-3 gap-4 mt-8 border-t pt-8 dark:border-neutral-800">
                  <div><div className="font-bold text-xl">{score}</div><div className="text-xs uppercase">Scor</div></div>
                  <div><div className="font-bold text-xl">{userData.customHabits.length}</div><div className="text-xs uppercase">Habits</div></div>
                  <div><div className="font-bold text-xl">{userData.challengeProgress.filter(Boolean).length}</div><div className="text-xs uppercase">Zile</div></div>
              </div>
          </Card>
          <Card className="dark:bg-neutral-900 dark:text-white">
              <div className="flex justify-between items-center p-2">
                  <span>Mod Întunecat</span>
                  <button onClick={toggleDarkMode} className={`w-12 h-6 rounded-full relative ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${darkMode ? 'left-7' : 'left-1'}`}/>
                  </button>
              </div>
              <button onClick={handleLogout} className="w-full text-left text-red-500 font-bold p-2 mt-4 flex items-center gap-2"><LogOut className="w-4 h-4"/> Deconectare</button>
          </Card>
      </div>
  );

  const renderAICoach = () => (
      <div className="h-[85vh] flex flex-col bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
          <div className="bg-indigo-600 p-6 text-white flex items-center gap-4"><Zap/> <h2 className="font-bold">BioSync Mentor</h2></div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatHistory.map((m, i) => (
                  <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                      <div className={`p-4 rounded-2xl max-w-[80%] ${m.role==='user'?'bg-indigo-600 text-white':'bg-slate-100 dark:bg-neutral-800 dark:text-white'}`}>{m.content}</div>
                  </div>
              ))}
              {isTyping && <div className="text-xs opacity-50">...</div>}
              <div ref={chatEndRef}/>
          </div>
          <div className="p-4 border-t dark:border-neutral-800 flex gap-2">
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleSendMessage()} className="flex-1 bg-slate-100 dark:bg-neutral-800 p-3 rounded-xl dark:text-white" placeholder="Întreabă ceva..."/>
              <button onClick={handleSendMessage} className="bg-indigo-600 text-white p-3 rounded-xl"><Send/></button>
          </div>
      </div>
  );

  // --- Main Render Switch ---
  if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader className="w-8 h-8 text-white animate-spin"/></div>;
  if (!currentUser) return renderAuthScreen();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white flex flex-col md:flex-row transition-colors">
       {showDisclaimer && (
           <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-8">
               <Card className="max-w-lg bg-white dark:bg-neutral-900 p-8">
                   <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
                   <p className="mb-6">Această aplicație este educațională. Consultă un medic.</p>
                   <button onClick={acceptDisclaimer} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Am înțeles</button>
               </Card>
           </div>
       )}
       
       {/* Desktop Sidebar */}
       <nav className="hidden md:flex flex-col w-64 border-r dark:border-neutral-800 p-6 h-screen fixed bg-white dark:bg-black z-50">
          <div className="flex items-center gap-3 text-xl font-bold text-indigo-600 mb-8"><Activity/> BioSync</div>
          <div className="space-y-2">
             {[
                 {id:'dashboard', icon:Activity, label:'Dashboard'},
                 {id:'focus', icon:Timer, label:'Focus'},
                 {id:'nutrition', icon:Utensils, label:'Nutriție'},
                 {id:'challenges', icon:Flame, label:'Provocări'},
                 {id:'mindfulness', icon:Smile, label:'Mindfulness'},
                 {id:'knowledge', icon:BookOpen, label:'Bibliotecă'},
                 {id:'profile', icon:User, label:'Profil'},
                 {id:'ai-coach', icon:Zap, label:'AI Coach'}
             ].map(item => (
                 <button key={item.id} onClick={()=>setActiveTab(item.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab===item.id ? 'bg-indigo-50 dark:bg-neutral-900 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-neutral-900'}`}>
                     <item.icon className="w-5 h-5"/> {item.label}
                 </button>
             ))}
          </div>
       </nav>

       {/* Mobile Bottom Bar */}
       <nav className="md:hidden fixed bottom-0 w-full bg-white/90 dark:bg-black/90 backdrop-blur border-t dark:border-neutral-800 z-50 flex justify-around p-4">
          {[{id:'dashboard', icon:Activity}, {id:'focus', icon:Timer}, {id:'nutrition', icon:Utensils}, {id:'mindfulness', icon:Smile}, {id:'ai-coach', icon:Zap}].map(item => (
              <button key={item.id} onClick={()=>setActiveTab(item.id)} className={`${activeTab===item.id ? 'text-indigo-600' : 'text-slate-400'}`}><item.icon/></button>
          ))}
          <button onClick={()=>setActiveTab('profile')} className={`${activeTab==='profile' ? 'text-indigo-600' : 'text-slate-400'}`}><User/></button>
       </nav>

       <main className="flex-1 md:ml-64 p-6 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto w-full">
           {activeTab === 'dashboard' && renderDashboard()}
           {activeTab === 'focus' && renderFocus()}
           {activeTab === 'nutrition' && renderNutrition()}
           {activeTab === 'challenges' && renderChallenges()}
           {activeTab === 'mindfulness' && renderMindfulness()}
           {activeTab === 'profile' && renderProfile()}
           {activeTab === 'knowledge' && renderKnowledge()}
           {activeTab === 'ai-coach' && renderAICoach()}
       </main>

       {showNotification && (
           <div className="fixed top-6 right-6 bg-white dark:bg-neutral-900 border-l-4 border-indigo-500 shadow-2xl p-4 rounded-xl z-[100] animate-fade-in">
               <h4 className="font-bold">{showNotification.title}</h4>
               <p className="text-sm opacity-80">{showNotification.message}</p>
           </div>
       )}
    </div>
  );
}