# Video Avatar Providers Comparison

**Purpose**: Research document for T476 (SE-Bot Video Avatar Integration)  
**Last Updated**: 2026-01-31  
**Author**: @clawd

## Executive Summary

For SE-Bot's video avatar feature (participating in meetings with AI-generated video), we've analyzed three leading providers. **Recommendation: Start with D-ID** for MVP due to best price/latency balance for real-time use cases.

---

## Provider Comparison Matrix

| Feature | HeyGen | D-ID | Synthesia |
|---------|--------|------|-----------|
| **Real-time capable** | ✅ Yes (Streaming Avatar) | ✅ Yes (Live Portrait) | ❌ No (pre-rendered only) |
| **Latency** | ~500ms | ~300ms | N/A |
| **API availability** | ✅ REST + WebSocket | ✅ REST + WebSocket | ✅ REST only |
| **Lip sync quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Custom avatar** | ✅ (photo + video) | ✅ (photo only) | ✅ (studio recording) |
| **Voice integration** | Built-in + external | External required | Built-in + external |
| **Pricing tier** | $$$ | $$ | $$$$ |
| **Free tier** | Trial credits | 5 min/day free | No free tier |

---

## Detailed Analysis

### 1. HeyGen

**Website**: https://heygen.com  
**API Docs**: https://docs.heygen.com

#### Strengths
- **Streaming Avatar API**: Real-time video generation with WebSocket
- **Best quality**: Highest lip sync accuracy and natural movements
- **Voice cloning**: Can clone your voice for realistic delivery
- **Template system**: Pre-built avatar templates
- **Multi-language**: 40+ languages supported

#### Weaknesses
- **Pricing**: Most expensive option ($89-$249/month for API access)
- **Latency**: ~500ms in streaming mode
- **Complexity**: More setup required for real-time integration

#### API Capabilities
```python
# HeyGen Streaming Avatar example
import heygen

session = heygen.StreamingAvatar.create(
    avatar_id="avatar_josh_lite",
    voice_id="voice_custom_clone"
)

# Send text to speak
session.speak("Hello, welcome to the meeting!")

# Get video frame stream
for frame in session.video_stream():
    output_to_virtual_cam(frame)
```

#### Pricing (as of 2025)
- **Creator**: $89/month (120 credits, no streaming)
- **Business**: $249/month (500 credits, streaming included)
- **Enterprise**: Custom pricing
- **Credit cost**: ~0.5 credit per minute of video

---

### 2. D-ID

**Website**: https://d-id.com  
**API Docs**: https://docs.d-id.com

#### Strengths
- **Fast latency**: ~300ms, best for real-time
- **Simple API**: Easy REST + WebSocket integration
- **Free tier**: 5 minutes/day free (great for testing)
- **Photo-to-avatar**: Just upload a photo
- **Price/performance**: Best value for real-time use

#### Weaknesses
- **Photo-only**: Can't create avatar from video (lower quality)
- **Voice external**: Must integrate separate TTS (ElevenLabs)
- **Expression range**: Less emotion variety than competitors
- **No voice cloning**: Relies on external providers

#### API Capabilities
```python
# D-ID Live Portrait example
import requests

# Create a talk
response = requests.post(
    "https://api.d-id.com/talks",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "source_url": "https://example.com/my-photo.jpg",
        "script": {
            "type": "audio",
            "audio_url": "https://example.com/speech.mp3"
        }
    }
)

# Stream result
video_url = response.json()["result_url"]
```

#### Real-time Streaming (Agents API)
```python
# D-ID Agents API for real-time
ws = websocket.connect("wss://api.d-id.com/agents/streams")

# Send text, get video frames
ws.send(json.dumps({
    "type": "text",
    "text": "This is the live response",
    "avatar_id": "my_avatar"
}))
```

#### Pricing (as of 2025)
- **Free**: 5 min/day, watermarked
- **Lite**: $5.99/month (10 min, no watermark)
- **Pro**: $29/month (15 min + premium features)
- **Advanced**: $99/month (65 min + API priority)
- **Enterprise**: Custom pricing

---

### 3. Synthesia

**Website**: https://synthesia.io  
**API Docs**: https://docs.synthesia.io

#### Strengths
- **Highest quality**: Professional studio avatars
- **Enterprise features**: Compliance, audit logs, SSO
- **Localization**: 140+ languages
- **Brand consistency**: Custom branded avatars
- **Template library**: Thousands of scenes/backgrounds

#### Weaknesses
- **Not real-time**: Videos must be pre-rendered (2-5 min processing)
- **Expensive**: Enterprise pricing only for API
- **No streaming**: Cannot use for live meetings
- **Long turnaround**: Not suitable for dynamic content

#### API Capabilities
```python
# Synthesia (not real-time)
import requests

response = requests.post(
    "https://api.synthesia.io/v2/videos",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "input": [{
            "avatar": "anna_costume1_cameraA",
            "background": "off_white",
            "voice": "en-US-JennyNeural"
        }],
        "script": "Hello, this is a pre-recorded message."
    }
)

# Wait for rendering (2-5 minutes)
video_id = response.json()["id"]
# Poll for completion...
```

#### Pricing (as of 2025)
- **Personal**: $29/month (10 min/month, no API)
- **Starter**: $89/month (120 min/year, limited API)
- **Creator**: $299/month (360 min/year, full API)
- **Enterprise**: Custom (unlimited, dedicated support)

---

## Recommendation for SE-Bot

### MVP Phase: D-ID
**Rationale**:
1. Best latency (~300ms) for real-time meetings
2. Free tier allows extensive testing
3. Simple integration with existing ElevenLabs setup
4. Reasonable pricing ($29-99/month)
5. Photo-to-avatar = quick setup

### Production Phase: HeyGen
**Rationale**:
1. Higher quality for professional meetings
2. Built-in voice cloning for more realistic SE persona
3. Better expression/emotion range
4. Worth the premium for sales engineering context

### Not Recommended: Synthesia
**Rationale**:
1. No real-time capability = dealbreaker for live meetings
2. Pre-rendering defeats the purpose of dynamic AI assistance
3. Only suitable for pre-recorded content (training videos, etc.)

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SE-Bot Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────────┐  │
│  │  Meeting     │───▶│  Claude RAG   │───▶│  Text        │  │
│  │  Transcript  │    │  (Suggestions)│    │  Response    │  │
│  └──────────────┘    └───────────────┘    └──────┬───────┘  │
│                                                   │          │
│                                                   ▼          │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────────┐  │
│  │  Virtual     │◀───│  D-ID/HeyGen  │◀───│  ElevenLabs  │  │
│  │  Camera      │    │  (Avatar)     │    │  (Voice)     │  │
│  └──────────────┘    └───────────────┘    └──────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Pipeline Steps
1. Audio captured → Whisper transcription
2. Transcript → RAG lookup → Claude response
3. Response text → ElevenLabs TTS → audio stream
4. Audio + avatar → D-ID/HeyGen → video stream
5. Video → OBS Virtual Camera → meeting app

---

## Technical Requirements

### For D-ID Integration
1. **API Key**: Sign up at d-id.com
2. **Dependencies**: `pip install websocket-client requests`
3. **Virtual Camera**: OBS VirtualCam or pyvirtualcam
4. **Audio sync**: ElevenLabs output → D-ID audio input

### Sample D-ID Integration Code
```python
# apps/se-bot/video_avatar.py (to be implemented)

class VideoAvatarManager:
    def __init__(self, provider: str = "d-id"):
        self.provider = provider
        self.api_key = os.environ.get("DID_API_KEY")
        self.avatar_photo = "path/to/mattia_photo.jpg"
        
    async def generate_video(self, audio_url: str) -> str:
        """Generate avatar video from audio"""
        if self.provider == "d-id":
            return await self._did_generate(audio_url)
        elif self.provider == "heygen":
            return await self._heygen_generate(audio_url)
    
    async def stream_to_camera(self, video_url: str):
        """Stream video to virtual camera"""
        # Use pyvirtualcam or OBS websocket
        pass
```

---

## Cost Estimation (Monthly)

### Light Usage (2 hours meetings/month)
| Provider | Minutes | Cost |
|----------|---------|------|
| D-ID Pro | 120 min | $29 |
| HeyGen | 120 min | ~$60 (credits) |

### Heavy Usage (20 hours meetings/month)
| Provider | Minutes | Cost |
|----------|---------|------|
| D-ID Advanced | 1200 min | $99+ overages |
| HeyGen Business | 1200 min | ~$500 |

---

## Next Steps

1. **[ ] Get D-ID API key** (free tier for testing)
2. **[ ] Create avatar from Mattia's photo**
3. **[ ] Implement `video_avatar.py` module
4. **[ ] Test latency with ElevenLabs pipeline
5. **[ ] Set up OBS VirtualCam output
6. **[ ] Integration test in real meeting

---

## References

- D-ID API Docs: https://docs.d-id.com
- HeyGen API Docs: https://docs.heygen.com  
- Synthesia API Docs: https://docs.synthesia.io
- OBS VirtualCam: https://obsproject.com
- pyvirtualcam: https://github.com/letmaik/pyvirtualcam
