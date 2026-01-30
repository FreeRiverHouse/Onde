# Competitive Landscape

## Market Overview

SASE/SD-WAN market leaders by category:

### Pure-Play SASE
- **Versa Networks** - Single-stack SASE, carrier-grade
- **Cato Networks** - Cloud-native, global backbone
- **Palo Alto Prisma** - Acquired CloudGenix for SD-WAN

### Security-First SSE
- **Zscaler** - ZIA/ZPA, no native SD-WAN (partner required)
- **Netskope** - CASB heritage, strong DLP

### SD-WAN First
- **VMware VeloCloud** - Large install base, NSX integration
- **Fortinet** - Security DNA, appliance-heavy
- **Cisco Viptela** - Enterprise incumbent

## Quick Comparison Matrix

| Vendor | SD-WAN | ZTNA | SWG | CASB | FWaaS | Single Stack |
|--------|--------|------|-----|------|-------|--------------|
| Versa | ✅ Native | ✅ | ✅ | ✅ | ✅ | ✅ |
| Palo Alto | Acquired | ✅ | ✅ | ✅ | ✅ | ❌ (3+ products) |
| Zscaler | ❌ Partner | ✅ | ✅ | ✅ | ✅ | ❌ (no SD-WAN) |
| Cato | ✅ | ✅ | ✅ | Limited | ✅ | ✅ |
| Fortinet | ✅ | ✅ | ✅ | Limited | ✅ | ❌ (appliance) |

## Key Differentiators by Competitor

### vs Palo Alto (Prisma SASE)
**Their Story:** "Best-of-breed security, acquired SD-WAN"
**Reality:**
- 3+ disparate products (Prisma Access, CloudGenix, Prisma SaaS)
- Different management consoles
- Integration still in progress
- Premium pricing

**Counter:** Single-stack vs frankenstack. How many consoles? What's your integration timeline?

### vs Zscaler
**Their Story:** "Born in the cloud, largest security cloud"
**Reality:**
- No native SD-WAN (requires partner: Aruba, VMware, etc.)
- Two vendors = two contracts, two support, two consoles
- ZPA requires agent for ZTNA

**Counter:** How do you do SD-WAN? Who owns the packet between sites? What's your branch story?

### vs Cato Networks
**Their Story:** "Cloud-native SASE, global backbone"
**Reality:**
- Smaller PoP footprint
- Limited on-prem options (some customers need it)
- Less mature for large enterprise
- No carrier-grade features

**Counter:** What's your carrier/MSP story? On-prem options? Enterprise scale?

### vs Fortinet
**Their Story:** "ASIC-powered security, best TCO"
**Reality:**
- Appliance-centric (box at every site)
- FortiSASE is newer, less mature
- Complex licensing (FortiGate, FortiManager, FortiAnalyzer, FortiSASE...)

**Counter:** How many appliances? What's your cloud story? Single console?

## Handling FUD (Fear, Uncertainty, Doubt)

### "Versa is too small"
→ $X00M ARR, 500+ enterprise customers, 100+ service providers, growing faster than market

### "We need best-of-breed"
→ Integration tax is real. Single stack = lower TCO, faster deployment, simpler ops

### "We're already invested in [competitor]"
→ Respect sunk cost, but evaluate total cost of keeping vs switching. Migration support available.
