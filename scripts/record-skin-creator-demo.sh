#!/bin/bash
# Record a demo video of the Skin Creator for YouTube Shorts
# Uses screencapture (macOS) + ffmpeg for mobile-friendly output

set -e

OUTPUT_DIR="${1:-/tmp/skin-creator-demo}"
DURATION="${2:-30}"  # seconds

mkdir -p "$OUTPUT_DIR"

echo "🎬 Skin Creator Demo Recording Script"
echo "======================================"
echo ""
echo "This will help you create a YouTube Shorts video."
echo ""
echo "📱 YouTube Shorts specs:"
echo "   - Aspect ratio: 9:16 (vertical)"
echo "   - Resolution: 1080x1920"
echo "   - Duration: 15-60 seconds"
echo ""
echo "🎯 Recommended demo flow:"
echo "   1. Open https://onde.la/games/skin-creator/"
echo "   2. Show the blank canvas (2s)"
echo "   3. Pick colors and draw head (5s)"
echo "   4. Draw body parts (10s)"
echo "   5. Rotate 3D preview (5s)"
echo "   6. Click Download (3s)"
echo "   7. Show downloaded PNG (5s)"
echo ""

# Check for ffmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  ffmpeg not installed. Install with: brew install ffmpeg"
    exit 1
fi

echo "📹 Recording options:"
echo "   1. Use QuickTime Player (recommended)"
echo "   2. Use screencapture (CLI)"
echo ""

read -p "Choose option [1/2]: " OPTION

if [ "$OPTION" == "1" ]; then
    echo ""
    echo "📱 QuickTime instructions:"
    echo "   1. Open QuickTime Player"
    echo "   2. File → New Screen Recording"
    echo "   3. Click dropdown arrow → select area"
    echo "   4. Record a 1080x1920 vertical area"
    echo "   5. Save to: $OUTPUT_DIR/raw-recording.mov"
    echo ""
    echo "Then run this script again with option 2 to convert."
    
    # Open QuickTime
    open -a "QuickTime Player"
    
elif [ "$OPTION" == "2" ]; then
    RAW_FILE="$OUTPUT_DIR/raw-recording.mov"
    
    if [ -f "$RAW_FILE" ]; then
        echo "🔄 Converting to YouTube Shorts format..."
        
        # Convert to vertical 1080x1920
        ffmpeg -i "$RAW_FILE" \
            -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
            -c:v libx264 -preset slow -crf 18 \
            -c:a aac -b:a 128k \
            -movflags +faststart \
            "$OUTPUT_DIR/skin-creator-short.mp4"
        
        echo ""
        echo "✅ Video ready: $OUTPUT_DIR/skin-creator-short.mp4"
        echo ""
        echo "📤 Upload to YouTube Shorts:"
        echo "   1. Go to studio.youtube.com"
        echo "   2. Click CREATE → Upload video"
        echo "   3. Upload the MP4"
        echo "   4. Add #Shorts to title/description"
        echo ""
        echo "📝 Suggested title:"
        echo '   "I made a FREE Minecraft Skin Creator! 🎨 #Shorts #Minecraft"'
        echo ""
        echo "📝 Suggested description:"
        cat << 'DESC'
Create your own Minecraft skins for FREE! 🎮

✨ Features:
- Edit all body parts
- Real-time 3D preview
- Works on mobile & desktop
- No download needed!

🔗 Try it: https://onde.la/games/skin-creator/

#Minecraft #MinecraftSkins #Gaming #SkinCreator #Free #Shorts
DESC
    else
        echo "❌ No raw recording found at $RAW_FILE"
        echo "   Record with QuickTime first (option 1)"
    fi
fi

echo ""
echo "📊 For best results:"
echo "   - Use bright, contrasting colors in demo"
echo "   - Keep movements smooth and deliberate"
echo "   - Show the 3D rotation clearly"
echo "   - End with the download action"
