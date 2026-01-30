# Video Avatar Providers Comparison

> **Created**: 2026-01-30  
> **Purpose**: Evaluate video avatar APIs for SE-Bot real-time meeting avatar (T476)  
> **Goal**: Participate in video meetings without being present (like Elon Musk's AI clone demos)

---

## Executive Summary

| Provider | Best For | Real-Time? | Price Entry | API? |
|----------|----------|------------|-------------|------|
| **HeyGen** | Fastest processing, best API | ⚡ Yes (Avatar IV) | $29/mo | ✅ Full |
| **D-ID** | Budget-friendly, good quality | ⚡ Yes (streaming) | Pay-per-minute | ✅ Full |
| **Synthesia** | Enterprise, highest quality | ❌ Not real-time | ~$22/mo (annual) | ✅ Limited |

**Recommendation for SE-Bot**: **HeyGen** for real-time streaming capability, or **D-ID** for budget-conscious development.

---

## 1. HeyGen

### Overview
- **Website**: https://www.heygen.com
- **API Docs**: https://docs.heygen.com
- **G2 Rating**: #1 Fastest Growing Product 2025
- **Customers**: 100,000+ businesses

### Pricing Tiers

| Plan | Price | Video Minutes | Features |
|------|-------|---------------|----------|
| Free | $0/mo | 3 videos (3-min max) | 720p, 500+ stock avatars, 30+ languages |
| Creator | $29/mo | Unlimited | 1080p, voice cloning, 175+ languages |
| Pro | $99/mo | Unlimited | 4K, 10x generative usage, early access |
| Business | $149/mo | Unlimited | 60-min videos, SSO, team collab |
| Enterprise | Custom | Unlimited | Fastest processing, dedicated support |

### API Features
- **Real-Time Streaming**: Yes! Avatar IV supports real-time generation
- **Authentication**: API key in `X-API-KEY` header
- **Endpoints**: Video generation, translation, avatar management
- **SDK**: Postman collection available
- **Latency**: "Fastest processing" tier available

### Key Capabilities for SE-Bot
✅ **Real-time avatar generation** (Avatar IV)  
✅ **Voice cloning** (unlimited on paid plans)  
✅ **175+ languages** for multi-lingual meetings  
✅ **Custom avatars** (create your digital twin)  
✅ **API access** on all plans  
✅ **Motion/gesture control** (for natural body language)  
✅ **Lip sync** (automatic from text/audio)  

### Limitations
- Avatar IV has 3-min max duration per video (real-time chunking needed)
- Premium features locked to higher tiers
- No OBS Virtual Cam integration (need separate solution)

---

## 2. D-ID

### Overview
- **Website**: https://www.d-id.com
- **API Docs**: https://docs.d-id.com
- **Focus**: AI-powered video creation and lip sync

### Pricing Model
- **Pay-per-minute**: Minutes deducted from plan (rounded to 15s intervals)
- **Minutes don't accumulate**: Unused minutes expire monthly
- **API shares balance**: Web and API use same minute pool

### API Features
- **Streaming API**: Yes, supports real-time generation
- **Authentication**: API key from account settings
- **Documentation**: Full REST API reference available
- **Output formats**: MP4, various resolutions

### Key Capabilities for SE-Bot
✅ **Streaming/real-time** capability  
✅ **Lip sync** from audio input  
✅ **API access** with full documentation  
✅ **Cost-effective** for development/testing  
✅ **Ethics-focused** (transparency about synthetic content)  

### Limitations
- Watermark for trial users (full-screen)
- Data deleted after 6 months of inactivity
- Less polished than HeyGen for enterprise

### Ethical Considerations
D-ID emphasizes transparency about AI-generated content:
- Synthetic nature disclosure required
- Published ethical manifesto
- Content moderation applied

---

## 3. Synthesia

### Overview
- **Website**: https://www.synthesia.io
- **Focus**: Enterprise video production at scale
- **Customers**: 50,000+ companies
- **G2 Rating**: 4.7 from 2,000+ reviews

### Pricing Tiers

| Plan | Price | Video Minutes | Avatars |
|------|-------|---------------|---------|
| Free | $0/mo | 10 min/mo | 9 AI avatars |
| Starter | ~$22/mo (annual) | 10 min/mo | 125+ avatars |
| Creator | ~$67/mo (annual) | 30 min/mo | 180+ avatars, 3 personal |
| Enterprise | Custom | Unlimited | 240+ avatars, unlimited personal |

### API Features
- **Synthesia API**: Available on Creator+ plans
- **Limits**: 360 min/year included, more as add-on
- **Automation**: Bulk personalization, template-based generation

### Key Capabilities for SE-Bot
✅ **Highest quality** avatars (enterprise-grade)  
✅ **Personal avatars** (digital twin creation)  
✅ **AI dubbing with lip sync**  
✅ **Voice cloning** (included with personal avatar)  
✅ **160+ languages**  
✅ **SCORM export** (for LMS integration)  

### Limitations
❌ **NOT real-time**: Pre-rendered video only  
❌ **Processing time**: Studio avatars take up to 10 days  
❌ **Enterprise-focused**: Features gated behind high tiers  
❌ **Limited API**: Not designed for real-time streaming  

---

## Feature Comparison Matrix

| Feature | HeyGen | D-ID | Synthesia |
|---------|--------|------|-----------|
| **Real-time streaming** | ✅ Avatar IV | ✅ Streaming API | ❌ Pre-render only |
| **Lip sync quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Voice cloning** | ✅ Unlimited | ✅ | ✅ |
| **Custom avatars** | ✅ (paid) | ✅ | ✅ (expensive add-on) |
| **API availability** | ✅ All plans | ✅ All plans | ✅ Creator+ only |
| **Languages** | 175+ | 130+ | 160+ |
| **Latency** | Low | Medium | N/A (not real-time) |
| **Price entry** | $29/mo | Pay-per-use | ~$22/mo |
| **Enterprise ready** | ✅ | ✅ | ✅ Best |

---

## Recommendation for SE-Bot (T476)

### Primary Choice: **HeyGen**

**Why HeyGen?**
1. **Real-time Avatar IV** - Critical for live meeting participation
2. **Voice cloning** - Can clone Mattia's voice for authenticity
3. **Motion/gesture control** - Natural body language in meetings
4. **Good API** - Well-documented, Postman collection
5. **Reasonable pricing** - $29/mo to start testing

**Implementation Plan:**
1. Start with Creator tier ($29/mo) for development
2. Test Avatar IV real-time generation latency
3. Implement voice cloning with Mattia's voice
4. Add gesture control for natural responses
5. Route output to OBS Virtual Cam for meeting injection

### Secondary Choice: **D-ID**

**Why D-ID as backup?**
1. **Pay-per-minute** - Cost-effective for early testing
2. **Streaming API** - Real-time capability exists
3. **Lower entry cost** - No monthly commitment needed

---

## Integration Architecture for SE-Bot

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  SE-Bot RAG     │───▶│  Video Avatar    │───▶│  OBS Virtual    │
│  Response Text  │    │  API (HeyGen)    │    │  Cam Output     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Meeting App     │
                       │  (Zoom/Teams)    │
                       └──────────────────┘
```

### Components Needed:
1. **HeyGen/D-ID API client** - Generate avatar video from text
2. **Voice cloning setup** - One-time voice profile creation
3. **OBS Virtual Camera** - Route avatar video to meetings
4. **Latency buffer** - Handle real-time generation delays
5. **Sentiment analysis** - Map emotions to avatar expressions

---

## Next Steps

1. [ ] Sign up for HeyGen API trial
2. [ ] Test Avatar IV real-time generation latency
3. [ ] Record voice samples for cloning
4. [ ] Create custom avatar (digital twin)
5. [ ] Build API client in `apps/se-bot/video_avatar.py`
6. [ ] Integrate with existing voice output (T475)
7. [ ] Test in mock meeting scenario

---

## Cost Estimate (Monthly)

| Component | Cost | Notes |
|-----------|------|-------|
| HeyGen Creator | $29 | Unlimited videos, real-time |
| OBS Studio | Free | Virtual camera software |
| Total MVP | **$29/mo** | For development/testing |

Enterprise estimate: $149-500/mo depending on usage and quality needs.

---

## References

- HeyGen Pricing: https://www.heygen.com/pricing
- HeyGen API Docs: https://docs.heygen.com
- D-ID Pricing: https://www.d-id.com/pricing
- D-ID API Docs: https://docs.d-id.com
- Synthesia Pricing: https://www.synthesia.io/pricing
