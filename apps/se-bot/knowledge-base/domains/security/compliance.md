# Compliance Frameworks

## Overview
SASE solutions must support regulatory compliance requirements. This document covers key frameworks and how network security addresses them.

---

## HIPAA (Healthcare)

### What is HIPAA?
- Health Insurance Portability and Accountability Act
- Protects PHI (Protected Health Information)
- Applies to: Healthcare providers, insurers, business associates

### HIPAA Security Rule Requirements

| Requirement | SASE Capability |
|-------------|-----------------|
| Access Controls | ZTNA with MFA, RBAC |
| Audit Controls | Comprehensive logging, SIEM integration |
| Transmission Security | TLS 1.3 encryption, secure tunnels |
| Integrity Controls | DLP, content inspection |
| Person/Entity Auth | Identity-based policies, SSO |

### Key HIPAA Talking Points
- **Encryption**: All PHI encrypted in transit and at rest
- **Audit Logs**: Complete access trail for all PHI
- **Access Control**: Least privilege, role-based access
- **Business Associate**: BAA agreements available
- **Breach Notification**: Incident detection and alerting

### Common HIPAA Questions

**Q: Do you sign a BAA?**
A: Yes, Versa provides Business Associate Agreements for HIPAA-covered entities.

**Q: Where is data processed?**
A: Data can be processed in US-only POPs with data residency controls.

**Q: How long are logs retained?**
A: Configurable retention up to 7 years (HIPAA requires 6 years).

---

## PCI-DSS (Payment Card Industry)

### What is PCI-DSS?
- Payment Card Industry Data Security Standard
- Protects cardholder data
- Applies to: Any organization handling credit card data

### PCI-DSS v4.0 Requirements

| Requirement | Description | SASE Solution |
|-------------|-------------|---------------|
| 1 | Install firewall | FWaaS, micro-segmentation |
| 2 | Secure config | Hardened by default |
| 3 | Protect stored data | Encryption, DLP |
| 4 | Encrypt transmission | TLS 1.3, IPsec |
| 5 | Anti-malware | Inline threat inspection |
| 6 | Secure systems | Patch management |
| 7 | Restrict access | ZTNA, least privilege |
| 8 | Identify users | MFA, identity integration |
| 9 | Physical access | Cloud-native, no hardware |
| 10 | Logging | Full audit trail |
| 11 | Security testing | Vulnerability scanning |
| 12 | Security policy | Policy enforcement |

### PCI Scope Reduction
- SASE can reduce PCI scope by:
  - Segmenting cardholder data environment
  - Encrypting all transmission
  - Providing access only to authorized users
  - Logging all access for audit

### Key PCI Talking Points
- **Segment the CDE**: Micro-segmentation isolates cardholder data
- **Encrypt Everything**: TLS 1.3 for all traffic
- **Log All Access**: Complete audit trail for QSA review
- **Multi-Factor Auth**: Required for all remote access to CDE

---

## GDPR (European Data Protection)

### What is GDPR?
- General Data Protection Regulation (EU)
- Protects personal data of EU residents
- Applies to: Any organization handling EU personal data

### Key GDPR Principles

| Principle | SASE Support |
|-----------|--------------|
| Lawful Processing | Access control, consent tracking |
| Purpose Limitation | DLP policies per data type |
| Data Minimization | Content-aware policies |
| Accuracy | Data integrity controls |
| Storage Limitation | Retention policies |
| Security | Encryption, access control |
| Accountability | Audit logging, reporting |

### Data Residency
- **EU POPs**: Data processed in EU only
- **Data Sovereignty**: No cross-border data transfer
- **Sub-processor List**: Transparent third-party list

### GDPR-Specific Features
- **Right to Access**: API for data subject requests
- **Right to Erasure**: Data deletion workflows
- **Breach Notification**: 72-hour alerting capability
- **DPO Support**: Compliance reporting dashboard

### Key GDPR Talking Points
- **EU Data Residency**: Traffic stays in EU POPs
- **DLP**: Prevent unauthorized data export
- **Breach Detection**: Automated alerting within 72 hours
- **Audit Trail**: Complete log of personal data access

---

## SOC 2 Type II

### What is SOC 2?
- Service Organization Control report
- Covers: Security, Availability, Processing Integrity, Confidentiality, Privacy
- Type II: Audit over period of time (vs point-in-time)

### SOC 2 Trust Service Criteria

| Criteria | SASE Capabilities |
|----------|-------------------|
| Security | Access control, encryption, threat protection |
| Availability | HA architecture, SLA guarantees |
| Processing Integrity | Input validation, error handling |
| Confidentiality | Encryption, DLP, access control |
| Privacy | Data handling, consent management |

### SOC 2 Talking Points
- **Third-Party Audit**: Independent auditor verification
- **Continuous Compliance**: Type II covers 12-month period
- **Bridge Letter**: Available between audit periods
- **Customer Audit**: Right to audit provisions

---

## FedRAMP (US Government)

### What is FedRAMP?
- Federal Risk and Authorization Management Program
- Required for cloud services selling to US government
- Levels: Low, Moderate, High impact

### FedRAMP Compliance Path
1. **In Progress**: Documentation and implementation
2. **Ready**: Completed, seeking authorization
3. **Authorized**: ATO granted by agency
4. **In PMO Review**: JAB authorization path

### FedRAMP Talking Points
- **Authorization Status**: Check current FedRAMP marketplace listing
- **ITAR Support**: For defense contractors
- **GovCloud**: Dedicated government POPs
- **Continuous Monitoring**: Monthly vulnerability scans

---

## Quick Reference: Compliance by Vertical

| Vertical | Primary Frameworks |
|----------|-------------------|
| Healthcare | HIPAA, HITRUST |
| Finance | PCI-DSS, SOX, GLBA |
| Retail | PCI-DSS |
| Government | FedRAMP, FISMA |
| EU Operations | GDPR |
| Any SaaS | SOC 2 |
| Defense | ITAR, CMMC |

---

## Objection Handling

**"We need on-prem for compliance"**
→ Most compliance frameworks allow cloud solutions with proper controls. SASE can actually improve compliance posture with better logging and access control.

**"Our auditor won't accept cloud"**
→ Share SOC 2 report and compliance documentation. Offer to do a bridge call with auditor.

**"We're not ready for Zero Trust"**
→ Start with remote access use case. ZTNA is often easier to deploy than maintaining VPN infrastructure while meeting compliance.

**"We need to keep data in-country"**
→ Data residency controls ensure traffic and logs stay in designated regions. Check POPs in customer's required geography.
