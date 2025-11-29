# 🔥 BioSync Pro cu Firebase

## Pași pentru Setup Firebase (5 minute)

### 1. Creează Proiect Firebase (GRATUIT)

1. Mergi la **https://console.firebase.google.com**
2. Click **"Create a project"** (sau "Adaugă proiect")
3. Numele proiectului: `biosync-pro`
4. Dezactivează Google Analytics (nu e necesar) → **Create Project**
5. Așteaptă ~30 secunde → Click **Continue**

---

### 2. Activează Authentication

1. În meniul din stânga, click **"Build" → "Authentication"**
2. Click **"Get Started"**
3. La "Sign-in providers", click pe **"Email/Password"**
4. Activează primul toggle (Enable) → **Save**

---

### 3. Creează Baza de Date Firestore

1. În meniu, click **"Build" → "Firestore Database"**
2. Click **"Create database"**
3. Alege **"Start in test mode"** → **Next**
4. Selectează locația: **eur3 (europe-west)** → **Enable**

---

### 4. Obține Credențialele Firebase

1. Click pe **rotița ⚙️ (Settings)** lângă "Project Overview"
2. Click **"Project settings"**
3. Scroll jos la **"Your apps"** → click pe iconița **</>** (Web)
4. App nickname: `biosync-web` → **Register app**
5. Vei vedea un cod cu `firebaseConfig`. Copiază valorile:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // <- copiază asta
  authDomain: "biosync-pro.firebaseapp.com",
  projectId: "biosync-pro",
  storageBucket: "biosync-pro.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

### 5. Adaugă în Vercel

1. Mergi la **vercel.com** → proiectul tău → **Settings** → **Environment Variables**
2. Adaugă FIECARE variabilă (una câte una):

| Name | Value |
|------|-------|
| `VITE_FIREBASE_API_KEY` | AIzaSy... (valoarea ta) |
| `VITE_FIREBASE_AUTH_DOMAIN` | biosync-pro.firebaseapp.com |
| `VITE_FIREBASE_PROJECT_ID` | biosync-pro |
| `VITE_FIREBASE_STORAGE_BUCKET` | biosync-pro.appspot.com |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 123456789 |
| `VITE_FIREBASE_APP_ID` | 1:123456789:web:abc123 |

3. Click **Save** pentru fiecare

---

### 6. Upload Codul Nou

În terminal (VS Code):

```bash
cd ~/Downloads/biosync-pro

# Șterge vechiul cod și pune noul
rm -rf src/
rm package.json

# Copiază fișierele din biosync-firebase/
# (sau manual din Finder)
```

Apoi:

```bash
npm install
git add .
git commit -m "Add Firebase authentication"
git push
```

---

### 7. Redeploy în Vercel

După push, Vercel va face automat redeploy. Așteaptă 2 minute.

---

## ✅ Ce funcționează acum:

- 🔐 **Login/Register** cu email și parolă
- ☁️ **Toate datele se salvează în cloud** (Firebase Firestore)
- 📱 **Sincronizare** între dispozitive (telefon + laptop)
- 🔄 **Datele persistă** chiar dacă ștergi browser-ul
- 🌙 **Dark mode** salvat per utilizator
- 📊 **Progresul** (provocări, obiceiuri, jurnal) - totul în cloud

---

## 🆘 Probleme frecvente:

**"Firebase App not initialized"**
→ Verifică că ai pus corect toate variabilele în Vercel

**"Permission denied"**
→ În Firebase Console → Firestore → Rules, pune:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Nu se încarcă aplicația**
→ Verifică în Vercel → Deployments → Logs pentru erori

---

## 📧 Contact

Creat cu ❤️ de Cristian Puravu
