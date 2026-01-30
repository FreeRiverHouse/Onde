# SD-WAN (Software-Defined Wide Area Network)

## Definition
SD-WAN applies software-defined networking (SDN) principles to WAN connectivity, enabling centralized control, transport independence, and application-aware routing.

## Core Capabilities

### Transport Independence
- Use any transport: MPLS, broadband, LTE/5G, satellite
- Abstract physical circuits into virtual overlays
- Active-active utilization vs active-passive failover

### Centralized Management
- Single pane of glass for all sites
- Zero-touch provisioning (ZTP)
- Template-based configuration at scale

### Application-Aware Routing
- Deep packet inspection (DPI)
- Per-application steering policies
- Dynamic path selection based on SLA

### Security Integration
- Built-in firewall capabilities
- Encrypted tunnels (IPsec, TLS)
- Segmentation and micro-segmentation

## Key Metrics

| Metric | Description | Threshold |
|--------|-------------|-----------|
| Latency | Round-trip time | <50ms for voice |
| Jitter | Latency variation | <30ms for video |
| Packet Loss | Dropped packets | <1% for real-time |
| MOS | Mean Opinion Score | >4.0 for voice |

## SD-WAN vs Traditional WAN

| Aspect | Traditional | SD-WAN |
|--------|-------------|--------|
| Transport | MPLS only | Any (MPLS, broadband, LTE) |
| Provisioning | Weeks/months | Minutes (ZTP) |
| Routing | Static | Dynamic, app-aware |
| Management | Per-device CLI | Centralized GUI |
| Cost | High (MPLS circuits) | Lower (broadband + overlay) |

## Deployment Models

### DIY (Do-It-Yourself)
- Customer manages hardware + software
- Full control, more operational burden

### Managed Service
- MSP/carrier manages infrastructure
- SLA-backed, less control

### Co-Managed
- Shared responsibility model
- Customer configures policy, MSP handles ops

## Common Deployment Scenarios

1. **MPLS Augmentation** - Add broadband to existing MPLS
2. **MPLS Replacement** - Full migration to internet-only
3. **Branch Consolidation** - Replace router + firewall stacks
4. **Multi-Cloud** - Connect HQ/branch to AWS, Azure, GCP
5. **M&A Integration** - Quickly integrate acquired sites
