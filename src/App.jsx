import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Medal,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Snowflake,
  PenTool,
  RefreshCw,
  Lightbulb,
  Apple,
  Scale,
  TrendingUp,
  Award,
  Star,
  Crown,
  Bed,
  Coffee,
  Sunrise,
  Sunset,
  BarChart3,
  PieChart,
  CalendarDays,
  ChevronLeft,
  Frown,
  Meh,
  SmilePlus,
  PartyPopper,
  Dumbbell,
  Salad,
  GraduationCap,
  Briefcase,
  Baby,
  Users,
  type as TypeIcon,
  Contrast,
  Bell,
  BellOff,
  Check,
  FileText,
  Quote,
  Footprints,
  Gem,
  Shield,
  Rocket,
  Swords,
  FlameKindling,
  Waves,
  TreePine
} from 'lucide-react';

// Firebase imports
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- API Key Configuration (uses environment variable) ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

// --- Funcție Helper pentru curățare Markdown ---
const cleanMarkdown = (text) => {
  if (!text) return text;
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')  // ***bold italic***
    .replace(/\*\*(.*?)\*\*/g, '$1')       // **bold**
    .replace(/\*(.*?)\*/g, '$1')           // *italic*
    .replace(/^### (.*$)/gm, '$1')         // ### headers
    .replace(/^## (.*$)/gm, '$1')          // ## headers
    .replace(/^# (.*$)/gm, '$1')           // # headers
    .replace(/^\* /gm, '• ')               // bullet points
    .replace(/^- /gm, '• ')                // bullet points
    .replace(/`(.*?)`/g, '$1')             // `code`
    .replace(/^\d+\. /gm, '')              // numbered lists (optional)
    .trim();
};

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
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Eroare la generare.";
    return cleanMarkdown(rawText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Momentan nu pot accesa serverul AI.";
  }
};

// --- Baza de Date Studii (100+ idei bazate pe cercetări științifice) ---
const knowledgeBase = {
  somn: [
    { title: 'Ciclurile REM', content: 'Somnul REM este crucial pentru stabilitate emoțională. Lipsa lui crește reactivitatea amigdalei cu 60%. (Matthew Walker)' },
    { title: 'Temperatura Optimă', content: '18.3°C este temperatura ideală în dormitor. Corpul trebuie să își scadă temperatura centrală cu 1°C pentru a iniția somnul.' },
    { title: 'Regula 10-3-2-1', content: 'Fără cofeină cu 10h înainte de culcare, fără mâncare cu 3h înainte, fără muncă cu 2h înainte, fără ecrane cu 1h înainte.' },
    { title: 'Lumina de Dimineață', content: 'Expunerea la soare în primele 30-60 min după trezire setează ceasul circadian și ajută la eliberarea melatoninei cu 16 ore mai târziu. (Huberman Lab)' },
    { title: 'NSDR', content: 'Non-Sleep Deep Rest (sau Yoga Nidra) timp de 20 minute poate reface dopamina din ganglionii bazali și reduce oboseala la fel de eficient ca un pui de somn.' },
    { title: 'Somnul și Memoria', content: 'În timpul somnului profund, creierul consolidează memoria. O noapte de somn îmbunătățește retenția informațiilor cu 40%. (Harvard Medical School)' },
    { title: 'Efectul Luminii Albastre', content: 'Lumina albastră de la ecrane suprimă melatonina cu până la 50%. Folosește filtre sau ochelari cu blocare a luminii albastre seara.' },
    { title: 'Consistența Somnului', content: 'Variația orei de culcare cu mai mult de 1 oră crește riscul de boli cardiovasculare cu 27%. (Journal of the American Heart Association)' },
    { title: 'Magneziu pentru Somn', content: 'Magneziul glicinat îmbunătățește calitatea somnului prin activarea sistemului nervos parasimpatic. Doza: 200-400mg seara.' },
    { title: 'Pernele și Coloana', content: 'Înălțimea ideală a pernei depinde de poziția de dormit: 10-15cm pentru cei care dorm pe spate, 15-20cm pentru cei pe o parte.' },
    { title: 'Cafeaua și Adenozina', content: 'Cafeaua blochează receptorii de adenozină. Timpul de înjumătățire este 5-6 ore, deci o cafea la 14:00 încă afectează somnul.' },
    { title: 'Somnul de Weekend', content: 'Nu poți "recupera" somnul pierdut în weekend. Datoria de somn acumulată afectează metabolismul și cogniția permanent.' }
  ],
  nutritie: [
    { title: 'Glucoza și Energia', content: 'Ordinea mâncării contează: Fibre -> Proteine/Grăsimi -> Carbohidrați. Asta reduce vârful glicemic cu până la 73%. (Glucose Goddess)' },
    { title: 'Fereastra de Alimentare', content: 'Mâncatul într-o fereastră de 8-10 ore (Time Restricted Feeding) îmbunătățește sănătatea metabolică și activează genele longevității.' },
    { title: 'Hidratarea și Creierul', content: 'O deshidratare de doar 2% scade performanța cognitivă și memoria de scurtă durată. Apa cu puțină sare dimineața ajută la absorbție.' },
    { title: 'Microbiomul', content: '95% din serotonină este produsă în intestin. Consumul de alimente fermentate (kefir, murături) scade inflamația sistemică.' },
    { title: 'Omega-3 și Creierul', content: 'Creierul este format 60% din grăsimi. Omega-3 (EPA/DHA) din pește reduce inflamația cerebrală și îmbunătățește memoria.' },
    { title: 'Proteine la Micul Dejun', content: '30g proteine dimineața stabilizează glicemia toată ziua și reduce poftele de dulce cu 50%. (Journal of Nutrition)' },
    { title: 'Fibrele și Longevitatea', content: 'Fiecare 10g de fibre consumate zilnic reduce riscul de mortalitate cu 10%. Ținta: 30-40g/zi.' },
    { title: 'Polifenolii', content: 'Compușii din fructele de pădure, ceai verde și ciocolată neagră protejează celulele de stres oxidativ și îmbunătățesc fluxul sanguin cerebral.' },
    { title: 'Zahărul Ascuns', content: 'Un iaurt cu fructe "sănătos" poate conține 20g zahăr - echivalentul a 5 lingurițe. Citește etichetele!' },
    { title: 'Masticația', content: 'Mestecatul de 30 de ori per îmbucătură îmbunătățește digestia și reduce consumul caloric cu 15%. (American Journal of Clinical Nutrition)' },
    { title: 'Curcuma și Inflamația', content: 'Curcumina are efecte antiinflamatorii comparabile cu ibuprofenul. Combină cu piper negru pentru absorbție de 2000% mai mare.' },
    { title: 'Cafeaua și Metabolismul', content: 'Cafeaua crește rata metabolică cu 3-11%. Dar fără zahăr și frișcă - altfel anulezi beneficiile.' },
    { title: 'Postul Intermitent', content: 'După 12-16 ore fără mâncare, corpul intră în autofagie - procesul de "curățare" celulară asociat cu longevitatea.' },
    { title: 'Vitamina D', content: '40% din europeni au deficit de vitamina D. Aceasta afectează imunitatea, starea de spirit și sănătatea oaselor.' },
    { title: 'Indicele Glicemic', content: 'Alimentele cu IG scăzut (<55) mențin energia stabilă. Orezul alb (IG 73) vs. quinoa (IG 53) - alegerea contează.' }
  ],
  focus: [
    { title: 'Deep Work', content: 'Capacitatea de concentrare profundă este rară. Multitasking-ul scade IQ-ul temporar cu 10 puncte, echivalentul unei nopți nedormite. (Cal Newport)' },
    { title: 'Regula celor 90 minute', content: 'Creierul funcționează în cicluri ultradiene de 90 minute. După un ciclu de focus intens, ai nevoie de 20 minute de odihnă.' },
    { title: 'Binaural Beats', content: 'Sunetele de 40Hz pot îmbunătăți concentrarea și memoria de lucru prin sincronizarea undelor cerebrale.' },
    { title: 'Dopamine Detox', content: 'Reducerea stimulilor ieftini (social media, zahăr) resetează receptorii de dopamină, făcând munca grea să pară mai ușoară.' },
    { title: 'Tehnica Pomodoro', content: '25 minute de muncă + 5 minute pauză. După 4 cicluri, pauză lungă de 15-30 min. Crește productivitatea cu 25%.' },
    { title: 'Efectul Zeigarnik', content: 'Creierul reține mai bine sarcinile neterminate. Începe o sarcină grea înainte de pauză - subconștientul va lucra la ea.' },
    { title: 'Mediul și Focusul', content: 'Un birou dezordonat reduce capacitatea de concentrare cu 40%. Minimalism = maximă productivitate.' },
    { title: 'Cafeaua Strategică', content: 'Cafeaua este cea mai eficientă la 90-120 min după trezire, când cortizolul scade natural. (Andrew Huberman)' },
    { title: 'Cold Exposure', content: 'Expunerea la frig (duș rece 2-3 min) crește dopamina cu 250% pentru 3 ore, îmbunătățind focusul și motivația.' },
    { title: 'Muzica și Productivitatea', content: 'Muzica fără versuri (lo-fi, clasică, ambient) îmbunătățește focusul. Versurile activează centrii limbajului și distrag.' },
    { title: 'Regula celor 2 Minute', content: 'Dacă o sarcină durează sub 2 minute, fă-o imediat. Amânarea consumă mai multă energie mentală decât executarea.' },
    { title: 'Single-Tasking', content: 'Schimbarea între sarcini costă 23 de minute pentru a reveni la focusul inițial. Fă un singur lucru la un moment dat.' }
  ],
  fericire: [
    { title: 'Paradoxul Hedonic', content: 'Fericirea derivată din confort dispare rapid. Fericirea derivată din sens și conexiune (Eudaimonia) este durabilă.' },
    { title: 'Recunoștința', content: 'Notarea a 3 lucruri pozitive zilnic timp de 21 de zile rescrie tiparele neuronale spre optimism. (Shawn Achor)' },
    { title: 'Conexiunea Socială', content: 'Singurătatea cronică este echivalentă cu fumatul a 15 țigări pe zi din punct de vedere al riscului de mortalitate.' },
    { title: 'Voluntariatul', content: '"Helper\'s High" este real. Actele de bunătate eliberează oxitocină și reduc stresul.' },
    { title: 'Natura și Starea de Spirit', content: '20 de minute în natură scad cortizolul cu 21%. Japonezii numesc asta "Shinrin-yoku" (baia de pădure).' },
    { title: 'Fluxul (Flow State)', content: 'Starea de flux apare când provocarea este cu 4% peste abilitățile tale. Prea ușor = plictiseală. Prea greu = anxietate.' },
    { title: 'Exercițiul și Depresia', content: '30 de minute de mișcare moderată zilnic este la fel de eficient ca antidepresivele pentru depresia ușoară-moderată.' },
    { title: 'Zâmbetul Forțat', content: 'Zâmbetul activează mușchii care trimit semnale pozitive creierului. Chiar și un zâmbet forțat îmbunătățește starea de spirit.' },
    { title: 'Experiențe vs. Obiecte', content: 'Banii cheltuiți pe experiențe aduc mai multă fericire decât cei pe obiecte. Efectul durează mai mult în memorie.' },
    { title: 'Meditația și Amigdala', content: '8 săptămâni de meditație zilnică reduc dimensiunea amigdalei (centrul fricii) și cresc cortexul prefrontal.' },
    { title: 'Limitele Social Media', content: '30 min/zi pe social media este punctul optim. Peste acest prag, cresc anxietatea și depresia. (Journal of Social Psychology)' },
    { title: 'Așteptările și Fericirea', content: 'Fericirea = Realitate - Așteptări. Reducerea așteptărilor nerealiste crește satisfacția vieții.' }
  ],
  longevitate: [
    { title: 'Hormesis', content: 'Stresul scurt și controlat (duș rece, saună, exerciții intense) activează mecanismele de reparare celulară și longevitate.' },
    { title: 'VO2 Max', content: 'Cel mai puternic predictor al longevității. Creșterea VO2 Max prin antrenamente cardio intense reduce riscul de mortalitate din toate cauzele.' },
    { title: 'Grip Strength', content: 'Forța de prindere a mâinii este direct corelată cu sănătatea sistemului nervos și longevitatea funcțională la bătrânețe.' },
    { title: 'Sauna și Inima', content: '4-7 saune/săptămână reduc riscul de boli cardiovasculare cu 50% și mortalitatea din toate cauzele cu 40%. (Finnish Study)' },
    { title: 'Restricția Calorică', content: 'Reducerea cu 15-20% a caloriilor fără malnutriție încetinește îmbătrânirea la nivel celular și crește durata de viață.' },
    { title: 'Telomerii', content: 'Stresul cronic scurtează telomerii (capetele cromozomilor). Meditația și exercițiul pot încetini acest proces.' },
    { title: 'Blue Zones', content: 'În zonele albastre (Okinawa, Sardinia), oamenii trăiesc 100+ ani. Secretul: mișcare naturală, sens, comunitate, dietă vegetală.' },
    { title: 'Mușchii și Metabolismul', content: 'După 30 de ani, pierzi 3-5% din masă musculară pe deceniu. Antrenamentul cu greutăți previne sarcopenia și menține metabolismul.' },
    { title: 'Somnul și Longevitatea', content: 'Mai puțin de 6 ore de somn crește riscul de mortalitate cu 12%. Între 7-8 ore este optim pentru longevitate.' },
    { title: 'HIIT și Mitocondrii', content: 'Antrenamentul HIIT crește numărul și eficiența mitocondriilor - "centralele energetice" ale celulelor - încetinind îmbătrânirea.' },
    { title: 'Sensul Vieții', content: 'Studiile arată că oamenii cu un scop clar în viață trăiesc în medie 7 ani mai mult. (Blue Zones Research)' },
    { title: 'Relațiile și Sănătatea', content: 'Studiul Harvard de 80 de ani: calitatea relațiilor este cel mai bun predictor al sănătății și fericirii la bătrânețe.' }
  ],
  ergonomie: [
    { title: 'Regula 20-20-20', content: 'La fiecare 20 min, privește la 20 picioare (6m) distanță timp de 20 secunde pentru a preveni miopia și oboseala oculară.' },
    { title: 'Statul pe Scaun', content: 'Statul jos prelungit dezactivează enzima LPL (care arde grăsimi). Ridică-te 2 minute la fiecare oră.' },
    { title: 'Tech Neck', content: 'Capul aplecat la 60 de grade (uitatul în telefon) pune o presiune de 27 kg pe coloana cervicală.' },
    { title: 'Standing Desk', content: 'Alternarea între stat și în picioare la birou reduce durerile de spate cu 54% și crește energia cu 87%.' },
    { title: 'Monitorul și Ochii', content: 'Distanța optimă: un braț lungime. Partea de sus a ecranului la nivelul ochilor. Reduce oboseala oculară cu 40%.' },
    { title: 'Tastatura și Încheieturile', content: 'Încheieturile trebuie să fie drepte sau ușor înclinate în jos. Tastatura înclinată pozitiv crește riscul de sindrom de tunel carpian.' },
    { title: 'Iluminatul Corect', content: 'Lumina naturală laterală este ideală. Evită reflexiile pe ecran și lumina directă în ochi. 500+ lux pentru productivitate.' },
    { title: 'Pauze de Mișcare', content: 'Fiecare 30 de minute, 2 minute de mișcare: stretching, genuflexiuni, plimbare. Previne rigiditatea și îmbunătățește circulația.' }
  ],
  stres: [
    { title: 'Respirația 4-7-8', content: 'Inspiră 4 secunde, ține 7 secunde, expiră 8 secunde. Activează nervul vag și reduce anxietatea în 60 de secunde.' },
    { title: 'Cortizolul Dimineața', content: 'Cortizolul este natural ridicat dimineața. Nu consuma știri negative sau e-mailuri în prima oră - amplifică stresul.' },
    { title: 'Box Breathing', content: 'Tehnica Navy SEAL: inspiră 4s, ține 4s, expiră 4s, ține 4s. Resetează sistemul nervos în situații de stres acut.' },
    { title: 'Journaling-ul', content: 'Scrierea despre gânduri și emoții timp de 15 minute reduce stresul și îmbunătățește funcția imunitară. (James Pennebaker)' },
    { title: 'Nervul Vag', content: 'Stimularea nervului vag (apă rece pe față, gargară, fredonat) activează modul "rest and digest" și reduce anxietatea.' },
    { title: 'Adaptogenii', content: 'Ashwagandha reduce cortizolul cu 23%. Rhodiola îmbunătățește rezistența la stres. Funcționează după 2-4 săptămâni de uz.' },
    { title: 'Stresul Bun vs. Rău', content: 'Eustresul (stres pozitiv) îmbunătățește performanța. Distresul (cronic) distruge sănătatea. Atitudinea față de stres contează.' },
    { title: 'Grounding', content: 'Contactul direct cu pământul (mers desculț pe iarbă) reduce inflamația și îmbunătățește somnul. 30 min/zi optim.' }
  ],
  miscare: [
    { title: 'NEAT', content: 'Non-Exercise Activity Thermogenesis: mișcările mici (gesturi, poziție în picioare, agitație) pot arde 300-500 calorii/zi.' },
    { title: '10.000 de Pași', content: 'Beneficiile maxime apar la 7.000-8.000 de pași/zi. Peste 10.000 beneficiile sunt marginale pentru sănătate.' },
    { title: 'Antrenamentul Dimineața', content: 'Exercițiile dimineața cresc metabolismul pentru restul zilei și îmbunătățesc calitatea somnului nocturn.' },
    { title: 'Compound Exercises', content: 'Exercițiile compuse (genuflexiuni, îndreptări, tracțiuni) stimulează mai mulți mușchi și eliberează mai mult hormon de creștere.' },
    { title: 'Recuperarea', content: 'Mușchii cresc în timpul odihnei, nu în timpul antrenamentului. 48-72 ore între antrenamente pentru același grup muscular.' },
    { title: 'Flexibilitatea', content: 'Stretching-ul static după antrenament reduce riscul de accidentare cu 30%. Nu stretch înainte - reduce forța.' },
    { title: 'Zone 2 Cardio', content: 'Cardio la 60-70% din pulsul maxim (poți vorbi) construiește baza aerobă și arde grăsimi eficient. 150-180 min/săpt.' },
    { title: 'Pulsul Maxim', content: 'Formula: 220 - vârsta. La 30 ani, pulsul maxim e ~190. Zona 2 = 114-133 bpm. Zona 4 (HIIT) = 162-171 bpm.' }
  ],
  mental: [
    { title: 'Neuroplasticitatea', content: 'Creierul se poate reconfigura la orice vârstă. Învățarea de lucruri noi creează noi conexiuni neuronale și previne declinul cognitiv.' },
    { title: 'Cititul și Creierul', content: '6 minute de citit reduc stresul cu 68% - mai eficient decât muzica sau o plimbare. (University of Sussex)' },
    { title: 'Învățarea Activă', content: 'Predarea altora este cel mai eficient mod de a învăța. Retenția: citit 10%, predat 90%. (Piramida învățării)' },
    { title: 'Somnul și Creativitatea', content: 'Soluțiile creative apar adesea după somn. Creierul procesează și reorganizează informațiile în timpul REM.' },
    { title: 'Jocul și Adulții', content: 'Jocul nu e doar pentru copii. Activitățile ludice la adulți reduc stresul și stimulează creativitatea.' },
    { title: 'Limitele Multitasking', content: 'Creierul nu poate face două sarcini cognitive simultan. "Multitasking" este de fapt "task-switching" rapid și ineficient.' },
    { title: 'Efectul Testing', content: 'Testarea activă (flashcards, quiz-uri) este de 50% mai eficientă decât recitirea pentru memorare.' },
    { title: 'Memoria și Emoția', content: 'Amintirile încărcate emoțional sunt mai puternice. Leagă informațiile noi de experiențe personale pentru retenție mai bună.' }
  ],
  obiceiuri: [
    { title: 'Habit Stacking', content: 'Leagă un obicei nou de unul existent: "După ce torn cafeaua, voi medita 2 minute." Crește șansele de succes cu 40%.' },
    { title: 'Regula celor 21 de Zile', content: 'De fapt, obiceiurile noi se formează în 18-254 zile, media fiind 66 zile. Nu te descuraja dacă durează mai mult!' },
    { title: 'Atomic Habits', content: 'Îmbunătățiri de 1% zilnic = de 37 ori mai bun într-un an. Focusează pe sisteme, nu pe obiective. (James Clear)' },
    { title: 'Fricțiunea', content: 'Fă obiceiurile bune ușoare (pregătește hainele de sport seara) și pe cele rele grele (șterge aplicațiile de social media).' },
    { title: 'Răsplata Imediată', content: 'Creierul preferă recompense imediate. Adaugă o răsplată imediată mică la obiceiurile cu beneficii pe termen lung.' },
    { title: 'Identitatea', content: 'Nu spune "Încerc să nu fumez." Spune "Nu sunt fumător." Schimbarea identității susține schimbarea comportamentului.' },
    { title: 'Environment Design', content: 'Vrei să citești mai mult? Pune cărți în fiecare cameră. Mediul determină comportamentul mai mult decât voința.' },
    { title: 'Never Miss Twice', content: 'Poți rata o zi. Dar niciodată două la rând. A doua zi ratată începe un nou (anti)obicei.' }
  ]
};

// --- Top Alimente Sănătoase pentru secțiunea Nutriție ---
const topHealthyFoods = [
  { name: 'Somon', calories: 208, protein: 20, gi: 0, benefits: 'Omega-3, vitamina D, reducere inflamație', category: 'Proteine' },
  { name: 'Ouă', calories: 155, protein: 13, gi: 0, benefits: 'Colină pentru creier, proteine complete', category: 'Proteine' },
  { name: 'Spanac', calories: 23, protein: 3, gi: 15, benefits: 'Fier, magneziu, vitaminele K și A', category: 'Legume' },
  { name: 'Avocado', calories: 160, protein: 2, gi: 15, benefits: 'Grăsimi sănătoase, potasiu, fibre', category: 'Fructe' },
  { name: 'Afine', calories: 57, protein: 0.7, gi: 53, benefits: 'Antioxidanți, memorie, anti-îmbătrânire', category: 'Fructe' },
  { name: 'Broccoli', calories: 34, protein: 2.8, gi: 10, benefits: 'Sulforafan anticancer, vitamina C și K', category: 'Legume' },
  { name: 'Nuci', calories: 654, protein: 15, gi: 15, benefits: 'Omega-3 vegetal, sănătatea creierului', category: 'Nuci' },
  { name: 'Quinoa', calories: 120, protein: 4.4, gi: 53, benefits: 'Proteină completă, fibre, fără gluten', category: 'Cereale' },
  { name: 'Ton', calories: 132, protein: 28, gi: 0, benefits: 'Proteine slabe, seleniu, vitamina B12', category: 'Proteine' },
  { name: 'Lămâie', calories: 29, protein: 1.1, gi: 20, benefits: 'Vitamina C, alcalinizare, digestie', category: 'Fructe' },
  { name: 'Usturoi', calories: 149, protein: 6.4, gi: 30, benefits: 'Alicină antibacteriană, imunitate', category: 'Condimente' },
  { name: 'Ghimbir', calories: 80, protein: 1.8, gi: 15, benefits: 'Anti-inflamator, digestie, greață', category: 'Condimente' },
  { name: 'Curcuma', calories: 354, protein: 8, gi: 5, benefits: 'Curcumină antiinflamatoare puternică', category: 'Condimente' },
  { name: 'Ovăz', calories: 389, protein: 17, gi: 55, benefits: 'Beta-glucan pentru colesterol, fibre', category: 'Cereale' },
  { name: 'Iaurt grecesc', calories: 97, protein: 9, gi: 11, benefits: 'Probiotice, proteine, calciu', category: 'Lactate' },
  { name: 'Linte', calories: 116, protein: 9, gi: 32, benefits: 'Proteine vegetale, fier, fibre', category: 'Leguminoase' },
  { name: 'Sardine', calories: 208, protein: 25, gi: 0, benefits: 'Omega-3, calciu, vitamina D', category: 'Proteine' },
  { name: 'Kale', calories: 49, protein: 4.3, gi: 15, benefits: 'Superaliment: vitamine A, C, K', category: 'Legume' },
  { name: 'Semințe chia', calories: 486, protein: 17, gi: 1, benefits: 'Omega-3, fibre, hidratare', category: 'Semințe' },
  { name: 'Ceai verde', calories: 1, protein: 0, gi: 0, benefits: 'EGCG antioxidant, metabolism, focus', category: 'Băuturi' },
];

// --- Sistem de Achievements/Badge-uri ---
const achievementsList = [
  // Începător
  { id: 'first_day', name: 'Prima Zi', description: 'Ai completat prima zi', icon: Sunrise, xp: 50, category: 'general' },
  { id: 'first_week', name: 'Prima Săptămână', description: '7 zile consecutive', icon: Calendar, xp: 200, category: 'general' },
  { id: 'first_month', name: 'Prima Lună', description: '30 zile consecutive', icon: CalendarDays, xp: 500, category: 'general' },
  
  // Hidratare
  { id: 'water_100', name: 'Hidratat', description: '100 pahare de apă', icon: Droplets, xp: 100, category: 'water' },
  { id: 'water_500', name: 'Acvatic', description: '500 pahare de apă', icon: Waves, xp: 300, category: 'water' },
  { id: 'water_streak_7', name: 'Flux Constant', description: '7 zile cu goal de apă atins', icon: Droplets, xp: 150, category: 'water' },
  
  // Somn
  { id: 'sleep_tracker_7', name: 'Visător', description: '7 nopți tracked', icon: Moon, xp: 100, category: 'sleep' },
  { id: 'sleep_quality_high', name: 'Somn de Aur', description: '5 nopți cu calitate excelentă', icon: Star, xp: 200, category: 'sleep' },
  { id: 'sleep_consistent', name: 'Ritm Circadian', description: '7 zile cu ore constante de somn', icon: Clock, xp: 250, category: 'sleep' },
  
  // Focus
  { id: 'focus_1h', name: 'Concentrat', description: '1 oră totală de focus', icon: Target, xp: 50, category: 'focus' },
  { id: 'focus_10h', name: 'Deep Worker', description: '10 ore totale de focus', icon: Brain, xp: 200, category: 'focus' },
  { id: 'focus_100h', name: 'Zen Master', description: '100 ore totale de focus', icon: Sparkles, xp: 500, category: 'focus' },
  
  // Provocări
  { id: 'challenge_complete', name: 'Campion', description: 'Ai completat o provocare de 30 zile', icon: Trophy, xp: 1000, category: 'challenge' },
  { id: 'challenge_3', name: 'Triplu Campion', description: '3 provocări completate', icon: Medal, xp: 2000, category: 'challenge' },
  
  // Mindfulness
  { id: 'meditation_7', name: 'Calm Interior', description: '7 sesiuni de respirație', icon: Wind, xp: 100, category: 'mindfulness' },
  { id: 'gratitude_30', name: 'Recunoscător', description: '30 intrări de recunoștință', icon: Heart, xp: 200, category: 'mindfulness' },
  
  // Obiceiuri
  { id: 'habits_all_10', name: 'Zi Perfectă', description: 'Toate cele 10 protocoale într-o zi', icon: CheckCircle, xp: 100, category: 'habits' },
  { id: 'habits_perfect_week', name: 'Săptămână Perfectă', description: '7 zile cu toate protocoalele', icon: Crown, xp: 500, category: 'habits' },
  
  // Nutriție
  { id: 'meal_gen_10', name: 'Chef Apprentice', description: '10 rețete generate', icon: Utensils, xp: 100, category: 'nutrition' },
  
  // Nivel
  { id: 'level_5', name: 'În Progres', description: 'Ai atins nivelul 5', icon: TrendingUp, xp: 0, category: 'level' },
  { id: 'level_10', name: 'Dedicat', description: 'Ai atins nivelul 10', icon: Gem, xp: 0, category: 'level' },
  { id: 'level_25', name: 'Expert', description: 'Ai atins nivelul 25', icon: Shield, xp: 0, category: 'level' },
  { id: 'level_50', name: 'Maestru', description: 'Ai atins nivelul 50', icon: Crown, xp: 0, category: 'level' },
];

// --- Sistem de Nivele ---
const levelSystem = {
  getLevel: (xp) => Math.floor(Math.sqrt(xp / 100)) + 1,
  getXPForLevel: (level) => Math.pow(level - 1, 2) * 100,
  getXPForNextLevel: (level) => Math.pow(level, 2) * 100,
  getLevelName: (level) => {
    if (level < 5) return { name: 'Începător', icon: Footprints, color: 'slate' };
    if (level < 10) return { name: 'Explorator', icon: Rocket, color: 'blue' };
    if (level < 20) return { name: 'Practicant', icon: Target, color: 'emerald' };
    if (level < 35) return { name: 'Avansat', icon: Gem, color: 'purple' };
    if (level < 50) return { name: 'Expert', icon: Shield, color: 'amber' };
    return { name: 'Maestru Biohacker', icon: Crown, color: 'yellow' };
  }
};

// --- Profile de Utilizator ---
const userProfiles = [
  { id: 'student', name: 'Student', icon: GraduationCap, description: 'Focus pe concentrare, memorie și energie pentru examene', color: 'blue' },
  { id: 'corporate', name: 'Corporate', icon: Briefcase, description: 'Gestionarea stresului, ergonomie și prevenirea burnout', color: 'slate' },
  { id: 'athlete', name: 'Sportiv', icon: Dumbbell, description: 'Recuperare, nutriție optimă și performanță fizică', color: 'orange' },
  { id: 'parent', name: 'Părinte', icon: Baby, description: 'Energie, răbdare și somn în ciuda programului încărcat', color: 'pink' },
  { id: 'senior', name: 'Senior', icon: Heart, description: 'Longevitate, mobilitate și sănătate cognitivă', color: 'emerald' },
  { id: 'general', name: 'General', icon: Users, description: 'Echilibru general pentru sănătate și bunăstare', color: 'indigo' },
];

// --- Mood Factors ---
const moodFactors = [
  { id: 'sleep_bad', label: 'Somn prost', icon: Moon, negative: true },
  { id: 'stress', label: 'Stres', icon: Flame, negative: true },
  { id: 'work', label: 'Muncă grea', icon: Briefcase, negative: true },
  { id: 'health', label: 'Probleme sănătate', icon: Heart, negative: true },
  { id: 'exercise', label: 'Am făcut sport', icon: Dumbbell, negative: false },
  { id: 'nature', label: 'Timp în natură', icon: TreePine, negative: false },
  { id: 'social', label: 'Socializare', icon: Users, negative: false },
  { id: 'achievement', label: 'Am realizat ceva', icon: Trophy, negative: false },
  { id: 'good_food', label: 'Am mâncat sănătos', icon: Salad, negative: false },
  { id: 'meditation', label: 'Am meditat', icon: Brain, negative: false },
];

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

// Mini bar chart component for stats
const MiniBarChart = ({ data, height = 60, color = 'indigo' }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className={`w-full bg-${color}-500 dark:bg-${color}-600 rounded-t transition-all duration-500`}
            style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 4 : 0 }}
          />
          <span className="text-[10px] text-slate-400 dark:text-neutral-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// --- Default User Data for Firebase ---
const getDefaultUserData = () => ({
  // Onboarding
  onboardingComplete: false,
  userType: null, // student, corporate, athlete, parent, senior, general
  primaryGoal: null, // energy, sleep, productivity, weight, stress
  dailyTimeAvailable: null, // 5, 15, 30
  experienceLevel: null, // beginner, intermediate, advanced
  
  // Profile
  profile: { name: "", age: 0, bio: "Biohacker în devenire" },
  
  // XP & Level System
  xp: 0,
  totalXP: 0,
  unlockedAchievements: [],
  
  // Statistics tracking
  stats: {
    totalWaterGlasses: 0,
    totalFocusMinutes: 0,
    totalMeditationSessions: 0,
    totalGratitudeEntries: 0,
    totalMealsGenerated: 0,
    perfectDays: 0,
    longestStreak: 0,
  },
  
  // Daily data (reset zilnic)
  waterIntake: 0,
  waterGoal: 2500,
  waterDate: new Date().toDateString(),
  breaksTaken: 0,
  breaksTakenDate: new Date().toDateString(),
  mood: null,
  moodDate: new Date().toDateString(),
  dailyHabits: { 
    sleep: false, 
    nature: false, 
    reading: false, 
    alcohol: false,
    water: false,
    movement: false,
    meditation: false,
    coldexposure: false,
    journaling: false,
    noscreen: false
  },
  dailyHabitsDate: new Date().toDateString(),
  customHabits: [],
  challengeConfig: { name: "", reward: "", isConfigured: false },
  challengeProgress: Array(30).fill(false),
  challengesCompleted: 0,
  journalHistory: [],
  
  // Sleep Tracking
  sleepLog: [], // [{date, bedtime, wakeTime, quality (1-5), duration, notes}]
  lastSleepEntry: null,
  
  // Mood Journal Extended
  moodLog: [], // [{date, mood (0-3), note, factors: []}]
  
  // Streak System
  currentStreak: 0,
  lastActiveDate: null,
  
  // Weekly scores for history
  weeklyScores: [], // [{weekStart, avgScore, habitsCompleted, waterAvg}]
  dailyScores: [], // [{date, score}] - last 30 days
  
  // Accessibility Settings
  settings: {
    fontSize: 'normal', // small, normal, large
    highContrast: false,
    notificationsEnabled: true,
    reminderWater: true,
    reminderBreak: true,
    reminderSleep: true,
  },
  
  darkMode: false,
  disclaimerAccepted: false
});

export default function App() {
  // --- Firebase Auth State ---
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- User Data from Firebase ---
  const [userData, setUserData] = useState(getDefaultUserData());
  const [dataLoading, setDataLoading] = useState(true);

  // --- App State ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotification, setShowNotification] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);
  
  // --- Disclaimer State ---
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  
  // --- Dark Mode State ---
  const [darkMode, setDarkMode] = useState(false);

  // Obiective & Scor
  const [score, setScore] = useState(0);
  const [lastBreak, setLastBreak] = useState(Date.now()); 

  // Local-only states (not synced)
  const [newHabit, setNewHabit] = useState({ what: "", when: "", where: "" });

  // Focus Zone
  const [focusTime, setFocusTime] = useState(25 * 60); 
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [activeSound, setActiveSound] = useState(null); 

  // Nutrition AI
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [generatedMeal, setGeneratedMeal] = useState(null);
  const [isMealLoading, setIsMealLoading] = useState(false);

  // Mindfulness State
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('Inspiră');
  const [breathingScale, setBreathingScale] = useState('scale-90'); 
  const [breathingDuration, setBreathingDuration] = useState('duration-[4000ms]'); 
  const [gratitudeLog, setGratitudeLog] = useState(["", "", ""]);

  // AI & Chat
  const [generatedRoutine, setGeneratedRoutine] = useState(null);
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);
  const [routineMood, setRoutineMood] = useState('Obosit');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Random Fact State
  const [randomFact, setRandomFact] = useState(null);
  
  // Nutrition Category State
  const [selectedFoodCategory, setSelectedFoodCategory] = useState('Toate');

  // --- New Feature States ---
  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  
  // Sleep Tracker Modal
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [sleepEntry, setSleepEntry] = useState({ bedtime: '23:00', wakeTime: '07:00', quality: 3, notes: '' });
  
  // Mood Journal Modal
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [moodEntry, setMoodEntry] = useState({ mood: null, note: '', factors: [] });
  
  // Achievement notification
  const [newAchievement, setNewAchievement] = useState(null);
  
  // Weekly Review Modal
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  
  // Stats period
  const [statsPeriod, setStatsPeriod] = useState('week'); // week, month, all

  // Computed values
  const currentLevel = useMemo(() => levelSystem.getLevel(userData.xp || 0), [userData.xp]);
  const levelInfo = useMemo(() => levelSystem.getLevelName(currentLevel), [currentLevel]);
  const xpForCurrentLevel = useMemo(() => levelSystem.getXPForLevel(currentLevel), [currentLevel]);
  const xpForNextLevel = useMemo(() => levelSystem.getXPForNextLevel(currentLevel), [currentLevel]);
  const xpProgress = useMemo(() => {
    const currentXP = (userData.xp || 0) - xpForCurrentLevel;
    const neededXP = xpForNextLevel - xpForCurrentLevel;
    return Math.min((currentXP / neededXP) * 100, 100);
  }, [userData.xp, xpForCurrentLevel, xpForNextLevel]);

  // Funcție pentru a genera un fact random din biblioteca
  const getRandomFact = () => {
    const allCategories = Object.keys(knowledgeBase);
    const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
    const facts = knowledgeBase[randomCategory];
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    return { ...randomFact, category: randomCategory };
  };

  // Inițializează random fact la montare
  useEffect(() => {
    setRandomFact(getRandomFact());
  }, []);

  // --- Firebase Auth Listener ---
  useEffect(() => {
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

  // --- Load User Data from Firestore ---
  useEffect(() => {
    if (!currentUser) return;

    setDataLoading(true);
    const userDocRef = doc(db, 'users', currentUser.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const today = new Date().toDateString();
        const newData = { ...data };
        
        // Reset daily data if new day
        if (data.waterDate !== today) {
          newData.waterIntake = 0;
          newData.waterDate = today;
        }
        if (data.dailyHabitsDate !== today) {
          newData.dailyHabits = { sleep: false, nature: false, reading: false, gratitude: false, meditation: false };
          newData.dailyHabitsDate = today;
        }
        if (data.moodDate !== today) {
          newData.mood = null;
          newData.moodDate = today;
        }
        if (data.breaksTakenDate !== today) {
          newData.breaksTaken = 0;
          newData.breaksTakenDate = today;
        }
        
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

  // --- Save User Data to Firestore ---
  const saveUserData = async (newData) => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, newData, { merge: true });
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  // --- XP & Achievement System ---
  const addXP = (amount, source = '') => {
    const newXP = (userData.xp || 0) + amount;
    const newTotalXP = (userData.totalXP || 0) + amount;
    const oldLevel = levelSystem.getLevel(userData.xp || 0);
    const newLevel = levelSystem.getLevel(newXP);
    
    const updates = { xp: newXP, totalXP: newTotalXP };
    
    // Level up notification
    if (newLevel > oldLevel) {
      triggerNotification(`Nivel ${newLevel}!`, `Felicitări! Ai avansat la ${levelSystem.getLevelName(newLevel).name}`, 'success');
      checkAchievement(`level_${newLevel}`);
    }
    
    setUserData(prev => ({ ...prev, ...updates }));
    saveUserData(updates);
    
    if (source) {
      triggerNotification(`+${amount} XP`, source, 'success');
    }
  };

  const checkAchievement = (achievementId) => {
    const achievement = achievementsList.find(a => a.id === achievementId);
    if (!achievement) return;
    
    const unlockedAchievements = userData.unlockedAchievements || [];
    if (unlockedAchievements.includes(achievementId)) return;
    
    // Unlock achievement
    const newUnlocked = [...unlockedAchievements, achievementId];
    setUserData(prev => ({ ...prev, unlockedAchievements: newUnlocked }));
    saveUserData({ unlockedAchievements: newUnlocked });
    
    // Show achievement notification
    setNewAchievement(achievement);
    setTimeout(() => setNewAchievement(null), 4000);
    
    // Add XP from achievement
    if (achievement.xp > 0) {
      addXP(achievement.xp);
    }
  };

  // Check streak and daily achievements
  const checkDailyProgress = () => {
    const today = new Date().toDateString();
    const lastActive = userData.lastActiveDate;
    
    if (lastActive !== today) {
      // New day - update streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let newStreak = 1;
      if (lastActive === yesterday.toDateString()) {
        newStreak = (userData.currentStreak || 0) + 1;
      }
      
      const updates = {
        currentStreak: newStreak,
        lastActiveDate: today,
      };
      
      // Update longest streak
      if (newStreak > (userData.stats?.longestStreak || 0)) {
        updates.stats = { ...userData.stats, longestStreak: newStreak };
      }
      
      setUserData(prev => ({ ...prev, ...updates }));
      saveUserData(updates);
      
      // Check streak achievements
      if (newStreak === 7) checkAchievement('first_week');
      if (newStreak === 30) checkAchievement('first_month');
      
      // First day achievement
      if (!userData.unlockedAchievements?.includes('first_day')) {
        checkAchievement('first_day');
      }
    }
  };

  // --- Sleep Tracking ---
  const saveSleepEntry = () => {
    const today = new Date().toDateString();
    const entry = {
      date: today,
      bedtime: sleepEntry.bedtime,
      wakeTime: sleepEntry.wakeTime,
      quality: sleepEntry.quality,
      notes: sleepEntry.notes,
      duration: calculateSleepDuration(sleepEntry.bedtime, sleepEntry.wakeTime)
    };
    
    const sleepLog = [...(userData.sleepLog || []), entry].slice(-90); // Keep last 90 days
    
    setUserData(prev => ({ ...prev, sleepLog, lastSleepEntry: today }));
    saveUserData({ sleepLog, lastSleepEntry: today });
    setShowSleepModal(false);
    
    // Check achievements
    const totalSleepEntries = sleepLog.length;
    if (totalSleepEntries >= 7) checkAchievement('sleep_tracker_7');
    
    const highQualityNights = sleepLog.filter(s => s.quality >= 4).length;
    if (highQualityNights >= 5) checkAchievement('sleep_quality_high');
    
    addXP(10, 'Somn înregistrat');
    triggerNotification('Somn salvat', `${entry.duration}h de somn înregistrate`, 'success');
  };

  const calculateSleepDuration = (bedtime, wakeTime) => {
    const [bedH, bedM] = bedtime.split(':').map(Number);
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    
    let bedMinutes = bedH * 60 + bedM;
    let wakeMinutes = wakeH * 60 + wakeM;
    
    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60; // Next day
    }
    
    return ((wakeMinutes - bedMinutes) / 60).toFixed(1);
  };

  // --- Mood Journal ---
  const saveMoodEntry = () => {
    const today = new Date().toDateString();
    const entry = {
      date: today,
      timestamp: new Date().toISOString(),
      mood: moodEntry.mood,
      note: moodEntry.note,
      factors: moodEntry.factors
    };
    
    const moodLog = [...(userData.moodLog || []), entry].slice(-90);
    
    // Also update the daily mood
    setUserData(prev => ({ 
      ...prev, 
      moodLog, 
      mood: moodEntry.mood, 
      moodDate: today 
    }));
    saveUserData({ moodLog, mood: moodEntry.mood, moodDate: today });
    setShowMoodModal(false);
    setMoodEntry({ mood: null, note: '', factors: [] });
    
    addXP(15, 'Jurnal completat');
    triggerNotification('Stare salvată', 'Reflecția ta a fost înregistrată', 'success');
  };

  // --- Complete Onboarding ---
  const completeOnboarding = (data) => {
    const updates = {
      onboardingComplete: true,
      userType: data.userType,
      primaryGoal: data.primaryGoal,
      dailyTimeAvailable: data.dailyTimeAvailable,
      experienceLevel: data.experienceLevel,
    };
    
    setUserData(prev => ({ ...prev, ...updates }));
    saveUserData(updates);
    setShowOnboarding(false);
    
    addXP(100, 'Onboarding completat!');
    triggerNotification('Bine ai venit!', 'Profilul tău a fost configurat', 'success');
  };

  // --- Update Daily Score History ---
  const updateDailyScore = (newScore) => {
    const today = new Date().toDateString();
    const dailyScores = [...(userData.dailyScores || [])];
    
    // Update or add today's score
    const todayIndex = dailyScores.findIndex(s => s.date === today);
    if (todayIndex >= 0) {
      dailyScores[todayIndex].score = newScore;
    } else {
      dailyScores.push({ date: today, score: newScore });
    }
    
    // Keep last 30 days
    const last30Days = dailyScores.slice(-30);
    
    setUserData(prev => ({ ...prev, dailyScores: last30Days }));
    saveUserData({ dailyScores: last30Days });
  };

  // Check if should show onboarding
  useEffect(() => {
    if (currentUser && !dataLoading && !userData.onboardingComplete) {
      setShowOnboarding(true);
    }
  }, [currentUser, dataLoading, userData.onboardingComplete]);

  // Check daily progress on load
  useEffect(() => {
    if (currentUser && !dataLoading) {
      checkDailyProgress();
    }
  }, [currentUser, dataLoading]);

  // --- Effects ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
    newScore += Math.min((userData.waterIntake / userData.waterGoal) * 20, 20);
    newScore += Math.min((userData.breaksTaken || 0) * 5, 20);
    Object.values(userData.dailyHabits).forEach(val => { if(val) newScore += 10; });
    if(userData.mood !== null) newScore += 10;
    setScore(Math.round(Math.min(newScore, 100)));
  }, [userData]);

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

  const toggleHabit = (key) => {
    const newHabits = { ...userData.dailyHabits, [key]: !userData.dailyHabits[key] };
    const newData = { ...userData, dailyHabits: newHabits, dailyHabitsDate: new Date().toDateString() };
    setUserData(newData);
    saveUserData(newData);
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
    const newData = { ...userData, challengeConfig: config };
    setUserData(newData);
    saveUserData(newData);
  };

  const updateChallengeProgress = (progress) => {
    const newData = { ...userData, challengeProgress: progress };
    setUserData(newData);
    saveUserData(newData);
  };

  const saveJournalEntry = () => {
    if (gratitudeLog.some(entry => entry.trim() !== "")) {
        const newEntry = {
            id: Date.now(),
            date: new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
            entries: gratitudeLog.filter(e => e.trim() !== "")
        };
        const newHistory = [newEntry, ...userData.journalHistory];
        const newData = { ...userData, journalHistory: newHistory };
        setUserData(newData);
        saveUserData(newData);
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

  const acceptDisclaimer = () => {
    const newData = { ...userData, disclaimerAccepted: true };
    setShowDisclaimer(false);
    setUserData(newData);
    saveUserData(newData);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    const newData = { ...userData, darkMode: newDarkMode };
    setUserData(newData);
    saveUserData(newData);
  };

  // --- Firebase Auth Handlers ---
  const handleRegister = async (e) => {
    e.preventDefault();
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
      
      triggerNotification(`Bun venit, ${name}!`, "Contul tău a fost creat cu succes.", "success");
    } catch (error) {
      console.error("Register error:", error);
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('Acest email este deja folosit.');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('Parola trebuie să aibă minim 6 caractere.');
      } else {
        setAuthError('Eroare la înregistrare. Încearcă din nou.');
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      triggerNotification("Bun venit înapoi!", "Datele tale sunt sincronizate.", "success");
    } catch (error) {
      console.error("Login error:", error);
      setAuthError('Email sau parolă incorectă.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
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

  // --- Onboarding Component ---
  const renderOnboarding = () => {
    const steps = [
      {
        title: 'Care e obiectivul tău principal?',
        options: [
          { id: 'energy', label: 'Mai multă energie', icon: Zap, color: 'amber' },
          { id: 'sleep', label: 'Somn mai bun', icon: Moon, color: 'indigo' },
          { id: 'productivity', label: 'Productivitate', icon: Target, color: 'emerald' },
          { id: 'weight', label: 'Greutate sănătoasă', icon: Scale, color: 'blue' },
          { id: 'stress', label: 'Reducere stres', icon: Heart, color: 'rose' },
        ]
      },
      {
        title: 'Ce te descrie cel mai bine?',
        options: userProfiles
      },
      {
        title: 'Cât timp ai disponibil zilnic?',
        options: [
          { id: 5, label: '5 minute', icon: Clock, color: 'slate', description: 'Micro-obiceiuri rapide' },
          { id: 15, label: '15 minute', icon: Clock, color: 'blue', description: 'Rutine eficiente' },
          { id: 30, label: '30+ minute', icon: Clock, color: 'emerald', description: 'Transformare completă' },
        ]
      },
      {
        title: 'Ce experiență ai cu biohacking?',
        options: [
          { id: 'beginner', label: 'Începător', icon: Footprints, color: 'slate', description: 'Abia încep' },
          { id: 'intermediate', label: 'Intermediar', icon: Target, color: 'blue', description: 'Cunosc bazele' },
          { id: 'advanced', label: 'Avansat', icon: Crown, color: 'amber', description: 'Practician experimentat' },
        ]
      }
    ];

    const [selections, setSelections] = useState({
      primaryGoal: null,
      userType: null,
      dailyTimeAvailable: null,
      experienceLevel: null,
    });

    const stepKeys = ['primaryGoal', 'userType', 'dailyTimeAvailable', 'experienceLevel'];

    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          {/* Progress bar */}
          <div className="flex gap-2 mb-8">
            {steps.map((_, idx) => (
              <div key={idx} className={`flex-1 h-2 rounded-full transition-all ${idx <= onboardingStep ? 'bg-indigo-500' : 'bg-neutral-800'}`} />
            ))}
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {steps[onboardingStep].title}
            </h2>

            <div className="space-y-3">
              {steps[onboardingStep].options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelections(prev => ({ ...prev, [stepKeys[onboardingStep]]: opt.id }));
                    
                    if (onboardingStep < steps.length - 1) {
                      setTimeout(() => setOnboardingStep(s => s + 1), 300);
                    } else {
                      completeOnboarding({ ...selections, [stepKeys[onboardingStep]]: opt.id });
                    }
                  }}
                  className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${
                    selections[stepKeys[onboardingStep]] === opt.id
                      ? `bg-${opt.color}-500/20 border-${opt.color}-500 text-white`
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                  }`}
                >
                  <div className={`p-3 rounded-xl bg-${opt.color}-500/20`}>
                    <opt.icon className={`w-6 h-6 text-${opt.color}-400`} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-bold">{opt.label || opt.name}</div>
                    {opt.description && <div className="text-sm text-neutral-400">{opt.description}</div>}
                  </div>
                </button>
              ))}
            </div>

            {onboardingStep > 0 && (
              <button 
                onClick={() => setOnboardingStep(s => s - 1)}
                className="mt-6 text-neutral-400 hover:text-white transition flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Înapoi
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- Sleep Modal ---
  const renderSleepModal = () => (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Moon className="w-6 h-6 text-indigo-400" /> Înregistrează Somnul
          </h2>
          <button onClick={() => setShowSleepModal(false)} className="p-2 bg-neutral-800 rounded-full text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-neutral-400 mb-2 block">M-am culcat la:</label>
              <input 
                type="time" 
                value={sleepEntry.bedtime}
                onChange={(e) => setSleepEntry(prev => ({ ...prev, bedtime: e.target.value }))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-neutral-400 mb-2 block">M-am trezit la:</label>
              <input 
                type="time" 
                value={sleepEntry.wakeTime}
                onChange={(e) => setSleepEntry(prev => ({ ...prev, wakeTime: e.target.value }))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-neutral-400 mb-3 block">Calitatea somnului:</label>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((q) => (
                <button
                  key={q}
                  onClick={() => setSleepEntry(prev => ({ ...prev, quality: q }))}
                  className={`flex-1 py-3 rounded-xl font-bold transition ${
                    sleepEntry.quality === q 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  {q === 1 ? '😫' : q === 2 ? '😕' : q === 3 ? '😐' : q === 4 ? '😊' : '🤩'}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-neutral-500 mt-1 px-2">
              <span>Groaznic</span>
              <span>Excelent</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-neutral-400 mb-2 block">Note (opțional):</label>
            <textarea
              value={sleepEntry.notes}
              onChange={(e) => setSleepEntry(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Am visat ceva interesant..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white resize-none h-20"
            />
          </div>

          <div className="bg-neutral-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Durată estimată:</span>
              <span className="text-2xl font-bold text-indigo-400">
                {calculateSleepDuration(sleepEntry.bedtime, sleepEntry.wakeTime)}h
              </span>
            </div>
          </div>

          <button
            onClick={saveSleepEntry}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition"
          >
            Salvează +10 XP
          </button>
        </div>
      </div>
    </div>
  );

  // --- Mood Modal ---
  const renderMoodModal = () => (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Smile className="w-6 h-6 text-amber-400" /> Cum te simți?
          </h2>
          <button onClick={() => setShowMoodModal(false)} className="p-2 bg-neutral-800 rounded-full text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between gap-3">
            {[
              { id: 0, emoji: '😞', label: 'Rău', color: 'rose' },
              { id: 1, emoji: '😐', label: 'Meh', color: 'slate' },
              { id: 2, emoji: '🙂', label: 'Bine', color: 'blue' },
              { id: 3, emoji: '🤩', label: 'Super!', color: 'emerald' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMoodEntry(prev => ({ ...prev, mood: m.id }))}
                className={`flex-1 py-4 rounded-xl transition flex flex-col items-center gap-2 ${
                  moodEntry.mood === m.id 
                    ? `bg-${m.color}-500/20 border-2 border-${m.color}-500` 
                    : 'bg-neutral-800 border-2 border-transparent'
                }`}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className={`text-xs font-medium ${moodEntry.mood === m.id ? `text-${m.color}-400` : 'text-neutral-400'}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm text-neutral-400 mb-3 block">Ce a influențat starea ta?</label>
            <div className="flex flex-wrap gap-2">
              {moodFactors.map((factor) => (
                <button
                  key={factor.id}
                  onClick={() => {
                    setMoodEntry(prev => ({
                      ...prev,
                      factors: prev.factors.includes(factor.id)
                        ? prev.factors.filter(f => f !== factor.id)
                        : [...prev.factors, factor.id]
                    }));
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                    moodEntry.factors.includes(factor.id)
                      ? factor.negative 
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                      : 'bg-neutral-800 text-neutral-400 border border-transparent hover:bg-neutral-700'
                  }`}
                >
                  <factor.icon className="w-4 h-4" />
                  {factor.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-neutral-400 mb-2 block">Notă personală (opțional):</label>
            <textarea
              value={moodEntry.note}
              onChange={(e) => setMoodEntry(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Cum a fost ziua ta? Ce ai învățat?"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white resize-none h-24"
            />
          </div>

          <button
            onClick={saveMoodEntry}
            disabled={moodEntry.mood === null}
            className={`w-full font-bold py-4 rounded-xl transition ${
              moodEntry.mood !== null 
                ? 'bg-amber-600 text-white hover:bg-amber-700' 
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            Salvează +15 XP
          </button>
        </div>
      </div>
    </div>
  );

  // --- Achievement Notification ---
  const renderAchievementNotification = () => {
    if (!newAchievement) return null;
    
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-1 shadow-2xl shadow-amber-500/50">
          <div className="bg-neutral-900 rounded-xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <newAchievement.icon className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <div className="text-amber-400 text-xs font-bold uppercase tracking-wider">🏆 Achievement Deblocat!</div>
              <div className="text-white font-bold text-lg">{newAchievement.name}</div>
              <div className="text-neutral-400 text-sm">{newAchievement.description}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Stats View ---
  const renderStats = () => {
    const last7Days = (userData.dailyScores || []).slice(-7);
    const last30Days = (userData.dailyScores || []).slice(-30);
    const avgScore7 = last7Days.length > 0 ? Math.round(last7Days.reduce((a, b) => a + b.score, 0) / last7Days.length) : 0;
    const avgScore30 = last30Days.length > 0 ? Math.round(last30Days.reduce((a, b) => a + b.score, 0) / last30Days.length) : 0;
    
    const sleepLast7 = (userData.sleepLog || []).slice(-7);
    const avgSleep = sleepLast7.length > 0 ? (sleepLast7.reduce((a, b) => a + parseFloat(b.duration), 0) / sleepLast7.length).toFixed(1) : 0;
    
    const chartData = last7Days.map((d, i) => ({
      label: ['L', 'M', 'M', 'J', 'V', 'S', 'D'][new Date(d.date).getDay()],
      value: d.score
    }));

    return (
      <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Statistici & Progres</h1>
          <p className="text-slate-500 dark:text-neutral-400">Vizualizează-ți călătoria</p>
        </div>

        {/* Level Card */}
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-indigo-200 text-sm font-medium mb-1">Nivel {currentLevel}</div>
                <div className="text-3xl font-bold flex items-center gap-2">
                  <levelInfo.icon className="w-8 h-8" />
                  {levelInfo.name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{userData.xp || 0}</div>
                <div className="text-indigo-200 text-sm">XP Total</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-indigo-200">Progres spre nivel {currentLevel + 1}</span>
                <span className="font-bold">{Math.round(xpProgress)}%</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-indigo-200">
                <span>{xpForCurrentLevel} XP</span>
                <span>{xpForNextLevel} XP</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{userData.currentStreak || 0}</div>
            <div className="text-sm text-slate-500 dark:text-neutral-400">🔥 Streak Curent</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{userData.stats?.longestStreak || 0}</div>
            <div className="text-sm text-slate-500 dark:text-neutral-400">📈 Cel Mai Lung</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{avgScore7}</div>
            <div className="text-sm text-slate-500 dark:text-neutral-400">⭐ Scor Mediu 7z</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{avgSleep}h</div>
            <div className="text-sm text-slate-500 dark:text-neutral-400">😴 Somn Mediu</div>
          </Card>
        </div>

        {/* Score Chart */}
        <Card>
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" /> Scorul din ultima săptămână
          </h3>
          {chartData.length > 0 ? (
            <MiniBarChart data={chartData} height={120} color="indigo" />
          ) : (
            <div className="text-center py-8 text-slate-400 dark:text-neutral-500">
              Nu ai încă date. Continuă să îți urmărești progresul!
            </div>
          )}
        </Card>

        {/* Achievements */}
        <Card>
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" /> Badge-uri ({(userData.unlockedAchievements || []).length}/{achievementsList.length})
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {achievementsList.slice(0, 12).map((ach) => {
              const isUnlocked = (userData.unlockedAchievements || []).includes(ach.id);
              return (
                <div 
                  key={ach.id}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition ${
                    isUnlocked 
                      ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-400' 
                      : 'bg-slate-100 dark:bg-neutral-800 opacity-40'
                  }`}
                  title={`${ach.name}: ${ach.description}`}
                >
                  <ach.icon className={`w-6 h-6 ${isUnlocked ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-neutral-500'}`} />
                  <span className={`text-[10px] font-medium mt-1 text-center ${isUnlocked ? 'text-amber-700 dark:text-amber-300' : 'text-slate-400 dark:text-neutral-500'}`}>
                    {ach.name}
                  </span>
                </div>
              );
            })}
          </div>
          <button 
            onClick={() => setActiveTab('achievements')}
            className="w-full mt-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition"
          >
            Vezi toate badge-urile →
          </button>
        </Card>

        {/* All-time Stats */}
        <Card>
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> Statistici Totale
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl">
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{userData.stats?.totalWaterGlasses || 0}</div>
              <div className="text-xs text-slate-500 dark:text-neutral-400">💧 Pahare de apă</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl">
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{userData.stats?.totalFocusMinutes || 0}</div>
              <div className="text-xs text-slate-500 dark:text-neutral-400">🎯 Minute focus</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl">
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{(userData.sleepLog || []).length}</div>
              <div className="text-xs text-slate-500 dark:text-neutral-400">😴 Nopți tracked</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-xl">
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{userData.challengesCompleted || 0}</div>
              <div className="text-xs text-slate-500 dark:text-neutral-400">🏆 Provocări completate</div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // --- Full Achievements View ---
  const renderAchievements = () => {
    const categories = [...new Set(achievementsList.map(a => a.category))];
    
    return (
      <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">🏆 Badge-uri</h1>
          <p className="text-slate-500 dark:text-neutral-400">
            Deblocate: {(userData.unlockedAchievements || []).length} / {achievementsList.length}
          </p>
        </div>

        {categories.map(cat => (
          <Card key={cat} className="overflow-hidden">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 capitalize">{cat}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievementsList.filter(a => a.category === cat).map(ach => {
                const isUnlocked = (userData.unlockedAchievements || []).includes(ach.id);
                return (
                  <div 
                    key={ach.id}
                    className={`p-4 rounded-xl flex items-center gap-4 transition ${
                      isUnlocked 
                        ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' 
                        : 'bg-slate-50 dark:bg-neutral-800 opacity-60'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${isUnlocked ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-slate-200 dark:bg-neutral-700'}`}>
                      <ach.icon className={`w-6 h-6 ${isUnlocked ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-neutral-500'}`} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold ${isUnlocked ? 'text-amber-900 dark:text-amber-100' : 'text-slate-600 dark:text-neutral-400'}`}>
                        {ach.name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-neutral-400">{ach.description}</div>
                    </div>
                    {isUnlocked ? (
                      <CheckCircle className="w-6 h-6 text-amber-500" />
                    ) : (
                      <div className="text-xs text-slate-400 dark:text-neutral-500">+{ach.xp} XP</div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // --- Auth Screen ---
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
          <button 
            onClick={() => { setAuthMode('login'); setAuthError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${authMode === 'login' ? 'bg-indigo-600 text-white' : 'text-neutral-400'}`}
          >
            Autentificare
          </button>
          <button 
            onClick={() => { setAuthMode('register'); setAuthError(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${authMode === 'register' ? 'bg-indigo-600 text-white' : 'text-neutral-400'}`}
          >
            Cont Nou
          </button>
        </div>

        {authError && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-4 flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0"/>
            {authError}
          </div>
        )}
        
        <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {authMode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Numele tău</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500"/>
                  <input required name="name" type="text" placeholder="ex: Alex" className="w-full pl-12 pr-4 py-4 bg-neutral-800 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-white placeholder-neutral-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Vârsta</label>
                <input required name="age" type="number" placeholder="ex: 30" className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-white placeholder-neutral-500" />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500"/>
              <input required name="email" type="email" placeholder="email@exemplu.com" className="w-full pl-12 pr-4 py-4 bg-neutral-800 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-white placeholder-neutral-500" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Parolă</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500"/>
              <input required name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full pl-12 pr-12 py-4 bg-neutral-800 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-white placeholder-neutral-500" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition">
                {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
              </button>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-white text-indigo-900 font-bold py-4 rounded-xl hover:bg-neutral-200 transition shadow-lg flex items-center justify-center gap-2 mt-4">
            {authMode === 'login' ? 'Intră în cont' : 'Creează cont'} <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        
        <p className="text-center text-xs text-neutral-500 mt-6">
          © {new Date().getFullYear()} Cristian Puravu. Toate drepturile rezervate.
        </p>
      </div>
    </div>
  );

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
         
         <div className="relative z-10 p-6 md:p-8">
            {/* Top row: Level badge + Streak */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-full bg-${levelInfo.color}-500/20 border border-${levelInfo.color}-500/50 flex items-center gap-2`}>
                  <levelInfo.icon className={`w-4 h-4 text-${levelInfo.color}-400`} />
                  <span className={`text-sm font-bold text-${levelInfo.color}-300`}>Nv. {currentLevel}</span>
                </div>
                <span className="text-neutral-400 text-sm hidden md:block">{levelInfo.name}</span>
              </div>
              
              {userData.currentStreak > 0 && (
                <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1.5 rounded-full border border-orange-500/30">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="font-bold text-orange-300">{userData.currentStreak} zile</span>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                  {/* Mood selector that opens modal */}
                  <button 
                    onClick={() => setShowMoodModal(true)}
                    className="flex items-center gap-3 mb-3 group"
                  >
                    <span className="text-3xl">{userData.mood !== null ? ['😞', '😐', '🙂', '🤩'][userData.mood] : '🤔'}</span>
                    <span className="text-sm text-neutral-400 group-hover:text-white transition">
                      {userData.mood !== null ? 'Schimbă starea' : 'Cum te simți?'}
                    </span>
                  </button>

                  <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Salut, {userData.profile?.name || 'Oaspete'}!</h1>
                  
                  {/* XP Progress bar */}
                  <div className="mb-4 max-w-md">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-400">{userData.xp || 0} XP</span>
                      <span className="text-neutral-400">Nivel {currentLevel + 1}: {xpForNextLevel} XP</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: `${xpProgress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap mb-4">
                      <button onClick={() => setActiveOverlay('morning')} className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-amber-500/30 transition">
                          <Sun className="w-4 h-4"/> Start Zi
                      </button>
                      <button onClick={() => setActiveOverlay('evening')} className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-500/30 transition">
                          <Moon className="w-4 h-4"/> Închidere
                      </button>
                      <button onClick={() => setShowSleepModal(true)} className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-purple-500/30 transition">
                          <Bed className="w-4 h-4"/> Somn
                      </button>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                      <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                          <Droplets className="w-4 h-4 text-blue-400"/>
                          <span className="font-bold text-neutral-200">{userData.waterIntake} / {userData.waterGoal} ml</span>
                      </div>
                      <div className="flex gap-2">
                        {[250, 500].map(amt => (
                          <button key={amt} onClick={() => addWater(amt)} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-sm font-bold hover:bg-blue-500/30 transition">
                            +{amt}ml
                          </button>
                        ))}
                      </div>
                  </div>
              </div>
              <div className="relative flex-shrink-0">
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-white">{score}</span>
                  <CircularProgress score={score} size={32} />
                  <div className="text-center mt-2 text-xs text-neutral-400">Scor Zilnic</div>
              </div>
           </div>
         </div>
      </div>

      {/* Random Fact Card - Știai că? */}
      {randomFact && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex-shrink-0">
              <Lightbulb className="w-6 h-6 text-amber-600 dark:text-amber-400"/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Știai că?</span>
                <span className="text-xs bg-amber-200 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full capitalize">{randomFact.category}</span>
              </div>
              <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1">{randomFact.title}</h4>
              <p className="text-sm text-amber-800 dark:text-amber-200/80 leading-relaxed">{randomFact.content}</p>
            </div>
            <button 
              onClick={() => setRandomFact(getRandomFact())}
              className="p-2 bg-amber-200 dark:bg-amber-900/50 rounded-xl hover:bg-amber-300 dark:hover:bg-amber-800/50 transition flex-shrink-0"
              title="Arată alt fapt"
            >
              <RefreshCw className="w-5 h-5 text-amber-700 dark:text-amber-400"/>
            </button>
          </div>
        </div>
      )}

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
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400"/> Protocoale Esențiale (10)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[
                        { id: 'sleep', label: 'Somn 7-8h', sub: 'Refacere Neurală', icon: Moon, color: 'indigo' },
                        { id: 'nature', label: 'Lumină Solară', sub: 'Setare Circadiană', icon: Sun, color: 'amber' },
                        { id: 'reading', label: 'Deep Work', sub: 'Focus 45 min', icon: BookOpen, color: 'emerald' },
                        { id: 'alcohol', label: 'Zero Toxine', sub: 'Fără Alcool', icon: Wine, color: 'rose' },
                        { id: 'water', label: 'Hidratare 2.5L', sub: 'Funcție Cognitivă', icon: Droplets, color: 'blue' },
                        { id: 'movement', label: 'Mișcare 30min', sub: 'Activare Metabolică', icon: Activity, color: 'orange' },
                        { id: 'meditation', label: 'Meditație', sub: 'Mindfulness 10min', icon: Brain, color: 'purple' },
                        { id: 'coldexposure', label: 'Expunere Frig', sub: 'Duș Rece 2min', icon: Snowflake, color: 'cyan' },
                        { id: 'journaling', label: 'Jurnal', sub: 'Reflecție Zilnică', icon: PenTool, color: 'pink' },
                        { id: 'noscreen', label: 'Digital Detox', sub: 'Fără Ecrane 1h', icon: EyeOff, color: 'slate' },
                 ].map(item => (
                    <div key={item.id} onClick={() => toggleHabit(item.id)} 
                        className={`p-4 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.02] ${
                        userData.dailyHabits[item.id] 
                        ? `bg-${item.color}-50 dark:bg-neutral-900 border-${item.color}-200 dark:border-${item.color}-900/50 shadow-sm` 
                        : 'bg-white dark:bg-neutral-950 border-slate-100 dark:border-neutral-800 hover:shadow-md dark:hover:border-neutral-700'
                        }`}>
                        <div className={`p-3 rounded-xl ${userData.dailyHabits[item.id] ? `bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-700 dark:text-${item.color}-400` : 'bg-slate-50 dark:bg-neutral-900 text-slate-400 dark:text-neutral-500'}`}>
                            <item.icon className="w-6 h-6"/>
                        </div>
                        <div className="flex-1">
                            <div className={`font-bold ${userData.dailyHabits[item.id] ? `text-${item.color}-900 dark:text-${item.color}-100` : 'text-slate-700 dark:text-neutral-300'}`}>{item.label}</div>
                            <div className="text-xs text-slate-400 dark:text-neutral-500 uppercase tracking-wide font-medium">{item.sub}</div>
                        </div>
                        {userData.dailyHabits[item.id] && <CheckCircle className={`w-6 h-6 text-${item.color}-500 animate-bounce-in`}/>}
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

  const renderNutrition = () => {
      const categories = ['Toate', ...new Set(topHealthyFoods.map(f => f.category))];
      const filteredFoods = selectedFoodCategory === 'Toate' 
        ? topHealthyFoods 
        : topHealthyFoods.filter(f => f.category === selectedFoodCategory);
      
      return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-24 md:pb-0">
          <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Nutriție & Energie</h1>
              <p className="text-slate-500 dark:text-neutral-400">Combustibil pentru performanță mentală și longevitate.</p>
          </div>
          
          {/* Chef AI Section */}
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

          {/* Top 20 Alimente Sănătoase */}
          <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <Apple className="w-7 h-7 text-emerald-500"/> Top 20 Superalimente
                  </h2>
                  <div className="flex gap-2 flex-wrap">
                      {categories.map(cat => (
                          <button
                              key={cat}
                              onClick={() => setSelectedFoodCategory(cat)}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                                  selectedFoodCategory === cat 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700'
                              }`}
                          >
                              {cat}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFoods.map((food, idx) => (
                      <Card key={idx} className="p-4 hover:shadow-lg transition-shadow border border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                          <div className="flex items-start gap-4">
                              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex-shrink-0">
                                  <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400"/>
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-bold text-slate-800 dark:text-white">{food.name}</h3>
                                      <span className="text-xs bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 px-2 py-0.5 rounded-full">{food.category}</span>
                                  </div>
                                  <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-2">{food.benefits}</p>
                                  
                                  <div className="flex flex-wrap gap-3 text-xs">
                                      <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-lg">
                                          <Flame className="w-3 h-3"/>
                                          <span className="font-semibold">{food.calories}</span>
                                          <span className="opacity-70">kcal/100g</span>
                                      </div>
                                      <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-lg">
                                          <Activity className="w-3 h-3"/>
                                          <span className="font-semibold">{food.protein}g</span>
                                          <span className="opacity-70">proteine</span>
                                      </div>
                                      <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-lg">
                                          <Scale className="w-3 h-3"/>
                                          <span className="font-semibold">IG {food.gi}</span>
                                          <span className="opacity-70">{food.gi <= 35 ? 'scăzut' : food.gi <= 55 ? 'mediu' : 'ridicat'}</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </Card>
                  ))}
              </div>

              {/* Info Card despre Indicele Glicemic */}
              <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-900/50">
                  <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex-shrink-0">
                          <Info className="w-6 h-6 text-purple-600 dark:text-purple-400"/>
                      </div>
                      <div>
                          <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-2">Ce este Indicele Glicemic (IG)?</h3>
                          <p className="text-sm text-purple-800 dark:text-purple-200/80 leading-relaxed">
                              Indicele Glicemic măsoară cât de repede un aliment crește glicemia. 
                              <strong className="text-purple-900 dark:text-purple-100"> IG scăzut (0-35)</strong> = energie stabilă, 
                              <strong className="text-purple-900 dark:text-purple-100"> IG mediu (36-55)</strong> = moderat, 
                              <strong className="text-purple-900 dark:text-purple-100"> IG ridicat (56+)</strong> = vârfuri de energie urmate de crash. 
                              Pentru focus și energie constantă, alege alimente cu IG scăzut!
                          </p>
                      </div>
                  </div>
              </Card>

              {/* Sfaturi rapide nutriție */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                      <div className="text-center">
                          <div className="text-3xl mb-2">🥗</div>
                          <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1">Regula Farfuriei</h4>
                          <p className="text-xs text-amber-700 dark:text-amber-300">50% legume, 25% proteine, 25% carbohidrați complecși</p>
                      </div>
                  </Card>
                  <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                      <div className="text-center">
                          <div className="text-3xl mb-2">⏰</div>
                          <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1">Fereastra de Mâncat</h4>
                          <p className="text-xs text-blue-700 dark:text-blue-300">8-10 ore pentru digestie optimă și autofagie</p>
                      </div>
                  </Card>
                  <Card className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                      <div className="text-center">
                          <div className="text-3xl mb-2">🥬</div>
                          <h4 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">Ordinea Mâncării</h4>
                          <p className="text-xs text-emerald-700 dark:text-emerald-300">Fibre → Proteine → Carbohidrați = -73% spike glicemic</p>
                      </div>
                  </Card>
              </div>
          </div>
      </div>
  )};

  // --- REDESIGNED CHALLENGES SECTION ---
  const renderChallenges = () => (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">Provocarea de 30 de Zile</h1>
              <p className="text-slate-500 dark:text-neutral-400 max-w-lg mx-auto">
                  Transformă o dorință într-un obicei de fier.
              </p>
          </div>

          {!userData.challengeConfig.isConfigured ? (
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
                                  onClick={() => updateChallengeConfig({ name: s.name, reward: s.reward, isConfigured: false })}
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
                                      value={userData.challengeConfig.name}
                                      onChange={(e) => updateChallengeConfig({...userData.challengeConfig, name: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-indigo-200 uppercase tracking-wide mb-2 block">Recompensa (De ce?)</label>
                                  <input 
                                      placeholder="ex: Mă voi simți invincibil..." 
                                      className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-white placeholder-indigo-200/50 focus:ring-2 focus:ring-orange-400 outline-none transition"
                                      value={userData.challengeConfig.reward}
                                      onChange={(e) => updateChallengeConfig({...userData.challengeConfig, reward: e.target.value})}
                                  />
                              </div>
                              <button 
                                  disabled={!userData.challengeConfig.name}
                                  onClick={() => updateChallengeConfig({...userData.challengeConfig, isConfigured: true})}
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
                              <h2 className="text-2xl font-bold text-white tracking-tight">{userData.challengeConfig.name}</h2>
                              <div className="flex items-center gap-2 text-rose-300 text-sm mt-1">
                                  <Gift className="w-3 h-3"/>
                                  <span>Recompensă: {userData.challengeConfig.reward || "Satisfacție personală"}</span>
                              </div>
                          </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center gap-6">
                          <div className="text-right">
                              <div className="text-3xl font-bold text-white leading-none">{userData.challengeProgress.filter(Boolean).length}<span className="text-neutral-600 text-lg">/30</span></div>
                              <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-1">Zile Completate</div>
                          </div>
                          <div className="text-right border-l border-neutral-800 pl-6">
                              <div className="text-3xl font-bold text-white leading-none">{30 - userData.challengeProgress.filter(Boolean).length}</div>
                              <div className="text-xs text-neutral-500 font-medium uppercase tracking-wider mt-1">Zile Rămase</div>
                          </div>
                          <button 
                              onClick={() => updateChallengeConfig({...userData.challengeConfig, isConfigured: false})} 
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
                          {userData.challengeProgress.map((done, idx) => (
                              <button 
                                  key={idx} 
                                  onClick={() => {
                                      const newProg = [...userData.challengeProgress];
                                      newProg[idx] = !newProg[idx];
                                      updateChallengeProgress(newProg);
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
                              style={{width: `${(userData.challengeProgress.filter(Boolean).length / 30) * 100}%`}}
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

        {userData.journalHistory.length > 0 && (
            <div className="mt-12">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <Book className="w-6 h-6 text-indigo-500"/> Memoriile Tale
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userData.journalHistory.map((entry) => (
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
                    <div className="w-24 h-24 bg-slate-100 dark:bg-neutral-900 rounded-full border-4 border-white dark:border-neutral-950 shadow-md flex items-center justify-center overflow-hidden">
                        <User className="w-10 h-10 text-slate-300 dark:text-neutral-600"/>
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{userData.profile?.name || 'Utilizator'}</h1>
                        <p className="text-slate-500 dark:text-neutral-400 text-sm">Biohacker Level 3 • {userData.profile?.age || 0} ani</p>
                        <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">{currentUser?.email}</p>
                    </div>
                    <button onClick={shareApp} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition flex items-center gap-2">
                        <Share2 className="w-4 h-4"/> Recomandă App
                    </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-neutral-800 pt-6 text-center">
                    <div>
                        <div className="font-bold text-xl text-slate-800 dark:text-white">{score}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Scor Azi</div>
                    </div>
                    <div>
                        <div className="font-bold text-xl text-slate-800 dark:text-white">{userData.customHabits.length}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Protocoale</div>
                    </div>
                    <div>
                        <div className="font-bold text-xl text-slate-800 dark:text-white">{userData.challengeProgress.filter(Boolean).length}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Zile Provocare</div>
                    </div>
                </div>
            </div>
        </div>

        <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400"/> Protocoalele Tale Active
            </h3>
            {userData.customHabits.length === 0 ? (
                <div className="text-center p-8 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-dashed border-slate-300 dark:border-neutral-700">
                    <p className="text-slate-500 dark:text-neutral-400">Nu ai definit încă niciun protocol personalizat.</p>
                    <button onClick={() => setActiveTab('dashboard')} className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mt-2 hover:underline">Mergi la Laborator</button>
                </div>
            ) : (
                <div className="space-y-3">
                    {userData.customHabits.map((habit) => (
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
                <div onClick={toggleDarkMode} className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-neutral-900 rounded-lg transition cursor-pointer">
                    <span className="text-slate-700 dark:text-neutral-200 font-medium">Mod Întunecat</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${darkMode ? 'left-6' : 'left-1'}`}></div>
                    </div>
                </div>
                <div className="flex justify-between items-center p-2">
                    <span className="text-slate-700 dark:text-neutral-200 font-medium">Sincronizare Cloud</span>
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3"/> Activ
                    </span>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-neutral-800">
                     <button onClick={handleLogout} className="text-red-500 text-sm font-bold flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition w-full">
                        <LogOut className="w-4 h-4"/> Deconectare
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
  
  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/50 mb-4 animate-pulse">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <Loader className="w-6 h-6 text-indigo-400 animate-spin mx-auto"/>
        </div>
      </div>
    );
  }

  // Auth screen (not logged in)
  if (!currentUser) {
    return renderAuthScreen();
  }

  // Data loading
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4"/>
          <p className="text-neutral-400">Se încarcă datele tale...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-neutral-100 flex flex-col md:flex-row transition-colors duration-300`}>
      
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-lg w-full bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-neutral-800">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Bun venit în BioSync Pro!</h2>
              <p className="text-slate-500 dark:text-neutral-400 text-sm">Creat cu pasiune de Cristian Puravu</p>
            </div>
            
            <div className="bg-slate-50 dark:bg-neutral-800 rounded-xl p-4 mb-6 text-sm text-slate-600 dark:text-neutral-300 space-y-3">
              <p>
                <strong className="text-slate-800 dark:text-white">📋 Disclaimer Important:</strong>
              </p>
              <p>
                Această aplicație este creată în scop educațional și de uz personal. Informațiile oferite <strong>nu constituie sfaturi medicale, nutriționale sau psihologice</strong> profesionale.
              </p>
              <p>
                Consultă întotdeauna un specialist calificat înainte de a face schimbări semnificative în stilul tău de viață, dietă sau rutină de sănătate.
              </p>
              <p>
                Utilizarea aplicației se face pe propria răspundere. Creatorul nu își asumă responsabilitatea pentru deciziile luate pe baza informațiilor prezentate.
              </p>
            </div>
            
            <button 
              onClick={acceptDisclaimer}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" /> Am înțeles, continuă
            </button>
            
            <p className="text-center text-xs text-slate-400 dark:text-neutral-500 mt-4">
              © {new Date().getFullYear()} Cristian Puravu. Toate drepturile rezervate.
            </p>
          </div>
        </div>
      )}

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
                { id: 'stats', label: 'Statistici', icon: BarChart3 },
                { id: 'achievements', label: 'Badge-uri', icon: Trophy },
                { id: 'focus', label: 'Focus Zen', icon: Timer },
                { id: 'nutrition', label: 'Nutriție AI', icon: Utensils },
                { id: 'challenges', label: 'Provocări', icon: Flame },
                { id: 'mindfulness', label: 'Minte & Suflet', icon: Smile },
                { id: 'knowledge', label: 'Bibliotecă', icon: BookOpen },
                { id: 'ai-coach', label: 'AI Coach', icon: Zap },
                { id: 'profile', label: 'Profilul Meu', icon: User },
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
            {[{ id: 'dashboard', icon: Activity }, { id: 'stats', icon: BarChart3 }, { id: 'focus', icon: Timer }, { id: 'nutrition', icon: Utensils }, { id: 'challenges', icon: Flame }, { id: 'mindfulness', icon: Smile }, { id: 'ai-coach', icon: Zap }, { id: 'profile', icon: User }].map((item) => (
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
            {activeTab === 'stats' && renderStats()}
            {activeTab === 'achievements' && renderAchievements()}
            {activeTab === 'focus' && renderFocus()}
            {activeTab === 'nutrition' && renderNutrition()}
            {activeTab === 'challenges' && renderChallenges()}
            {activeTab === 'mindfulness' && renderMindfulness()}
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'knowledge' && renderKnowledge()}
            {activeTab === 'ai-coach' && renderAICoach()}
            
            {/* Footer */}
            <footer className="mt-16 mb-24 md:mb-8 py-8 border-t border-slate-200 dark:border-neutral-800 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-slate-400 dark:text-neutral-500 text-sm">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                  <span>Creat cu pasiune de <strong className="text-slate-600 dark:text-neutral-300">Cristian Puravu</strong></span>
                </div>
                <p className="text-xs text-slate-400 dark:text-neutral-600">
                  © {new Date().getFullYear()} BioSync Pro. Toate drepturile rezervate.
                </p>
                <p className="text-xs text-slate-400 dark:text-neutral-600 max-w-md">
                  Informațiile din această aplicație sunt în scop educațional și nu înlocuiesc sfatul medical profesional.
                </p>
              </div>
            </footer>
        </div>
      </main>

      {/* Modals */}
      {showOnboarding && renderOnboarding()}
      {showSleepModal && renderSleepModal()}
      {showMoodModal && renderMoodModal()}
      {renderAchievementNotification()}
    </div>
  );
}