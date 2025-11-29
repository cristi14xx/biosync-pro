import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Brain, 
  Info, 
  CheckCircle, 
  Sun, 
  Smile, 
  Zap, 
  Send, 
  Sparkles, 
  Loader, 
  Moon, 
  BookOpen, 
  Leaf, 
  Wine, 
  Target, 
  Plus, 
  ArrowRight, 
  User, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  Trophy,
  Wind,
  Heart,
  Share2,
  Camera,
  Trash2,
  Settings,
  Droplets,
  Calendar,
  Clock,
  Book,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Utensils,
  Flame,
  X,
  Edit3,
  Gift,
  Medal
} from 'lucide-react';

// --- API Key Configuration (uses environment variable) ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

// --- Funcție Helper pentru Gemini API ---
const callGeminiAPI = async (prompt, systemInstruction = "") => {
  if (!apiKey) return "⚠️ Cheia API lipsește. Configurează VITE_GEMINI_API_KEY.";
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

// --- Baza de Date Studii ---
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

export default function App() {
  // --- User Profile State ---
  const [userProfile, setUserProfile] = useState(null); 
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

  // --- App State ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotification, setShowNotification] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);
  
  // --- Dark Mode State ---
  const [darkMode, setDarkMode] = useState(() => {
    try {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    } catch { return false; }
  });

  // Obiective & Scor
  const [score, setScore] = useState(0);
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2500);
  const [lastBreak, setLastBreak] = useState(Date.now());
  const [breaksTaken, setBreaksTaken] = useState(0); 
  const [mood, setMood] = useState(null); 

  // Protocoale (Habits)
  const [dailyHabits, setDailyHabits] = useState({
    sleep: false, nature: false, reading: false, gratitude: false, meditation: false 
  });

  const [customHabits, setCustomHabits] = useState([]);
  const [newHabit, setNewHabit] = useState({ what: "", when: "", where: "" });

  // Focus Zone
  const [focusTime, setFocusTime] = useState(25 * 60); 
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [activeSound, setActiveSound] = useState(null); 

  // Nutrition AI
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [generatedMeal, setGeneratedMeal] = useState(null);
  const [isMealLoading, setIsMealLoading] = useState(false);

  // --- Stare Provocări ---
  const [challengeConfig, setChallengeConfig] = useState({
    name: "",
    reward: "",
    isConfigured: false
  });
  const [challengeProgress, setChallengeProgress] = useState(Array(30).fill(false));

  // Mindfulness State
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('Inspiră');
  const [breathingScale, setBreathingScale] = useState('scale-90'); 
  const [breathingDuration, setBreathingDuration] = useState('duration-[4000ms]'); 
  const [gratitudeLog, setGratitudeLog] = useState(["", "", ""]);
  
  const [journalHistory, setJournalHistory] = useState(() => {
    try {
        const saved = localStorage.getItem('journalHistory');
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // AI & Chat
  const [generatedRoutine, setGeneratedRoutine] = useState(null);
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);
  const [routineMood, setRoutineMood] = useState('Obosit');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // --- Effects ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('journalHistory', JSON.stringify(journalHistory));
  }, [journalHistory]);

  useEffect(() => {
    let interval;
    if (isFocusActive && focusTime > 0) {
        interval = setInterval(() => {
            setFocusTime(t => t - 1);
        }, 1000);
    } else if (focusTime === 0) {
        setIsFocusActive(false);
        triggerNotification("Sesiune Completă", "Ai terminat sesiunea de focus!", "success");
        if (activeSound) setActiveSound(null); 
    }
    return () => clearInterval(interval);
  }, [isFocusActive, focusTime]);

  // Breathing Logic
  useEffect(() => {
    let interval;
    let phaseTimeout;

    if (isBreathing) {
      const runCycle = () => {
        setBreathingPhase('Inspiră');
        setBreathingScale('scale-125');
        setBreathingDuration('duration-[4000ms]');

        phaseTimeout = setTimeout(() => {
          setBreathingPhase('Ține');
          setBreathingScale('scale-125');
          setBreathingDuration('duration-[7000ms]'); 

          phaseTimeout = setTimeout(() => {
            setBreathingPhase('Expiră');
            setBreathingScale('scale-90');
            setBreathingDuration('duration-[8000ms]');
          }, 7000); 
        }, 4000); 
      };

      runCycle(); 
      interval = setInterval(runCycle, 19100); 

    } else {
      setBreathingPhase('Start');
      setBreathingScale('scale-90');
      setBreathingDuration('duration-[4000ms]');
      clearTimeout(phaseTimeout);
    }
    return () => {
      clearInterval(interval);
      clearTimeout(phaseTimeout);
    };
  }, [isBreathing]);

  // Scor Logic
  useEffect(() => {
    let newScore = 0;
    newScore += Math.min((waterIntake / waterGoal) * 20, 20);
    newScore += Math.min(breaksTaken * 5, 20);
    Object.values(dailyHabits).forEach(val => { if(val) newScore += 10; });
    setScore(Math.round(Math.min(newScore, 100)));
  }, [waterIntake, waterGoal, breaksTaken, dailyHabits]);

  // --- Helpers ---
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const triggerNotification = (title, message, type = 'info') => {
    setShowNotification({ title, message, type });
    setTimeout(() => setShowNotification(null), 5000);
  };

  const toggleHabit = (key) => setDailyHabits(prev => ({ ...prev, [key]: !prev[key] }));

  const addCustomHabit = () => {
    if (newHabit.what && newHabit.when) {
      setCustomHabits([...customHabits, { ...newHabit, id: Date.now(), completed: false }]);
      setNewHabit({ what: "", when: "", where: "" });
      triggerNotification("Protocol Salvat", "Poți vedea lista completă în Profil.", "success");
    }
  };

  const removeHabit = (id) => {
    setCustomHabits(customHabits.filter(h => h.id !== id));
  };

  const saveJournalEntry = () => {
    if (gratitudeLog.some(entry => entry.trim() !== "")) {
        const newEntry = {
            id: Date.now(),
            date: new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
            entries: gratitudeLog.filter(e => e.trim() !== "")
        };
        setJournalHistory([newEntry, ...journalHistory]);
        setGratitudeLog(["", "", ""]); 
        triggerNotification("Jurnal Actualizat", "Amintirea a fost salvată în istoric.", "success");
    } else {
        triggerNotification("Jurnal Gol", "Scrie măcar un lucru pentru care ești recunoscător.", "info");
    }
  };

  const shareApp = () => {
    navigator.clipboard.writeText("Încearcă BioSync Pro! Am început să mă simt excelent.");
    triggerNotification("Link Copiat", "Trimite-l unui prieten care are nevoie.", "success");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const age = parseInt(formData.get('age'));
    let calculatedWater = 2500;
    if (age > 55) calculatedWater = 2200;
    setUserProfile({ name, age, bio: "Biohacker în devenire" });
    setWaterGoal(calculatedWater);
    setShowOnboarding(false);
    triggerNotification(`Bun venit acasă, ${name}!`, "Să începem transformarea.", "success");
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
    const response = await callGeminiAPI(msg, `Ești BioSync AI. Vorbești cu ${userProfile?.name}. Fii empatic, înțelept și pozitiv.`);
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

  // --- Views ---

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in pb-24 md:pb-0">
      {/* Protocol Overlay */}
      {activeOverlay && (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="max-w-md w-full bg-neutral-900 border border-white/10 rounded-3xl p-8 relative">
                  <button onClick={() => setActiveOverlay(null)} className="absolute top-4 right-4 p-2 bg-neutral-800 rounded-full text-white hover:bg-neutral-700"><X className="w-5 h-5"/></button>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      {activeOverlay === 'morning' ? <Sun className="text-amber-400"/> : <Moon className="text-indigo-400"/>}
                      {activeOverlay === 'morning' ? 'Start Zi' : 'Închidere Zi'}
                  </h2>
                  <div className="space-y-4">
                      {(activeOverlay === 'morning' 
                        ? ['Bea 500ml apă', 'Vezi lumina naturală', 'Fă patul', 'Planifică top 3 sarcini'] 
                        : ['Închide ecranele', 'Pregătește hainele', 'Jurnal recunoștință', 'Setează alarma']
                      ).map((task, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-4 bg-neutral-800 rounded-xl cursor-pointer hover:bg-neutral-750 transition group" onClick={(e) => {
                              e.currentTarget.classList.toggle('opacity-50');
                              e.currentTarget.querySelector('.check-icon').classList.toggle('hidden');
                          }}>
                              <div className="w-6 h-6 border-2 border-white/30 rounded-full flex items-center justify-center">
                                  <CheckCircle className="check-icon w-4 h-4 text-emerald-400 hidden"/>
                              </div>
                              <span className="text-white text-lg">{task}</span>
                          </div>
                      ))}
                  </div>
                  <button onClick={() => { setActiveOverlay(null); triggerNotification("Protocol Complet", "Excelent!", "success"); }} className="w-full mt-8 bg-white text-black font-bold py-3 rounded-xl hover:bg-neutral-200">Finalizează</button>
              </div>
          </div>
      )}

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-black text-white shadow-2xl border border-neutral-800">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600 rounded-full blur-[80px] opacity-10 translate-y-1/2 -translate-x-1/2"></div>
         
         <div className="relative z-10 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <div className="flex items-center gap-4 mb-4">
                    {['😞', '😐', '🙂', '🤩'].map((m, idx) => (
                        <button key={idx} onClick={() => setMood(idx)} className={`text-2xl hover:scale-125 transition ${mood === idx ? 'scale-125 drop-shadow-glow' : 'opacity-50'}`}>{m}</button>
                    ))}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Salut, {userProfile?.name || 'Oaspete'}!</h1>
                
                <div className="flex gap-3 mt-4 mb-6">
                    <button onClick={() => setActiveOverlay('morning')} className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-amber-500/30 transition">
                        <Sun className="w-4 h-4"/> Start Zi
                    </button>
                    <button onClick={() => setActiveOverlay('evening')} className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-500/30 transition">
                        <Moon className="w-4 h-4"/> Închidere
                    </button>
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                        <Droplets className="w-4 h-4 text-blue-400"/>
                        <span className="font-bold text-neutral-200">{waterIntake} / {waterGoal} ml</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                        <Zap className="w-4 h-4 text-amber-400"/>
                        <span className="font-bold text-neutral-200">{score} / 100 Puncte</span>
                    </div>
                </div>
            </div>
            <div className="relative">
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-white">{score}</span>
                <CircularProgress score={score} size={32} />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-neutral-100 text-xl flex items-center gap-2">
                <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400"/> Laborator de Obiceiuri
            </h3>
            
            <Card className="border-l-4 border-l-indigo-500 bg-slate-50 dark:bg-black dark:border-neutral-800 p-6">
                <div className="space-y-5">
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-neutral-500 uppercase mb-2 block tracking-wide">
                            Comportament nou (Voi face...)
                        </label>
                        <div className="flex items-center bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 transition shadow-sm">
                            <Zap className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0"/>
                            <input 
                                value={newHabit.what}
                                onChange={(e) => setNewHabit({...newHabit, what: e.target.value})}
                                placeholder="ex: Voi citi 10 minute din cartea preferată" 
                                className="w-full outline-none text-sm font-medium bg-transparent dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-600"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-neutral-500 uppercase mb-2 block tracking-wide">
                                Momentul (La ora / După...)
                            </label>
                            <div className="flex items-center bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 transition shadow-sm">
                                <Activity className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0"/>
                                <input 
                                    value={newHabit.when}
                                    onChange={(e) => setNewHabit({...newHabit, when: e.target.value})}
                                    placeholder="ex: imediat după cafeaua de dimineață" 
                                    className="w-full outline-none text-sm font-medium bg-transparent dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-600"
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-end">
                             <button 
                                onClick={addCustomHabit}
                                className="w-full bg-slate-800 dark:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 dark:hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/20"
                            >
                                <Plus className="w-5 h-5"/> Activează Protocol
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            <h3 className="font-bold text-slate-800 dark:text-neutral-100 text-xl mt-8 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400"/> Protocoale Esențiale
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[
                        { id: 'sleep', label: 'Somn 7-8h', sub: 'Refacere Neurală', icon: Moon, color: 'indigo' },
                        { id: 'nature', label: 'Lumină Solară', sub: 'Setare Circadiană', icon: Sun, color: 'amber' },
                        { id: 'reading', label: 'Deep Work', sub: 'Focus 45 min', icon: BookOpen, color: 'emerald' },
                        { id: 'alcohol', label: 'Zero Toxine', sub: 'Fără Alcool', icon: Wine, color: 'rose' },
                 ].map(item => (
                    <div key={item.id} onClick={() => toggleHabit(item.id)} 
                        className={`p-4 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.02] ${
                        dailyHabits[item.id] 
                        ? `bg-${item.color}-50 dark:bg-neutral-900 border-${item.color}-200 dark:border-${item.color}-900/50 shadow-sm` 
                        : 'bg-white dark:bg-neutral-950 border-slate-100 dark:border-neutral-800 hover:shadow-md dark:hover:border-neutral-700'
                        }`}>
                        <div className={`p-3 rounded-xl ${dailyHabits[item.id] ? `bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-700 dark:text-${item.color}-400` : 'bg-slate-50 dark:bg-neutral-900 text-slate-400 dark:text-neutral-500'}`}>
                            <item.icon className="w-6 h-6"/>
                        </div>
                        <div className="flex-1">
                            <div className={`font-bold ${dailyHabits[item.id] ? `text-${item.color}-900 dark:text-${item.color}-100` : 'text-slate-700 dark:text-neutral-300'}`}>{item.label}</div>
                            <div className="text-xs text-slate-400 dark:text-neutral-500 uppercase tracking-wide font-medium">{item.sub}</div>
                        </div>
                        {dailyHabits[item.id] && <CheckCircle className={`w-6 h-6 text-${item.color}-500 animate-bounce-in`}/>}
                    </div>
                 ))}
            </div>
        </div>

        <div className="space-y-6">
             <Card className="bg-gradient-to-b from-indigo-600 to-indigo-800 dark:from-indigo-950 dark:to-black text-white border-none shadow-xl dark:border dark:border-indigo-900/30">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-yellow-300"/>
                    <h3 className="font-bold">AI Coach Instant</h3>
                </div>
                <p className="text-indigo-100 dark:text-neutral-400 text-sm mb-6 opacity-90">Simți un blocaj? Lasă inteligența artificială să îți reseteze starea în 3 minute.</p>
                
                {!generatedRoutine ? (
                    <div className="space-y-3">
                        <select 
                            value={routineMood} 
                            onChange={(e) => setRoutineMood(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm outline-none text-white cursor-pointer hover:bg-white/20 transition dark:bg-neutral-900 dark:border-neutral-800"
                        >
                            <option value="Obosit" className="text-black dark:text-white dark:bg-neutral-900">⚡ Am nevoie de energie</option>
                            <option value="Stresat" className="text-black dark:text-white dark:bg-neutral-900">🧘 Vreau să mă calmez</option>
                            <option value="Dureri de spate" className="text-black dark:text-white dark:bg-neutral-900">🦴 Mă doare spatele</option>
                            <option value="Lipsit de concentrare" className="text-black dark:text-white dark:bg-neutral-900">🎯 Vreau focus</option>
                        </select>
                        <button 
                            onClick={generateRoutine}
                            disabled={isGeneratingRoutine}
                            className="w-full bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white font-bold py-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-700 transition flex justify-center items-center gap-2 shadow-lg"
                        >
                            {isGeneratingRoutine ? <Loader className="w-4 h-4 animate-spin"/> : 'Generează Rutina'}
                        </button>
                    </div>
                ) : (
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10 animate-fade-in">
                        <div className="prose prose-sm text-white whitespace-pre-line text-sm mb-4 font-medium leading-relaxed">
                            {generatedRoutine}
                        </div>
                        <button onClick={() => setGeneratedRoutine(null)} className="w-full py-2 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition text-white">Închide</button>
                    </div>
                )}
            </Card>
        </div>
      </div>
    </div>
  );

  const renderFocus = () => (
      <div className="max-w-xl mx-auto text-center space-y-8 animate-fade-in py-10">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Zona de Focus Zen</h2>
          
          <Card className="flex flex-col items-center justify-center p-12 bg-neutral-900 border-neutral-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500/5 animate-pulse-slow"></div>
              <div className="relative z-10 text-6xl font-mono font-bold text-white mb-8 tracking-wider">
                  {formatTime(focusTime)}
              </div>
              <div className="flex gap-4 relative z-10">
                  <button onClick={() => setIsFocusActive(!isFocusActive)} className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/30">
                      {isFocusActive ? <Pause className="w-8 h-8 text-white"/> : <Play className="w-8 h-8 text-white ml-1"/>}
                  </button>
                  <button onClick={() => { setIsFocusActive(false); setFocusTime(25*60); }} className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 transition">
                      <RotateCcw className="w-6 h-6 text-neutral-400"/>
                  </button>
              </div>
              <div className="mt-12 flex gap-4">
                  {['rain', 'forest', 'white'].map(sound => (
                      <button key={sound} onClick={() => setActiveSound(sound === activeSound ? null : sound)} className={`px-4 py-2 rounded-full border text-sm font-medium transition flex items-center gap-2 ${activeSound === sound ? 'bg-indigo-900/50 border-indigo-500 text-indigo-300' : 'bg-transparent border-neutral-700 text-neutral-500'}`}>
                          <Volume2 className="w-4 h-4"/> {sound.charAt(0).toUpperCase() + sound.slice(1)}
                          {activeSound === sound && <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>}
                      </button>
                  ))}
              </div>
          </Card>
      </div>
  );

  const renderNutrition = () => (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Nutriție & Energie</h1>
              <p className="text-slate-500 dark:text-neutral-400">Combustibil pentru performanță mentală.</p>
          </div>
          <Card className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white border-none relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Utensils className="w-6 h-6"/> Chef AI</h2>
                      <p className="text-emerald-100 mb-4 text-sm">Spune-mi ce ingrediente ai, iar eu îți voi genera o rețetă optimizată pentru creier.</p>
                      <div className="flex gap-2">
                          <input 
                              value={ingredientsInput} 
                              onChange={e => setIngredientsInput(e.target.value)} 
                              placeholder="ex: ouă, spanac, avocado..." 
                              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm focus:outline-none text-white placeholder-white/30"
                          />
                          <button onClick={generateMealPlan} disabled={isMealLoading} className="bg-white text-emerald-900 px-4 py-2 rounded-xl font-bold hover:bg-emerald-50 transition">
                              {isMealLoading ? <Loader className="w-5 h-5 animate-spin"/> : 'Generează'}
                          </button>
                      </div>
                  </div>
              </div>
          </Card>
          {generatedMeal && (
              <Card className="animate-fade-in border-l-4 border-l-emerald-500">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-3">Rețeta Recomandată:</h3>
                  <div className="prose prose-sm text-slate-600 dark:text-neutral-300 whitespace-pre-line">
                      {generatedMeal}
                  </div>
              </Card>
          )}
      </div>
  );

  // --- REDESIGNED CHALLENGES SECTION ---
  const renderChallenges = () => (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">Provocarea de 30 de Zile</h1>
              <p className="text-slate-500 dark:text-neutral-400 max-w-lg mx-auto">
                  Transformă o dorință într-un obicei de fier.
              </p>
          </div>

          {!challengeConfig.isConfigured ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Left: Predefined Suggestions */}
                  <Card className="bg-white dark:bg-neutral-900 border-none shadow-lg">
                      <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                          <Medal className="w-5 h-5 text-indigo-500"/> Sugestii Populare
                      </h3>
                      <div className="space-y-3">
                          {[
                              { name: "Fără Zahăr", reward: "Ten curat & Energie stabilă", icon: "🍬" },
                              { name: "Dușuri Reci", reward: "Dopamină & Imunitate", icon: "🚿" },
                              { name: "30 Min Citit", reward: "Claritate mentală", icon: "📚" },
                              { name: "Fără Social Media", reward: "Timp recâștigat", icon: "📱" },
                              { name: "Alergare Zilnică", reward: "Condiție fizică", icon: "🏃" }
                          ].map((s, idx) => (
                              <div 
                                  key={idx}
                                  onClick={() => setChallengeConfig({ name: s.name, reward: s.reward, isConfigured: false })}
                                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 hover:bg-indigo-50 dark:hover:bg-neutral-700 cursor-pointer transition border border-transparent hover:border-indigo-200 group"
                              >
                                  <div className="flex items-center gap-3">
                                      <span className="text-xl">{s.icon}</span>
                                      <div>
                                          <div className="font-bold text-sm text-slate-700 dark:text-white">{s.name}</div>
                                          <div className="text-xs text-slate-500 dark:text-neutral-400">{s.reward}</div>
                                      </div>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500"/>
                              </div>
                          ))}
                      </div>
                  </Card>

                  {/* Right: Custom Configurator */}
                  <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>
                      <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-6">
                              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md"><Flame className="w-6 h-6 text-orange-400"/></div>
                              <h2 className="text-xl font-bold">Configurează</h2>
                          </div>
                          
                          <div className="space-y-5">
                              <div>
                                  <label className="text-xs font-bold text-indigo-200 uppercase tracking-wide mb-2 block">Numele Provocării</label>
                                  <input 
                                      placeholder="ex: Meditație la 6 AM..." 
                                      className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-white placeholder-indigo-200/50 focus:ring-2 focus:ring-orange-400 outline-none transition"
                                      value={challengeConfig.name}
                                      onChange={(e) => setChallengeConfig({...challengeConfig, name: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-indigo-200 uppercase tracking-wide mb-2 block">Recompensa (De ce?)</label>
                                  <input 
                                      placeholder="ex: Mă voi simți invincibil..." 
                                      className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-white placeholder-indigo-200/50 focus:ring-2 focus:ring-orange-400 outline-none transition"
                                      value={challengeConfig.reward}
                                      onChange={(e) => setChallengeConfig({...challengeConfig, reward: e.target.value})}
                                  />
                              </div>
                              <button 
                                  disabled={!challengeConfig.name}
                                  onClick={() => setChallengeConfig({...challengeConfig, isConfigured: true})}
                                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-orange-500/30 flex justify-center items-center gap-2 mt-4"
                              >
                                  Start Aventură <ArrowRight className="w-5 h-5"/>
                              </button>
                          </div>
                      </div>
                  </Card>
              </div>
          ) : (
              <Card className="bg-neutral-900 border-neutral-800 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                  {/* Active Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-neutral-800 pb-6 relative z-10">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-rose-500 to-orange-600 rounded-2xl shadow-lg shadow-rose-900/30">
                              <Flame className="w-8 h-8 text-white animate-pulse-slow"/>
                          </div>
                          <div>
                              <h2 className="text-2xl font-bold text-white tracking-tight">{challengeConfig.name}</h2>
                              <div className="flex items-center gap-2 text-rose-300 text-sm mt-1">
                                  <Gift className="w-3 h-3"/>
                                  <span>Recompensă: {challengeConfig.reward || "Satisfacție personală"}</span>
                              </div>
                          </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center gap-6">
                          <div className="text-right">
                              <div className="text-3xl font-bold text-white leading-none">{challengeProgress.filter(Boolean).length}<span className="text-neutral-600 text-lg">/30</span></div>
                              <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-1">Zile Completate</div>
                          </div>
                          <div className="text-right border-l border-neutral-800 pl-6">
                              <div className="text-3xl font-bold text-white leading-none">{30 - challengeProgress.filter(Boolean).length}</div>
                              <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-1">Zile Rămase</div>
                          </div>
                          <button 
                              onClick={() => setChallengeConfig({...challengeConfig, isConfigured: false})} 
                              className="p-2 bg-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition ml-2"
                              title="Editează Provocarea"
                          >
                              <Edit3 className="w-4 h-4"/>
                          </button>
                      </div>
                  </div>
                  
                  {/* Grid Vizual Interactiv */}
                  <div className="relative z-10">
                      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3">
                          {challengeProgress.map((done, idx) => (
                              <button 
                                  key={idx} 
                                  onClick={() => {
                                      const newProg = [...challengeProgress];
                                      newProg[idx] = !newProg[idx];
                                      setChallengeProgress(newProg);
                                      if(!newProg[idx]) return; 
                                      if ((idx + 1) % 7 === 0) triggerNotification("Bravo!", `Ai completat săptămâna ${Math.ceil((idx + 1) / 7)}!`, "success");
                                  }}
                                  className={`
                                      aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all duration-300 relative overflow-hidden group
                                      ${done 
                                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50 scale-105 border border-rose-500' 
                                          : 'bg-neutral-800 text-neutral-500 border border-neutral-700 hover:border-neutral-600 hover:bg-neutral-750'
                                      }
                                  `}
                              >
                                  <span className={`relative z-10 ${done ? 'text-lg' : ''}`}>{idx + 1}</span>
                                  {done && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>}
                                  {done && <CheckCircle className="w-3 h-3 absolute bottom-1 opacity-50"/>}
                              </button>
                          ))}
                      </div>
                      
                      {/* Bară Progres */}
                      <div className="w-full h-1 bg-neutral-800 mt-8 rounded-full overflow-hidden">
                          <div 
                              className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-1000 ease-out" 
                              style={{width: `${(challengeProgress.filter(Boolean).length / 30) * 100}%`}}
                          ></div>
                      </div>
                      
                      {/* Motivational Footer */}
                      <div className="mt-6 text-center text-neutral-500 text-xs italic">
                          "Nu te opri când ești obosit. Oprește-te când ai terminat."
                      </div>
                  </div>
              </Card>
          )}
      </div>
  );

  const renderMindfulness = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-24 md:pb-0">
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Sanctuarul Minții</h1>
            <p className="text-slate-500 dark:text-neutral-400">Echilibru interior prin respirație și recunoștință.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-b from-cyan-50 to-blue-50 dark:from-neutral-900 dark:to-black border-cyan-100 dark:border-neutral-800 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-white dark:bg-neutral-800 px-3 py-1 rounded-full text-xs font-bold text-cyan-600 dark:text-cyan-400 shadow-sm flex items-center gap-1">
                    <Wind className="w-3 h-3"/> 4-7-8 (Relaxare)
                </div>
                <div 
                    className={`w-48 h-48 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-2xl shadow-cyan-400/40 transition-all ease-in-out ${breathingScale} ${breathingDuration}`}
                >
                    {breathingPhase}
                </div>
                <p className="mt-8 text-slate-600 dark:text-neutral-400 text-center max-w-xs text-sm">
                    {isBreathing 
                        ? (breathingPhase === 'Inspiră' ? "Umple plămânii încet..." : breathingPhase === 'Ține' ? "Păstrează aerul..." : "Eliberează tot aerul...")
                        : "Protocol 4-7-8: Inspiră 4s, Ține 7s, Expiră 8s. Reduce anxietatea rapid."}
                </p>
                <button 
                    onClick={() => setIsBreathing(!isBreathing)}
                    className={`mt-6 px-8 py-3 rounded-xl font-bold transition shadow-lg ${isBreathing ? 'bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300' : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
                >
                    {isBreathing ? 'Oprește' : 'Începe Respirația'}
                </button>
            </Card>

            <Card className="bg-gradient-to-b from-rose-50 to-pink-50 dark:from-neutral-900 dark:to-black border-rose-100 dark:border-neutral-800">
                <div className="flex items-center gap-2 mb-6">
                    <Heart className="w-6 h-6 text-rose-500 fill-rose-500"/>
                    <h2 className="text-xl font-bold text-rose-900 dark:text-neutral-200">Jurnal de Recunoștință</h2>
                </div>
                <p className="text-sm text-rose-800 dark:text-neutral-400 mb-6 opacity-80">Ce te-a făcut să zâmbești astăzi? Scrie sau alege o sugestie.</p>
                <div className="space-y-6">
                    {gratitudeLog.map((val, idx) => (
                        <div key={idx}>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-rose-300 dark:text-neutral-500 font-bold">{idx + 1}.</span>
                                <input 
                                    value={val}
                                    onChange={(e) => {
                                        const newLog = [...gratitudeLog];
                                        newLog[idx] = e.target.value;
                                        setGratitudeLog(newLog);
                                    }}
                                    placeholder="Sunt recunoscător pentru..."
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border border-rose-100 dark:border-neutral-800 rounded-xl text-slate-700 dark:text-neutral-200 focus:ring-2 focus:ring-rose-300 outline-none transition placeholder-rose-200 dark:placeholder-neutral-600"
                                />
                            </div>
                            {val === "" && (
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {['Un apus frumos', 'O cafea bună', 'Sănătatea mea', 'Un prieten drag', 'Muzica preferată'].map(suggestion => (
                                        <button 
                                            key={suggestion}
                                            onClick={() => {
                                                const newLog = [...gratitudeLog];
                                                newLog[idx] = suggestion;
                                                setGratitudeLog(newLog);
                                            }}
                                            className="text-xs bg-white/50 dark:bg-neutral-900/50 px-3 py-1 rounded-full text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-neutral-800 transition"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <button onClick={saveJournalEntry} className="w-full mt-6 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2">
                    <Book className="w-4 h-4"/> Salvează în Jurnal
                </button>
            </Card>
        </div>

        {journalHistory.length > 0 && (
            <div className="mt-12">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <Book className="w-6 h-6 text-indigo-500"/> Memoriile Tale
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {journalHistory.map((entry) => (
                        <Card key={entry.id} className="relative group hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-indigo-500"/> {entry.date}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-neutral-500 flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3"/> {entry.time}
                                    </div>
                                </div>
                            </div>
                            <ul className="space-y-2">
                                {entry.entries.map((item, idx) => (
                                    <li key={idx} className="text-sm text-slate-600 dark:text-neutral-300 flex items-start gap-2">
                                        {/* DEFENSIVE CHECK: Ensure item is a string */}
                                        <span className="text-rose-400 mt-1">•</span> {typeof item === 'string' ? item : JSON.stringify(item)}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ))}
                </div>
            </div>
        )}
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-24 md:pb-0">
        <div className="relative">
            <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-3xl"></div>
            <div className="bg-white dark:bg-neutral-950 rounded-b-3xl shadow-sm border border-slate-100 dark:border-neutral-800 p-6 pt-0 relative">
                <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 mb-4 gap-4">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-neutral-900 rounded-full border-4 border-white dark:border-neutral-950 shadow-md flex items-center justify-center overflow-hidden relative group cursor-pointer">
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover"/>
                        ) : (
                            <User className="w-10 h-10 text-slate-300 dark:text-neutral-600"/>
                        )}
                        <div className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center transition">
                            <Camera className="w-6 h-6 text-white"/>
                        </div>
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{userProfile?.name || 'Utilizator'}</h1>
                        <p className="text-slate-500 dark:text-neutral-400 text-sm">Biohacker Level 3 • {userProfile?.age || 0} ani</p>
                    </div>
                    <button onClick={shareApp} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition flex items-center gap-2">
                        <Share2 className="w-4 h-4"/> Recomandă App
                    </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-neutral-800 pt-6 text-center">
                    <div>
                        <div className="font-bold text-xl text-slate-800 dark:text-white">{score}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Scor Mediu</div>
                    </div>
                    <div>
                        <div className="font-bold text-xl text-slate-800 dark:text-white">{customHabits.length}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Protocoale</div>
                    </div>
                    <div>
                        <div className="font-bold text-xl text-slate-800 dark:text-white">12</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Zile Consecutive</div>
                    </div>
                </div>
            </div>
        </div>

        <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400"/> Protocoalele Tale Active
            </h3>
            {customHabits.length === 0 ? (
                <div className="text-center p-8 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-dashed border-slate-300 dark:border-neutral-700">
                    <p className="text-slate-500 dark:text-neutral-400">Nu ai definit încă niciun protocol personalizat.</p>
                    <button onClick={() => setActiveTab('dashboard')} className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mt-2 hover:underline">Mergi la Laborator</button>
                </div>
            ) : (
                <div className="space-y-3">
                    {customHabits.map((habit) => (
                        <div key={habit.id} className="bg-white dark:bg-neutral-950 p-4 rounded-xl border border-slate-100 dark:border-neutral-800 flex items-center justify-between shadow-sm hover:shadow-md transition">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
                                    {habit.what[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 dark:text-white">{habit.what}</div>
                                    <div className="text-xs text-slate-500 dark:text-neutral-400 flex gap-2">
                                        <span className="bg-slate-100 dark:bg-neutral-900 px-2 py-0.5 rounded text-slate-500 dark:text-neutral-400">{habit.when}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => removeHabit(habit.id)} className="p-2 text-slate-300 hover:text-red-500 transition">
                                <Trash2 className="w-5 h-5"/>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
        
         <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-lg">
                <Settings className="w-5 h-5 text-slate-600 dark:text-neutral-400"/> Setări Cont
            </h3>
            <Card className="space-y-4">
                <div className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-neutral-900 rounded-lg transition cursor-pointer">
                    <span className="text-slate-700 dark:text-neutral-200 font-medium">Notificări Push</span>
                    <div className="w-10 h-5 bg-green-500 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div></div>
                </div>
                <div onClick={() => setDarkMode(!darkMode)} className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-neutral-900 rounded-lg transition cursor-pointer">
                    <span className="text-slate-700 dark:text-neutral-200 font-medium">Mod Întunecat</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${darkMode ? 'left-6' : 'left-1'}`}></div>
                    </div>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-neutral-800">
                     <button onClick={() => setShowOnboarding(true)} className="text-red-500 text-sm font-bold flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition w-full">
                        <LogOut className="w-4 h-4"/> Deconectare Cont
                    </button>
                </div>
            </Card>
         </div>
    </div>
  );

  const renderKnowledge = () => (
    <div className="space-y-6 pb-24 md:pb-0 animate-fade-in">
        <div className="bg-indigo-900 dark:bg-black text-white p-10 rounded-3xl relative overflow-hidden shadow-xl border border-transparent dark:border-neutral-800">
            <div className="relative z-10 max-w-2xl">
                <h2 className="text-3xl font-bold mb-4">Cunoașterea este Putere</h2>
                <p className="text-indigo-200 text-lg">Explorează mecanismele biologice care îți controlează energia, fericirea și productivitatea.</p>
            </div>
            <BookOpen className="absolute -right-6 -bottom-6 w-48 h-48 text-indigo-950 dark:text-neutral-900 opacity-50" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20"></div>
        </div>
        {Object.entries(knowledgeBase).map(([category, items]) => (
            <div key={category}>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white capitalize mb-4 ml-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item, idx) => (
                        <Card key={idx} className="hover:shadow-lg transition hover:-translate-y-1 duration-300 border-l-4 border-l-transparent hover:border-l-indigo-500">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-2">{item.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">{item.content}</p>
                        </Card>
                    ))}
                </div>
            </div>
        ))}
    </div>
  );

  const renderAICoach = () => (
    <div className="h-[85vh] flex flex-col bg-white dark:bg-neutral-950 rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-slate-100 dark:border-neutral-800 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-neutral-900 dark:to-neutral-950 p-6 text-white flex justify-between items-center shadow-md z-10 dark:border-b dark:border-neutral-800">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl"><Zap className="w-6 h-6"/></div>
                <div>
                    <h2 className="font-bold text-lg">BioSync Mentor</h2>
                    <p className="text-xs text-indigo-100 dark:text-neutral-400 font-medium">Inteligență Artificială & Neuroștiință</p>
                </div>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-black">
            {chatHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Sparkles className="w-16 h-16 mb-4 text-indigo-200 dark:text-neutral-800 animate-pulse"/>
                    <p className="font-medium text-lg text-slate-600 dark:text-neutral-500">Cum te pot ajuta astăzi?</p>
                    <div className="flex gap-2 mt-4">
                        <span className="text-xs bg-white dark:bg-neutral-900 px-3 py-1 rounded-full border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400">Somn</span>
                        <span className="text-xs bg-white dark:bg-neutral-900 px-3 py-1 rounded-full border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400">Stres</span>
                        <span className="text-xs bg-white dark:bg-neutral-900 px-3 py-1 rounded-full border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400">Nutriție</span>
                    </div>
                </div>
            )}
            {chatHistory.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                        m.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 rounded-bl-none'
                    }`}>
                        {m.content}
                    </div>
                </div>
            ))}
            {isTyping && (
                 <div className="flex justify-start">
                    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                </div>
            )}
            <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-white dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-800">
            <div className="flex gap-3 bg-slate-50 dark:bg-neutral-900 p-2 rounded-2xl border border-slate-200 dark:border-neutral-800 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-neutral-700 transition-all">
                <input 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)} 
                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Scrie mesajul tău..." 
                    className="flex-1 bg-transparent border-none px-4 py-2 text-sm focus:outline-none text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-600"
                />
                <button onClick={handleSendMessage} className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition shadow-md">
                    <Send className="w-5 h-5"/>
                </button>
            </div>
        </div>
    </div>
  );

  // --- Main Render ---
  if (showOnboarding) {
    return (
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
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Numele tău</label>
              <input required name="name" type="text" placeholder="ex: Alex" className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-white placeholder-neutral-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Vârsta</label>
              <input required name="age" type="number" placeholder="ex: 30" className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-white placeholder-neutral-500" />
            </div>
            <button type="submit" className="w-full bg-white text-indigo-900 font-bold py-4 rounded-xl hover:bg-neutral-200 transition shadow-lg flex items-center justify-center gap-2 mt-4">
              Începe Călătoria <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-neutral-100 flex flex-col md:flex-row transition-colors duration-300`}>
      {/* Sidebar Desktop */}
      <nav className="bg-white dark:bg-black border-r border-slate-200 dark:border-neutral-800 w-20 lg:w-64 h-screen fixed hidden md:flex flex-col z-50 shadow-sm transition-colors duration-300">
        <div className="p-6">
          <div className="flex items-center gap-3 text-indigo-700 dark:text-indigo-400 font-bold text-xl">
             <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Activity className="w-6 h-6"/>
             </div>
             <span className="hidden lg:block tracking-tight">BioSync</span>
          </div>
        </div>
        <div className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto scrollbar-hide">
            {[
                { id: 'dashboard', label: 'Dashboard', icon: Activity },
                { id: 'focus', label: 'Focus Zen', icon: Timer },
                { id: 'nutrition', label: 'Nutriție AI', icon: Utensils },
                { id: 'challenges', label: 'Provocări', icon: Flame },
                { id: 'mindfulness', label: 'Minte & Suflet', icon: Smile },
                { id: 'knowledge', label: 'Bibliotecă', icon: BookOpen },
                { id: 'profile', label: 'Profilul Meu', icon: User },
                { id: 'ai-coach', label: 'AI Coach', icon: Zap },
            ].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 group ${activeTab === item.id ? 'bg-indigo-50 dark:bg-neutral-900 text-indigo-700 dark:text-indigo-400 font-bold shadow-sm' : 'text-slate-500 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-900 hover:text-slate-900 dark:hover:text-neutral-200'}`}>
                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'stroke-[2.5px]' : ''}`} />
                    <span className="hidden lg:block text-sm font-medium">{item.label}</span>
                    {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 hidden lg:block"></div>}
                </button>
            ))}
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/90 dark:bg-black/90 backdrop-blur-lg border-t border-slate-200 dark:border-neutral-800 z-50 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.02)] transition-colors duration-300">
        <div className="flex justify-start overflow-x-auto p-2 gap-2 scrollbar-hide">
            {[{ id: 'dashboard', icon: Activity }, { id: 'focus', icon: Timer }, { id: 'nutrition', icon: Utensils }, { id: 'challenges', icon: Flame }, { id: 'mindfulness', icon: Smile }, { id: 'ai-coach', icon: Zap }, { id: 'profile', icon: User }].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-3 rounded-2xl flex-shrink-0 transition-all ${activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-neutral-900 scale-110' : 'text-slate-400 dark:text-neutral-500'}`}>
                    <item.icon className="w-6 h-6" />
                </button>
            ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-20 lg:ml-64 p-4 md:p-8 min-h-screen bg-slate-50/50 dark:bg-black transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'focus' && renderFocus()}
            {activeTab === 'nutrition' && renderNutrition()}
            {activeTab === 'challenges' && renderChallenges()}
            {activeTab === 'mindfulness' && renderMindfulness()}
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'knowledge' && renderKnowledge()}
            {activeTab === 'ai-coach' && renderAICoach()}
        </div>
      </main>
    </div>
  );
}
