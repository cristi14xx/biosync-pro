# BioSync Pro 🧬

O aplicație de biohacking și wellness care te ajută să îți optimizezi viața prin tracking de obiceiuri, meditație, nutriție și coaching AI.

## 🚀 Funcționalități

- **Dashboard** - Monitorizare scor zilnic, hidratare, obiceiuri
- **Focus Zen** - Timer Pomodoro cu sunete ambient
- **Nutriție AI** - Generator de rețete bazat pe ingrediente
- **Provocări 30 Zile** - Tracker pentru obiceiuri noi
- **Mindfulness** - Exerciții de respirație 4-7-8 + jurnal recunoștință
- **AI Coach** - Chat cu inteligență artificială pentru sfaturi personalizate
- **Bibliotecă** - Articole despre somn, nutriție, focus, longevitate

## 🛠️ Instalare Locală

```bash
# Clonează repository-ul
git clone https://github.com/USERNAME/biosync-pro.git
cd biosync-pro

# Instalează dependențele
npm install

# Creează fișierul .env
cp .env.example .env

# Adaugă cheia API Gemini în .env
# VITE_GEMINI_API_KEY=cheia_ta_aici

# Pornește serverul de dezvoltare
npm run dev
```

## 🌐 Deploy pe Vercel

1. Push codul pe GitHub
2. Conectează repository-ul la Vercel
3. Adaugă variabila `VITE_GEMINI_API_KEY` în Settings → Environment Variables
4. Deploy!

## 📝 Variabile de Mediu

| Variabilă | Descriere |
|-----------|-----------|
| `VITE_GEMINI_API_KEY` | Cheia API pentru Google Gemini |

Obține cheia de la: https://aistudio.google.com/apikey

## 🎨 Tehnologii

- React 18
- Vite
- Tailwind CSS
- Lucide Icons
- Google Gemini API

## 📄 Licență

MIT
