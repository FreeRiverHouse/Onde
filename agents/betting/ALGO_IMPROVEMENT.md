# Algoritmo Betting Improvement

## Status Attuale
- **Portfolio**: ~$13.65 (partito da ~$6)
- **Strategia**: Edge-based microbetting su crypto daily markets
- **Edge detection**: Confronto prezzo attuale vs threshold + buffer

## Algoritmo Corrente (v1)
```python
# Per ogni mercato crypto:
if asset_price > threshold + buffer:
    # Asset sopra threshold → YES dovrebbe vincere
    if yes_ask <= 90:
        edge = (100 - yes_ask) / yes_ask
        # Compra YES se edge > 10%

elif asset_price < threshold - buffer:
    # Asset sotto threshold → NO dovrebbe vincere
    no_price = 100 - yes_bid
    if no_price <= 90:
        edge = (100 - no_price) / no_price
        # Compra NO se edge > 10%
```

## Miglioramenti Proposti

### 1. Kelly Criterion per Sizing
```python
# Kelly formula: f* = (bp - q) / b
# b = odds (payout ratio)
# p = probability of winning
# q = 1 - p

def kelly_fraction(prob_win, odds):
    b = odds  # e.g., if price=60¢, odds = 40/60 = 0.67
    p = prob_win
    q = 1 - p
    return (b * p - q) / b

# Usa half-Kelly per safety
position_size = kelly_fraction(prob, odds) * 0.5 * bankroll
```

### 2. Volatility-Adjusted Buffer
```python
# Buffer dinamico basato su volatilità BTC/ETH
import numpy as np

def get_volatility(prices_24h):
    returns = np.diff(np.log(prices_24h))
    return np.std(returns) * np.sqrt(24)  # annualized

# Buffer = 2 * volatility * current_price
buffer = 2 * volatility * asset_price
```

### 3. Time Decay Factor
```python
# Mercati che scadono presto hanno meno tempo per muoversi
from datetime import datetime

def time_decay_factor(expiry_time):
    hours_left = (expiry_time - datetime.now()).total_seconds() / 3600
    if hours_left < 1:
        return 0.5  # Meno aggressivo
    elif hours_left < 4:
        return 0.75
    else:
        return 1.0
```

### 4. ICA/PCA per Portfolio Optimization

**Idea**: Usare Independent Component Analysis per trovare fattori latenti che guidano i mercati Kalshi e costruire portfolio decorrelati.

```python
from sklearn.decomposition import FastICA, PCA

# Raccogli price history di N mercati
# X = matrice (time_steps, n_markets)

# PCA: trova componenti principali
pca = PCA(n_components=5)
principal_components = pca.fit_transform(X)

# ICA: trova sorgenti indipendenti
ica = FastICA(n_components=5)
independent_sources = ica.fit_transform(X)

# Usa componenti per:
# 1. Hedging: posizioni opposte su mercati correlati
# 2. Diversificazione: allocare su componenti indipendenti
# 3. Arbitraggio: sfruttare mispricing tra mercati correlati
```

### 5. Whale Detection (senza leaderboard)
```python
# Monitora volume spike sui mercati
# Se volume >> media → qualcuno grosso sta entrando

def detect_whale_activity(market):
    current_volume = market.get("volume", 0)
    avg_volume = market.get("volume_24h_avg", current_volume)
    
    if current_volume > avg_volume * 3:
        # Volume spike! Follow the whale
        return True
    return False
```

## Prossimi Step

1. [ ] Implementare Kelly criterion sizing
2. [ ] Aggiungere volatility da CoinGecko API
3. [ ] Time decay per mercati vicini a scadenza
4. [ ] Raccogliere dati per ICA analysis
5. [ ] Creare dashboard monitoring

## Note
- Fee Kalshi: 2¢ per contratto (importante per micro-sizing!)
- Spread bid-ask può essere ampio su mercati illiquidi
- Considerare slippage per ordini > 10 contratti
