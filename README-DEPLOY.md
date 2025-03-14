# Instrucțiuni de Implementare pentru de-vanzare.site

Acest document conține instrucțiuni pentru implementarea aplicației de-vanzare.site pe un server cPanel.

## Cerințe preliminare

- Acces la un cont cPanel
- Node.js instalat pe server (versiunea recomandată: 18.x sau mai nouă)
- Acces SSH la server (opțional, dar recomandat)
- Bază de date MySQL

## Pași de implementare

### 1. Pregătirea codului pentru producție

Înainte de a încărca codul pe server, rulați următoarele comenzi pe mașina locală:

```bash
# Instalați dependențele
npm install

# Generați fișierele Prisma
npm run prisma:generate

# Verificați și creați directorul de încărcări
npm run ensure:uploads

# Compilați aplicația pentru producție
npm run build

# Sau folosiți comanda combinată
npm run prepare:deploy
```

### 2. Încărcarea fișierelor pe server

Încărcați toate fișierele proiectului pe server folosind una din următoarele metode:
- Managerul de fișiere cPanel
- FTP (FileZilla, etc.)
- Git (dacă este disponibil pe server)
- Arhivă ZIP (încărcați și extrageți pe server)

Asigurați-vă că încărcați toate fișierele, inclusiv:
- Directoarele `.next`, `node_modules`, `public`, `prisma`
- Fișierele `.env`, `server.js`, `.htaccess`, `app-start`, etc.

### 3. Configurarea bazei de date

1. Creați o bază de date MySQL în cPanel
2. Creați fișierul `.env` folosind `.env.example` ca model și actualizați-l cu informațiile de conectare la baza de date:

```
# Copiați conținutul din .env.example în .env și actualizați valorile
cp .env.example .env

# Editați fișierul .env cu informațiile corecte
DATABASE_URL="mysql://username:password@localhost:3306/numele_bazei_de_date"
NEXTAUTH_URL="https://de-vanzare.ro"
```

3. Generați un secret sigur pentru NextAuth:

```bash
npm run generate:secret
```

Copiați secretul generat în fișierul `.env`:

```
NEXTAUTH_SECRET="secretul_generat_aici"
```

4. Rulați migrarea bazei de date (dacă aveți acces SSH):

```bash
npm run prisma:push
```

Alternativ, puteți rula migrarea local și apoi exporta/importa baza de date.

### 4. Configurarea permisiunilor fișierelor

Asigurați-vă că fișierele au permisiunile corecte:

```bash
# Faceți fișierul app-start executabil
chmod +x app-start

# Setați permisiunile pentru directorul de încărcări
chmod -R 755 public/uploads

# Setați permisiunile pentru fișierele de configurare
chmod 644 .htaccess
chmod 644 .user.ini
chmod 600 .env
```

### 5. Pornirea aplicației Node.js

#### Metoda 1: Pornirea manuală a aplicației

Pentru a porni aplicația manual, folosiți una din următoarele comenzi:

```bash
# Pentru Linux/Mac
npm run start

# Pentru Windows
npm run start:win

# Sau direct
node server.js
```

#### Metoda 2: Utilizarea scriptului app-start

Puteți folosi scriptul `app-start` pentru a porni aplicația:

```bash
chmod +x app-start
./app-start
```

#### Metoda 3: Configurarea unui serviciu pentru a menține aplicația pornită

Pentru a vă asigura că aplicația rămâne pornită și repornește automat în caz de eroare, puteți configura un cron job:

```
@reboot cd /home/username/public_html && ./app-start > app.log 2>&1
```

Sau puteți folosi un manager de procese precum PM2 (dacă este disponibil pe server):

```bash
# Instalați PM2 (dacă nu este deja instalat)
npm install -g pm2

# Porniți aplicația cu PM2
pm2 start server.js --name "de-vanzare"

# Configurați PM2 să pornească automat la repornirea serverului
pm2 startup
pm2 save
```

### 6. Configurarea domeniului și rezolvarea problemelor

1. În cPanel, navigați la "Domains" sau "Subdomains"
2. Adăugați domeniul `de-vanzare.ro` și direcționați-l către directorul aplicației

3. **Rezolvarea problemelor comune**:
   
   **Eroare 503 Service Unavailable**:
   - Verificați dacă aplicația Node.js rulează: `ps aux | grep node`
   - Verificați jurnalele aplicației pentru erori
   - Asigurați-vă că portul specificat în `.htaccess` (3000) corespunde cu portul pe care rulează aplicația
   - Verificați dacă modulul `mod_proxy` este activat pe server
   - Încercați să reporniți aplicația Node.js

   **Eroare "We're sorry, but something went wrong"**:
   - Verificați dacă aplicația Node.js rulează și ascultă pe portul corect
   - Verificați jurnalele aplicației pentru erori
   - Asigurați-vă că serverul Node.js ascultă pe toate interfețele (`0.0.0.0`) și nu doar pe localhost
   - Verificați dacă `.htaccess` este configurat corect pentru a redirecționa cererile către aplicația Node.js

   **Probleme cu fișierele statice**:
   - Asigurați-vă că directoarele `.next` și `public` au permisiunile corecte
   - Verificați regulile din `.htaccess` pentru servirea fișierelor statice

### 7. Verificarea implementării

1. Accesați site-ul la adresa `https://de-vanzare.ro`
2. Verificați jurnalele de erori în cPanel dacă întâmpinați probleme
3. Testați ruta `/health` pentru a verifica dacă aplicația Node.js răspunde: `https://de-vanzare.ro/health`
4. Rulați scriptul de verificare a serverului pentru a diagnostica probleme (dacă aveți acces SSH):

```bash
npm run check:server
```

## Rezolvarea problemelor

### Aplicația nu pornește
- Verificați jurnalele Node.js
- Asigurați-vă că toate dependențele sunt instalate
- Verificați configurarea `.env`
- Verificați dacă portul specificat este disponibil
- Încercați să porniți manual aplicația: `node server.js`

### Eroare 503 Service Unavailable sau "We're sorry, but something went wrong"
- Verificați dacă aplicația Node.js rulează
- Verificați jurnalele pentru erori
- Asigurați-vă că portul specificat în `.htaccess` corespunde cu portul pe care rulează aplicația
- Verificați dacă modulul `mod_proxy` este activat pe server
- Asigurați-vă că serverul Node.js ascultă pe toate interfețele (`0.0.0.0`) și nu doar pe localhost
- Verificați dacă există alte procese care folosesc același port

### Erori de bază de date
- Verificați conexiunea la baza de date
- Asigurați-vă că schema bazei de date este corectă
- Verificați dacă utilizatorul bazei de date are permisiunile necesare

### Probleme cu fișierele statice
- Verificați permisiunile directoarelor `public` și `.next`
- Asigurați-vă că regulile din `.htaccess` pentru fișierele statice sunt corecte
- Verificați dacă fișierele statice au fost încărcate corect pe server

### Erori 500 sau pagină albă
- Verificați jurnalele de erori
- Verificați dacă aplicația Next.js a fost compilată corect
- Asigurați-vă că fișierul `.next` a fost încărcat complet

## Mentenanță

### Actualizarea aplicației
Pentru a actualiza aplicația, urmați acești pași:

1. Opriți aplicația Node.js
2. Încărcați noile fișiere
3. Rulați `npm install` și `npm run build` (dacă aveți acces SSH)
4. Reporniți aplicația Node.js

### Backup
Efectuați backup regulat pentru:
- Baza de date
- Fișierele încărcate (`public/uploads`)
- Codul sursă

## Fișiere importante

| Fișier | Descriere |
|--------|-----------|
| `server.js` | Serverul Express care servește aplicația Next.js |
| `.htaccess` | Configurație Apache pentru redirecționarea cererilor către aplicația Node.js |
| `.user.ini` | Configurație PHP pentru cPanel |
| `app-start` | Script pentru pornirea aplicației Node.js |
| `.env` | Variabile de mediu pentru aplicație |
| `.env.example` | Exemplu de variabile de mediu |

## Rezumat al scripturilor disponibile

| Comandă | Descriere |
|---------|-----------|
| `npm run dev` | Pornește serverul de dezvoltare |
| `npm run build` | Compilează aplicația pentru producție |
| `npm run start` | Pornește serverul în modul producție (Linux/Mac) |
| `npm run start:win` | Pornește serverul în modul producție (Windows) |
| `npm run ensure:uploads` | Verifică și creează directorul de încărcări |
| `npm run prepare:deploy` | Pregătește aplicația pentru deploy (ensure:uploads + build) |
| `npm run check:server` | Verifică starea serverului și a serviciilor necesare |
| `npm run generate:secret` | Generează un secret sigur pentru NextAuth |
| `npm run prisma:generate` | Generează clientul Prisma |
| `npm run prisma:push` | Actualizează schema bazei de date |
| `npm run prisma:studio` | Deschide Prisma Studio pentru gestionarea bazei de date |

## Contacte pentru suport

Pentru asistență tehnică, contactați administratorul sistemului la adresa de email: [adresa_email] 