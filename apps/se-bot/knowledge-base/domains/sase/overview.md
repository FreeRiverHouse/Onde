# SASE (Secure Access Service Edge)

## Definition
SASE (pronounced "sassy") is a network architecture that combines WAN capabilities with cloud-native security functions delivered as a service.

Coined by Gartner in 2019, SASE converges:
- **SD-WAN** - Software-defined wide area networking
- **SWG** - Secure Web Gateway
- **CASB** - Cloud Access Security Broker  
- **FWaaS** - Firewall as a Service
- **ZTNA** - Zero Trust Network Access

## Key Principles

### Identity-Centric
- Access based on user/device identity, not network location
- Continuous authentication and authorization
- Context-aware policies (location, device posture, risk)

### Cloud-Native
- Security delivered from cloud PoPs globally
- Elastic scalability
- Consistent policy enforcement worldwide

### Converged Architecture
- Single platform vs point solutions
- Unified policy management
- Reduced complexity and TCO

## Business Drivers

1. **Remote Work** - Secure access from anywhere
2. **Cloud Migration** - Direct cloud access without backhauling
3. **Branch Transformation** - Replace MPLS + appliance stacks
4. **Zero Trust** - Move beyond perimeter security
5. **Operational Efficiency** - Single vendor, single console

## Architecture Comparison

### Traditional (Hub-and-Spoke)
```
Branch → MPLS → HQ Datacenter → Internet/Cloud
         ↓
    [Firewall Stack]
```
Problems: Latency, hairpinning, appliance sprawl

### SASE Architecture  
```
Branch → SD-WAN → Nearest SASE PoP → Internet/Cloud
User   →              ↓
                [Cloud Security]
```
Benefits: Low latency, direct-to-cloud, consistent security

## Common Questions

**Q: SASE vs SSE?**
A: SSE (Security Service Edge) is the security portion of SASE without SD-WAN. Gartner created SSE for vendors that only do security. Full SASE = SD-WAN + SSE.

**Q: Single vendor vs best-of-breed?**
A: Single vendor provides integration, simplicity, single pane of glass. Best-of-breed means managing multiple vendors, APIs, policies. Trend is toward convergence.

**Q: Timeline for SASE adoption?**
A: Gartner predicts 80% of enterprises will have SASE/SSE strategy by 2025. Most are in pilot or early rollout phase today.
