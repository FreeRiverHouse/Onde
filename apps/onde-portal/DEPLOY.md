# Deploy Onde Portal su Mac Locale

## Prerequisiti

- Node.js 18+
- npm o pnpm
- Porta 3000 libera (o altra porta)

---

## Deploy Locale (Sviluppo)

### 1. Installare dipendenze
```bash
cd /Users/mattia/Projects/Onde/apps/onde-portal
npm install
```

### 2. Avviare in modalita sviluppo
```bash
npm run dev
```

### 3. Accedere
- URL: http://localhost:3000

---

## Deploy Locale (Produzione)

### 1. Build del progetto
```bash
npm run build
```

### 2. Avviare in produzione
```bash
npm run start
```

### 3. Avvio automatico con PM2 (raccomandato)
```bash
# Installare PM2 globalmente
npm install -g pm2

# Avviare con PM2
pm2 start npm --name "onde-portal" -- start

# Salvare configurazione
pm2 save

# Avvio automatico al boot
pm2 startup
```

---

## Dominio Locale con /etc/hosts

### 1. Aggiungere entry
```bash
sudo nano /etc/hosts
```

Aggiungere:
```
127.0.0.1 onde.local
127.0.0.1 books.onde.local
```

### 2. Accedere con dominio locale
- http://onde.local:3000

---

## SSL Locale con mkcert

### 1. Installare mkcert
```bash
brew install mkcert
mkcert -install
```

### 2. Generare certificati
```bash
cd /Users/mattia/Projects/Onde/apps/onde-portal
mkcert onde.local books.onde.local localhost
```

### 3. Usare con Caddy (reverse proxy)
```bash
brew install caddy
```

Creare Caddyfile:
```
onde.local {
    reverse_proxy localhost:3000
    tls internal
}

books.onde.local {
    reverse_proxy localhost:3000
    tls internal
}
```

Avviare Caddy:
```bash
caddy run
```

---

## Script di Deploy Automatico

### start-production.sh
```bash
#!/bin/bash
cd /Users/mattia/Projects/Onde/apps/onde-portal
npm run build
pm2 start npm --name "onde-portal" -- start
echo "Onde Portal avviato su http://localhost:3000"
```

---

## Verifica Deploy

1. [ ] npm install completato senza errori
2. [ ] npm run build completato
3. [ ] Server avviato su porta 3000
4. [ ] Homepage accessibile
5. [ ] Catalogo carica correttamente
6. [ ] Filtri funzionanti

---

## Troubleshooting

### Porta gia in uso
```bash
# Trovare processo su porta 3000
lsof -i :3000

# Terminare processo
kill -9 <PID>
```

### Errori di build
```bash
# Pulire cache
rm -rf .next
npm run build
```

### PM2 non funziona
```bash
# Verificare status
pm2 status

# Vedere log
pm2 logs onde-portal

# Restart
pm2 restart onde-portal
```

---

*Creato: 2026-01-09*
*Task: onde-books-006*
