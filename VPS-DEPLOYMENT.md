# Implementare de-vanzare.site pe VPS

Acest document conține instrucțiuni pentru implementarea automată a aplicației de-vanzare.site pe un VPS.

## Metoda simplă (recomandată)

Cel mai simplu mod de implementare este folosind scriptul automat de deployment.

### Pași pentru implementare automată:

1. **Clonează repository-ul pe VPS**:

```bash
git clone https://github.com/eneflorian1/de-vanzare.site.git
cd de-vanzare.site
```

2. **Acordă permisiuni de execuție pentru script**:

```bash
chmod +x deploy.sh
```

3. **Rulează scriptul de deployment**:

```bash
./deploy.sh
```

4. **Urmărește instrucțiunile de pe ecran**:
   - Scriptul va instala toate dependențele necesare
   - Va configura baza de date MySQL
   - Va configura NextAuth
   - Va corecta automat problemele cu importurile dinamice
   - Va construi aplicația
   - Va configura PM2 pentru a menține aplicația pornită
   - Opțional, va configura Nginx ca proxy reverse

## Metoda manuală (pentru utilizatori avansați)

Dacă preferi să controlezi fiecare pas al procesului, poți urma instrucțiunile manuale de mai jos:

### 1. Pregătirea serverului

Asigură-te că ai următoarele instalate pe VPS:
- Node.js (v18 sau mai nou)
- MySQL
- Git
- (opțional) Nginx

```bash
# Instalare Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalare MySQL
sudo apt-get install -y mysql-server

# Instalare Git
sudo apt-get install -y git

# Instalare Nginx (opțional)
sudo apt-get install -y nginx
```

### 2. Configurarea bazei de date

```bash
# Creează baza de date
sudo mysql -e "CREATE DATABASE devanzare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Creează utilizatorul
sudo mysql -e "CREATE USER 'devanzare_user'@'localhost' IDENTIFIED BY 'parola_ta';"

# Acordă drepturi
sudo mysql -e "GRANT ALL PRIVILEGES ON devanzare.* TO 'devanzare_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

### 3. Clonarea și configurarea proiectului

```bash
# Clonează repository-ul
git clone https://github.com/eneflorian1/de-vanzare.site.git
cd de-vanzare.site

# Creează fișierul .env din exemplu
cp .env.example .env

# Editează fișierul .env cu informațiile tale
nano .env
```

Actualizează următoarele variabile în fișierul `.env`:
- `DATABASE_URL`: mysql://devanzare_user:parola_ta@localhost:3306/devanzare
- `NEXTAUTH_URL`: https://domeniul-tau.ro
- `NEXTAUTH_SECRET`: (generează un secret cu `openssl rand -base64 32`)

### 4. Corectarea problemelor cu importurile dinamice

```bash
# Rulează scriptul de corectare a importurilor dinamice
node scripts/auto-fix-nextjs.js
```

### 5. Instalarea și construirea aplicației

```bash
# Instalarea dependențelor
npm install

# Generarea clientului Prisma
npx prisma generate

# Aplicarea schemei bazei de date
npx prisma db push

# Construirea aplicației
npm run build

# Popularea categoriilor
npm run seed:categories
```

### 6. Configurarea PM2 pentru a menține aplicația pornită

```bash
# Instalarea PM2 global
npm install -g pm2

# Pornirea aplicației cu PM2
pm2 start server.js --name "de-vanzare"

# Salvarea configurației PM2
pm2 save

# Configurarea PM2 să pornească la repornirea serverului
pm2 startup
```

### 7. Configurarea Nginx (opțional, dar recomandat pentru producție)

Creează un fișier de configurare pentru Nginx:

```bash
sudo nano /etc/nginx/sites-available/de-vanzare
```

Adaugă următoarea configurație:

```nginx
server {
    listen 80;
    server_name domeniul-tau.ro www.domeniul-tau.ro;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /calea/catre/de-vanzare.site/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }

    location /images/ {
        alias /calea/catre/de-vanzare.site/public/images/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }
}
```

Activează site-ul și repornește Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/de-vanzare /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Configurarea HTTPS cu Let's Encrypt (recomandat pentru producție)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domeniul-tau.ro -d www.domeniul-tau.ro
```

## Depanare

### Eroare: "Element type is invalid. Received a promise that resolves to: undefined."

Această eroare este cauzată de probleme cu importurile dinamice în aplicație.

Soluție: Rulează scriptul de corectare automată:

```bash
node scripts/auto-fix-nextjs.js
npm run build
pm2 restart de-vanzare
```

### Eroare cu baza de date

Dacă întâmpini erori legate de baza de date, verifică:
1. Conexiunea la baza de date este corectă în fișierul `.env`
2. Utilizatorul are drepturi corecte pentru baza de date
3. Schema bazei de date a fost aplicată corect

### Alte probleme

Pentru orice alte probleme, consultă jurnalele aplicației:

```bash
pm2 logs de-vanzare
```

## Actualizări

Pentru a actualiza aplicația la o versiune nouă:

```bash
cd de-vanzare.site
git pull
npm install
npm run build
pm2 restart de-vanzare
``` 