#!/bin/bash

# Script de deployment automat pentru de-vanzare.site
# Acest script va face toate operațiunile necesare pentru 
# a configura și porni aplicația pe VPS

# Culori pentru output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funcție pentru afișarea mesajelor
function log_message() {
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

function log_success() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

function log_error() {
  echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

function log_warning() {
  echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Verifică dacă Node.js este instalat
function check_node() {
  log_message "Verificăm versiunea Node.js..."
  if ! command -v node &> /dev/null; then
    log_error "Node.js nu este instalat!"
    log_message "Instalăm Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
  
  local node_version=$(node -v)
  log_success "Node.js versiunea $node_version este instalată!"
}

# Configurare MySQL
function setup_database() {
  log_message "Setăm baza de date MySQL..."
  
  # Verificare dacă MySQL este instalat
  if ! command -v mysql &> /dev/null; then
    log_error "MySQL nu este instalat! Instalăm acum..."
    sudo apt-get update
    sudo apt-get install -y mysql-server
  fi
  
  # Preluare credențiale pentru baza de date
  read -p "Numele utilizatorului MySQL: " DB_USER
  read -sp "Parola utilizatorului MySQL: " DB_PASS
  echo ""
  read -p "Numele bazei de date: " DB_NAME
  
  log_message "Creăm baza de date și utilizatorul..."
  
  # Creează baza de date și utilizatorul (presupunem că avem acces root)
  sudo mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
  sudo mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
  sudo mysql -e "FLUSH PRIVILEGES;"
  
  # Testare conexiune
  if mysql -u $DB_USER -p$DB_PASS -e "USE $DB_NAME;" &> /dev/null; then
    log_success "Baza de date a fost configurată cu succes!"
  else
    log_error "Nu s-a putut accesa baza de date cu credențialele furnizate."
    exit 1
  fi
  
  # Actualizează .env cu informațiile bazei de date
  if [ -f .env.example ]; then
    cp .env.example .env
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"mysql://$DB_USER:$DB_PASS@localhost:3306/$DB_NAME\"|" .env
    log_success "Fișierul .env a fost actualizat cu credențialele bazei de date."
  else
    log_error "Fișierul .env.example nu a fost găsit!"
    exit 1
  fi
}

# Configurare NextAuth
function setup_nextauth() {
  log_message "Configurăm NextAuth..."
  
  # Generare secret pentru NextAuth
  local SECRET=$(openssl rand -base64 32)
  
  # Actualizare fișier .env cu secretul generat
  sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$SECRET\"|" .env
  
  # Adăugare URL NEXTAUTH
  read -p "Introduceți domeniul site-ului (ex: https://de-vanzare.ro): " DOMAIN
  sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=\"$DOMAIN\"|" .env
  
  log_success "NextAuth configurat cu succes!"
}

# Instalare și configurare
function setup_app() {
  log_message "Instalăm dependențele aplicației..."
  npm install
  
  log_message "Generăm clientul Prisma..."
  npx prisma generate
  
  log_message "Aplicăm schema la baza de date..."
  npx prisma db push
  
  log_message "Creăm directoarele necesare..."
  mkdir -p public/uploads
  chmod -R 755 public/uploads
  
  log_message "Rulăm scriptul de corectare a importurilor dinamice..."
  node scripts/auto-fix-nextjs.js
  
  log_message "Construim aplicația..."
  npm run build
  
  log_message "Populăm categoriile..."
  npm run seed:categories
  
  log_success "Aplicația a fost configurată cu succes!"
}

# Setare PM2 pentru gestionarea proceselor
function setup_pm2() {
  log_message "Configurăm PM2 pentru a menține aplicația pornită..."
  
  if ! command -v pm2 &> /dev/null; then
    log_message "Instalăm PM2..."
    npm install -g pm2
  fi
  
  pm2 stop de-vanzare 2>/dev/null || true
  pm2 delete de-vanzare 2>/dev/null || true
  
  pm2 start server.js --name "de-vanzare"
  pm2 save
  
  # Configurare PM2 să pornească la repornirea serverului
  pm2 startup | tail -n 1 > pm2-startup.sh
  chmod +x pm2-startup.sh
  ./pm2-startup.sh
  rm pm2-startup.sh
  
  log_success "PM2 configurat cu succes! Aplicația va porni automat la repornirea serverului."
}

# Configurare Nginx dacă este disponibil
function setup_nginx() {
  if command -v nginx &> /dev/null; then
    log_message "Nginx detectat, configurăm proxy reverse..."
    
    read -p "Introduceți numele domeniului (ex: de-vanzare.ro): " DOMAIN_NAME
    
    # Creăm configurația Nginx pentru site
    local NGINX_CONF="/etc/nginx/sites-available/$DOMAIN_NAME"
    
    sudo tee $NGINX_CONF > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Servește fișierele statice direct
    location /uploads/ {
        alias $(pwd)/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }

    # Servește alte fișiere statice din folderul public
    location /images/ {
        alias $(pwd)/public/images/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }
}
EOF
    
    # Activăm site-ul
    sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
    
    # Verificăm configurația Nginx
    if sudo nginx -t; then
      sudo systemctl reload nginx
      log_success "Nginx configurat cu succes pentru domeniul $DOMAIN_NAME!"
    else
      log_error "Configurația Nginx conține erori. Verificați manual."
    fi
  else
    log_warning "Nginx nu este instalat. Aplicația va rula doar pe portul 3000."
    log_warning "Pentru producție, recomandăm instalarea Nginx ca proxy reverse."
  fi
}

# Funcția principală
function main() {
  log_message "Începe procesul de instalare pentru de-vanzare.site..."
  
  # 1. Verifică Node.js
  check_node
  
  # 2. Configurare bază de date
  setup_database
  
  # 3. Configurare NextAuth
  setup_nextauth
  
  # 4. Instalare și configurare aplicație
  setup_app
  
  # 5. Configurare PM2
  setup_pm2
  
  # 6. Configurare Nginx (opțional)
  read -p "Doriți să configurați Nginx pentru proxy reverse? (y/n): " SETUP_NGINX
  if [[ $SETUP_NGINX == "y" ]] || [[ $SETUP_NGINX == "Y" ]]; then
    setup_nginx
  fi
  
  # Afișează informații finale
  log_success "==================================================="
  log_success "  Instalarea de-vanzare.site a fost finalizată!    "
  log_success "==================================================="
  log_message "Aplicația rulează acum pe portul 3000."
  
  if [[ $SETUP_NGINX == "y" ]] || [[ $SETUP_NGINX == "Y" ]]; then
    log_message "Site-ul ar trebui să fie accesibil la http://$DOMAIN_NAME/"
    log_message "Configurați certificatul SSL folosind Let's Encrypt pentru HTTPS."
  else
    log_message "Accesați aplicația la http://IP_SERVER:3000/"
  fi
  
  log_message "Pentru a gestiona aplicația, folosiți următoarele comenzi:"
  log_message "  - pm2 status - pentru a vedea starea aplicației"
  log_message "  - pm2 logs de-vanzare - pentru a vedea jurnalele aplicației"
  log_message "  - pm2 restart de-vanzare - pentru a reporni aplicația"
  
  log_success "Mulțumim pentru utilizarea de-vanzare.site!"
}

# Rulare script
main 