# Finetuning Data Directory

Questa directory contiene dati per l'agente di fine-tuning degli algoritmi di betting.

## Alert Tecnici (NON vanno a Mattia!)

Gli alert tecnici/analitici vengono salvati qui invece di essere mandati su Telegram:

| Alert File | Tipo | Uso |
|------------|------|-----|
| `momentum-divergence.jsonl` | Divergenze prezzo/RSI | Training segnali inversione |
| `momentum-change.jsonl` | Flip bullish/bearish | Training trend detection |
| `regime-change.jsonl` | Cambio regime mercato | Training regime classifier |
| `vol-calibration.jsonl` | Volatilità realizzata vs attesa | Tuning parametri vol |
| `momentum-reversion.jsonl` | Segnali mean reversion | Training reversion signals |
| `momentum-aligned.jsonl` | Full alignment timeframes | Training high-conviction signals |
| `whipsaw.jsonl` | Mercato choppy detected | Training choppy filter |
| `extreme-vol.jsonl` | Trade durante alta vol | Analisi performance in vol |
| `price-spread.jsonl` | Spread anomali cross-exchange | Arbitrage detection |

## Formato JSONL

Ogni file è in formato JSON Lines (una entry JSON per riga):

```json
{"timestamp": "2026-01-29T11:54:00Z", "asset": "BTC", "signal": "bearish_divergence", "rsi": 32.0, "price": 87896, "confidence": "medium", "details": {...}}
```

## Come Usare

L'agente di fine-tuning può:
1. Leggere questi file per analisi
2. Correlare segnali con outcome reali
3. Proporre modifiche ai parametri

## Retention

I file vengono mantenuti per 30 giorni, poi archiviati in `data/finetuning/archive/`.
