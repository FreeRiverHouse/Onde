# Roku TV App Development Guide for Onde

## Executive Summary

**Important Update (January 2024):** Roku Direct Publisher was officially sunset on January 12, 2024. All new Roku channels must now be built using BrightScript/SceneGraph SDK.

This guide covers how to create a Roku channel for Onde content (animated stories, fireplace videos, nature/ambient content).

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Development Options](#development-options)
3. [Recommended Path: SGDEX Template](#recommended-path-sgdex-template)
4. [Developer Account Setup](#developer-account-setup)
5. [Video Hosting Requirements](#video-hosting-requirements)
6. [JSON Feed Format](#json-feed-format)
7. [Submission Process](#submission-process)
8. [MVP Implementation Plan](#mvp-implementation-plan)
9. [Cost Breakdown](#cost-breakdown)

---

## Platform Overview

### Why Roku?

- **Market Share:** Roku devices are used in 1 out of 3 smart TVs sold in the U.S.
- **Low Barrier to Entry:** Free developer account, straightforward certification
- **Large Audience:** 70+ million active accounts

### Content Types for Onde

1. **Animated Stories** (short-form, 5-15 minutes)
2. **Fireplace Videos** (long-form, 10+ hours)
3. **Nature/Ambient Content** (medium to long-form)

---

## Development Options

### Option 1: Build with SceneGraph SDK (Recommended)

**Pros:**
- Full control over UI/UX
- Free to develop
- Official Roku support
- Uses SGDEX (SceneGraph Developer Extensions) for rapid development

**Cons:**
- Requires BrightScript knowledge
- Development time: 2-4 weeks

### Option 2: No-Code Platform (Uscreen, Zype, MAZ)

**Pros:**
- No coding required
- Fast deployment (3-4 weeks)
- Handles publishing

**Cons:**
- Monthly fees ($99-500+/month)
- Less customization
- Ongoing costs

### Option 3: Hire a Roku Developer

**Pros:**
- Professional result
- Fastest option

**Cons:**
- Cost: $2,000-10,000+
- Dependency on external developer

---

## Recommended Path: SGDEX Template

For Onde, I recommend **Option 1** using the SGDEX framework. Here's why:

1. **Free to develop** - only pay for video hosting
2. **Pre-built views** - Grid, Details, Media player already done
3. **JSON feed support** - Easy content management
4. **Professional appearance** - Follows Roku UX guidelines

### SGDEX Components We'll Use

| Component | Purpose |
|-----------|---------|
| GridView | Display video thumbnails in categories |
| DetailsView | Show video description, play button |
| MediaView | Video player with controls |
| CategoryListView | Browse by category (Stories, Fireplace, Nature) |

---

## Developer Account Setup

### Step 1: Create Roku Customer Account

1. Go to [my.roku.com](https://my.roku.com)
2. Click "Create Account"
3. Enter name, email, password
4. Verify email address

### Step 2: Enroll in Developer Program

1. Go to [developer.roku.com](https://developer.roku.com)
2. Click "Enroll"
3. Accept Developer Terms and Conditions
4. Accept Roku Distribution Policy

### Step 3: Link a Roku Device

**Required:** You must have a physical Roku device (Streaming Stick, Ultra, or Roku TV)

1. Connect Roku to same network as your computer
2. On Roku, go to: Settings > System > About
3. Note the IP address
4. Enable Developer Mode:
   - Press on remote: Home 3x, Up 2x, Right, Left, Right, Left, Right
   - Accept Developer Tools License Agreement
   - Set a password (remember this!)
   - Device reboots

### Step 4: Set Up Roku Pay (Optional for Free Content)

Only needed if you plan to charge for content or show ads.

---

## Video Hosting Requirements

### Critical: YouTube is NOT Supported

Roku does not support YouTube as a video source for custom channels. You must host videos on a supported platform.

### Supported Hosting Options

#### Option A: Vimeo Pro ($20/month)

**Pros:**
- Easy HLS streaming URLs
- Good integration with Roku
- Unlimited local bandwidth

**Cons:**
- Bandwidth charges for Roku streaming (can get expensive at scale)
- Limited category organization without middleware

**Setup:**
1. Upload videos to Vimeo Pro
2. Generate API access token
3. Use Vimeo HLS URLs in your feed

#### Option B: Amazon S3 + CloudFront (Pay-as-you-go)

**Pros:**
- Most cost-effective at scale
- Full control
- Professional solution

**Cons:**
- Requires video encoding (AWS MediaConvert)
- More setup complexity

**Setup:**
1. Create S3 bucket for video storage
2. Use AWS MediaConvert to encode to HLS
3. Set up CloudFront CDN for delivery
4. Use CloudFront URLs in your feed

#### Option C: Bunny.net CDN (~$0.01/GB)

**Pros:**
- Very affordable
- Simple setup
- HLS support

**Cons:**
- Requires pre-encoded HLS files

### Video Format Specifications

| Specification | Requirement |
|--------------|-------------|
| **Format** | HLS (HTTP Live Streaming) preferred, DASH also supported |
| **Video Codec** | H.264 (AVC) or HEVC (H.265) |
| **Audio Codec** | AAC (required), AC3/EAC3 for surround |
| **Resolution** | 720p minimum, 1080p recommended, 4K optional |
| **Bitrate** | 2-8 Mbps for HD, 15-20 Mbps for 4K |
| **Frame Rate** | 24fps, 30fps, or 60fps |
| **Segment Size** | 2-5 seconds for VOD |
| **Aspect Ratio** | 16:9 |

### Encoding Recommendations

For best results, provide multiple bitrate variants:

```
480p  - 1.5 Mbps
720p  - 3.0 Mbps
1080p - 6.0 Mbps
4K    - 15.0 Mbps (optional)
```

---

## JSON Feed Format

Even though Direct Publisher is gone, the JSON feed format remains useful for organizing your content. Your SGDEX app will parse this feed.

### Basic Feed Structure

```json
{
  "providerName": "Onde",
  "lastUpdated": "2026-01-10T12:00:00Z",
  "language": "en",
  "categories": [
    {
      "name": "Animated Stories",
      "playlistName": "stories",
      "order": "manual"
    },
    {
      "name": "Fireplace",
      "playlistName": "fireplace",
      "order": "manual"
    },
    {
      "name": "Nature & Ambient",
      "playlistName": "nature",
      "order": "manual"
    }
  ],
  "shortFormVideos": [
    {
      "id": "story-001",
      "title": "The Little Wave - Bedtime Story",
      "shortDescription": "A calming animated story about a little wave finding its way home.",
      "longDescription": "Join the Little Wave on a peaceful journey across the ocean...",
      "releaseDate": "2026-01-01",
      "thumbnail": "https://cdn.onde.app/thumbnails/little-wave.jpg",
      "tags": ["bedtime", "calming", "children", "ocean"],
      "genres": ["Children", "Educational"],
      "content": {
        "dateAdded": "2026-01-01T00:00:00Z",
        "duration": 600,
        "videos": [
          {
            "url": "https://cdn.onde.app/videos/little-wave/master.m3u8",
            "quality": "HD",
            "videoType": "HLS"
          }
        ],
        "captions": [
          {
            "url": "https://cdn.onde.app/captions/little-wave-en.srt",
            "language": "en",
            "captionType": "CLOSED_CAPTION"
          }
        ]
      }
    }
  ],
  "movies": [
    {
      "id": "fireplace-001",
      "title": "Cozy Fireplace - 10 Hours",
      "shortDescription": "Relaxing crackling fireplace for sleep and ambiance.",
      "longDescription": "10 hours of warm, crackling fireplace sounds and visuals...",
      "releaseDate": "2026-01-01",
      "thumbnail": "https://cdn.onde.app/thumbnails/fireplace-cozy.jpg",
      "tags": ["fireplace", "sleep", "relaxation", "ambiance"],
      "genres": ["Relaxation"],
      "content": {
        "dateAdded": "2026-01-01T00:00:00Z",
        "duration": 36000,
        "videos": [
          {
            "url": "https://cdn.onde.app/videos/fireplace-cozy/master.m3u8",
            "quality": "FHD",
            "videoType": "HLS"
          }
        ]
      }
    }
  ]
}
```

### Content Types

| Type | Use Case | Duration |
|------|----------|----------|
| `shortFormVideos` | Stories, shorts | < 15 minutes |
| `movies` | Fireplace, long ambient | > 15 minutes |
| `series` | Story collections | Episodes |

### Required Fields

**For each video:**
- `id` - Unique identifier
- `title` - Display title
- `shortDescription` - Brief description (< 200 chars)
- `thumbnail` - Image URL (16:9 ratio, min 800x450)
- `releaseDate` - YYYY-MM-DD format
- `content.duration` - Duration in seconds
- `content.videos[].url` - Stream URL
- `content.videos[].videoType` - "HLS" or "DASH"

---

## Submission Process

### Timeline Overview

| Phase | Duration |
|-------|----------|
| Development | 2-4 weeks |
| Internal Testing | 1 week |
| Certification Review | 5 business days |
| Publication | 2 business days |
| **Total** | **4-7 weeks** |

### Step 1: Side-Load and Test

1. Package your channel (zip the source folder)
2. Open browser to `http://<roku-ip>:8060`
3. Upload via Development Application Installer
4. Test all functionality

### Step 2: Create Channel in Developer Dashboard

1. Go to [developer.roku.com/developer-channels](https://developer.roku.com/developer-channels)
2. Click "Add Channel"
3. Fill in channel details:
   - Channel name: "Onde - Sleep Stories & Ambient"
   - Channel description
   - Category: "Kids & Family" or "Lifestyle"
   - Screenshots (1920x1080)
   - Channel poster (540x405)

### Step 3: Submit for Certification

1. Upload signed package
2. Complete certification checklist
3. Submit for review

### Certification Requirements

- Channel must load within 20 seconds
- All buttons must respond within 1 second
- Must handle network errors gracefully
- Must support deep linking
- Must include proper poster images
- Must pass automated tests

### Step 4: Publication

Once certified:
- Channel appears in Roku Channel Store within 2 business days
- Users can search and install

### Blackout Periods (2025)

No publications during:
- November 21-30, 2025
- December 19, 2025 - January 5, 2026

Plan submissions accordingly!

---

## MVP Implementation Plan

### Phase 1: Setup (Week 1)

- [ ] Create Roku developer account
- [ ] Link Roku device
- [ ] Set up VS Code with BrightScript extension
- [ ] Clone SGDEX template from GitHub
- [ ] Set up video hosting (Vimeo Pro or S3)

### Phase 2: Content Preparation (Week 1-2)

- [ ] Export videos from YouTube (use yt-dlp)
- [ ] Encode to HLS format (AWS MediaConvert or FFmpeg)
- [ ] Upload to hosting service
- [ ] Create thumbnails (16:9, 800x450 minimum)
- [ ] Create JSON feed file

### Phase 3: Development (Week 2-3)

- [ ] Configure SGDEX views
- [ ] Implement content feed parser
- [ ] Add GridView for categories
- [ ] Add DetailsView for video info
- [ ] Add MediaView for playback
- [ ] Test on device

### Phase 4: Polish (Week 3-4)

- [ ] Add splash screen (1920x1080)
- [ ] Add channel poster images
- [ ] Implement deep linking
- [ ] Error handling
- [ ] Loading states

### Phase 5: Submission (Week 4)

- [ ] Create channel in dashboard
- [ ] Upload screenshots
- [ ] Submit for certification
- [ ] Address any feedback

---

## Cost Breakdown

### One-Time Costs

| Item | Cost |
|------|------|
| Roku Device (for testing) | $30-100 |
| Developer Account | Free |
| **Total** | **$30-100** |

### Monthly Costs (Option A: Vimeo Pro)

| Item | Cost |
|------|------|
| Vimeo Pro | $20/month |
| Bandwidth overage | Variable |
| **Total** | **$20+/month** |

### Monthly Costs (Option B: AWS)

| Item | Estimated Cost |
|------|----------------|
| S3 Storage (100GB) | ~$2.30/month |
| CloudFront (500GB) | ~$42.50/month |
| MediaConvert (initial) | ~$10-50 one-time |
| **Total** | **~$45/month** |

### No-Code Platform Comparison

| Platform | Monthly Cost | Setup Time |
|----------|--------------|------------|
| Uscreen | $99+ | 3-4 weeks |
| Zype | $500+ | 2-3 weeks |
| MAZ | $199+ | 2-3 weeks |
| Muvi | $399+ | 2-3 weeks |

---

## Quick Start Commands

### Install Development Tools

```bash
# Install VS Code BrightScript extension
code --install-extension RokuCommunity.brightscript

# Clone SGDEX samples
git clone https://github.com/rokudev/SceneGraphDeveloperExtensions.git

# Clone video player sample
git clone https://github.com/rokudev/simple-videoplayer-channel.git
```

### Encode Video to HLS (FFmpeg)

```bash
# Basic HLS encoding
ffmpeg -i input.mp4 \
  -c:v libx264 -preset medium -crf 23 \
  -c:a aac -b:a 128k \
  -hls_time 4 \
  -hls_playlist_type vod \
  -hls_segment_filename "segment_%03d.ts" \
  output.m3u8

# Multi-bitrate (adaptive streaming)
ffmpeg -i input.mp4 \
  -filter_complex "[0:v]split=3[v1][v2][v3]; \
    [v1]scale=1920:1080[v1out]; \
    [v2]scale=1280:720[v2out]; \
    [v3]scale=854:480[v3out]" \
  -map "[v1out]" -c:v:0 libx264 -b:v:0 5M \
  -map "[v2out]" -c:v:1 libx264 -b:v:1 3M \
  -map "[v3out]" -c:v:2 libx264 -b:v:2 1M \
  -map 0:a -c:a aac -b:a 128k \
  -var_stream_map "v:0,a:0 v:1,a:0 v:2,a:0" \
  -master_pl_name master.m3u8 \
  -hls_time 4 -hls_playlist_type vod \
  stream_%v/playlist.m3u8
```

### Download from YouTube (for your own content)

```bash
# Install yt-dlp
pip install yt-dlp

# Download best quality
yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" \
  --output "%(title)s.%(ext)s" \
  "VIDEO_URL"
```

---

## Useful Resources

### Official Documentation
- [Roku Developer Portal](https://developer.roku.com/)
- [SGDEX GitHub](https://github.com/rokudev/SceneGraphDeveloperExtensions)
- [BrightScript Reference](https://developer.roku.com/docs/references/brightscript/language/brightscript-language-reference.md)
- [Certification Criteria](https://developer.roku.com/docs/developer-program/certification/certification.md)

### Sample Code
- [SceneGraph Master Sample](https://github.com/rokudev/scenegraph-master-sample)
- [Simple Video Player](https://github.com/rokudev/simple-videoplayer-channel)
- [SGDEX Basic Channel](https://github.com/rokudev/SceneGraphDeveloperExtensions/tree/master/samples/2_Basic+Channel)

### Community
- [Roku Developer Forum](https://community.roku.com/t5/Roku-Developer-Program/bd-p/roku-developer-program)
- [Roku Community GitHub](https://github.com/rokucommunity)

---

## Next Steps for Onde

1. **Immediate:** Create Roku developer account
2. **This Week:** Decide on video hosting (recommend starting with Vimeo Pro for simplicity)
3. **Week 1:** Re-encode existing YouTube content to HLS
4. **Week 2-3:** Build SGDEX channel using Basic Channel sample
5. **Week 4:** Submit for certification

**Target Launch:** February 2026 (accounting for holiday blackout)

---

*Document created: January 10, 2026*
*Last updated: January 10, 2026*
