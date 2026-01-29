# Workflow Disabilitati

**Data:** 2026-01-28
**Motivo:** GitHub Actions consuma minuti a pagamento

Questi workflow sono stati disabilitati per evitare costi.
Il deploy ora avviene SOLO via Wrangler CLI (gratuito).

## Se servono di nuovo:
```bash
mv .github/workflows-disabled/*.yml .github/workflows/
```

## Metodo deploy attuale:
Vedi `tools/tech-support/DEPLOY-PROCEDURES.md`
