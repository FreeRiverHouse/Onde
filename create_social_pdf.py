#!/usr/bin/env python3
"""
Create PDF with embedded images for social content
"""
import os
import base64
from pathlib import Path

# Read images and convert to base64
def image_to_base64(image_path):
    with open(image_path, 'rb') as f:
        return base64.b64encode(f.read()).decode()

# Image paths
images = {
    'med1': '/Users/mattia/Projects/Onde/books/meditations/images/meditations-1.jpg',
    'med2': '/Users/mattia/Projects/Onde/books/meditations/images/book2.jpg',
    'med3': '/Users/mattia/Projects/Onde/books/meditations/images/book3.jpg',
    'med5': '/Users/mattia/Projects/Onde/books/meditations/images/book5.jpg',
    'med6': '/Users/mattia/Projects/Onde/books/meditations/images/book6.jpg',
    'psalm1': '/Users/mattia/Projects/Onde/books/psalm-23-children/images/01-pastore.jpg',
}

# Convert to base64
base64_images = {}
for key, path in images.items():
    if os.path.exists(path):
        base64_images[key] = image_to_base64(path)
        print(f"✓ Converted {key}")
    else:
        print(f"✗ Missing {path}")

# Create HTML with embedded images
html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CONTENUTI SOCIAL - ONDE</title>
    <style>
        @page {{ size: A4; margin: 2cm; }}
        body {{ font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 20px; }}
        .post {{ page-break-after: always; margin-bottom: 40px; padding: 30px; border: 2px solid #87ceeb; border-radius: 15px; }}
        .post-number {{ font-size: 2em; color: #4682b4; font-weight: bold; margin-bottom: 20px; }}
        .post-image {{ text-align: center; margin: 20px 0; }}
        .post-image img {{ max-width: 100%; height: auto; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }}
        .post-text {{ font-size: 1.1em; line-height: 1.8; margin: 15px 0; color: #2c5f7c; }}
        .post-meta {{ font-style: italic; color: #4682b4; margin-top: 20px; }}
        .thread-badge {{ background: #87ceeb; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin-bottom: 10px; }}
        h1 {{ text-align: center; color: #4682b4; }}
    </style>
</head>
<body>
    <h1>🌊 CONTENUTI SOCIAL - ONDE</h1>
    
    <div class="post">
        <div class="post-number">MEDITATIONS - 1</div>
        <div class="post-image"><img src="data:image/jpeg;base64,{base64_images.get('med1', '')}" alt="Meditations"></div>
        <div class="post-text">"When you arise in the morning, think of what a precious privilege it is to be alive, to breathe, to think, to enjoy, to love."</div>
        <div class="post-text">Marcus Aurelius wrote these words as personal reflections. Never meant to be read by anyone else. Just a man trying to stay human while the weight of an empire pressed down on him.</div>
        <div class="post-meta">From "Meditations" - available for free during launch at onde.la</div>
    </div>
    
    <div class="post">
        <div class="post-number">MEDITATIONS - 2</div>
        <div class="post-image"><img src="data:image/jpeg;base64,{base64_images.get('med2', '')}" alt="Inner Strength"></div>
        <div class="post-text">"You have power over your mind - not outside events. Realize this, and you will find strength."</div>
        <div class="post-text">In volatile times, this 2,000-year-old insight from Marcus Aurelius is more relevant than ever. The difference between thriving and struggling often comes down to mindset.</div>
        <div class="post-meta">From "Meditations" - available for free during launch at onde.la</div>
    </div>
    
    <div class="post">
        <div class="post-number">MEDITATIONS - 3</div>
        <span class="thread-badge">Thread 1/2</span>
        <div class="post-image"><img src="data:image/jpeg;base64,{base64_images.get('med3', '')}" alt="Personal Journal"></div>
        <div class="post-text">Marcus Aurelius wrote "Meditations" as a personal journal. Never intended for publication. Never meant to be a guide for CEOs, entrepreneurs, and leaders across millennia.</div>
        <div class="post-meta">Thread continues...</div>
    </div>
    
    <div class="post">
        <div class="post-number">MEDITATIONS - 3</div>
        <span class="thread-badge">Thread 2/2</span>
        <div class="post-text">Yet here we are. His morning reflections on life, death, and duty have become one of history's most influential leadership texts.</div>
        <div class="post-text">Some wisdom transcends time because it speaks to eternal human challenges.</div>
        <div class="post-meta">From "Meditations" - available for free during launch at onde.la</div>
    </div>
    
    <div class="post">
        <div class="post-number">MEDITATIONS - 4</div>
        <div class="post-text">"You have power over your mind - not outside events."</div>
        <div class="post-text">In volatile markets and uncertain times, this 2,000-year-old insight from Marcus Aurelius is more relevant than ever.</div>
        <div class="post-text">The difference between thriving organizations and struggling ones often comes down to mindset: focusing on what we can control versus what we cannot.</div>
        <div class="post-text">Our Classics Collection brings these timeless strategies to today's leaders.</div>
        <div class="post-meta">From "Meditations" - available for free during launch at onde.la</div>
    </div>
    
    <div class="post">
        <div class="post-number">MEDITATIONS - 5</div>
        <div class="post-image"><img src="data:image/jpeg;base64,{base64_images.get('med5', '')}" alt="Happy Life"></div>
        <div class="post-text">"Very little is needed to make a happy life; it is all within yourself, in your way of thinking."</div>
        <div class="post-text">As we build companies and careers, Marcus Aurelius reminds us that success isn't about accumulation—it's about perspective.</div>
        <div class="post-text">Our mission at ONDE is to make wisdom accessible, beautiful, and practical for modern readers.</div>
        <div class="post-meta">From "Meditations" - available for free during launch at onde.la</div>
    </div>
    
    <div class="post">
        <div class="post-number">MEDITATIONS - 6</div>
        <div class="post-image"><img src="data:image/jpeg;base64,{base64_images.get('med6', '')}" alt="Mind Power"></div>
        <div class="post-text">"You have power over your mind - not outside events." 💭</div>
        <div class="post-text">Inner strength beats outer chaos every time.</div>
        <div class="post-text">Marcus Aurelius wisdom from "Meditations" - link in bio.</div>
        <div class="post-meta">From "Meditations" - available for free during launch at onde.la</div>
    </div>
    
    <div class="post">
        <div class="post-number">MEDITATIONS - 7</div>
        <div class="post-text">Marcus Aurelius was the most powerful man in the world. Yet every morning, he reminded himself: "When you arise in the morning, think of what a precious privilege it is to be alive, to breathe, to think, to enjoy, to love."</div>
        <div class="post-text">If the Roman Emperor needed this reminder, how much more do we?</div>
        <div class="post-text">Our new edition of "Meditations" makes these timeless reflections accessible and beautiful for today's readers.</div>
        <div class="post-meta">From "Meditations" - available for free during launch at onde.la</div>
    </div>
    
    <div class="post">
        <div class="post-number">MEDITATIONS - 8</div>
        <div class="post-text">"The impediment to action advances action. What stands in the way becomes the way."</div>
        <div class="post-text">This powerful insight from Marcus Aurelius has helped leaders overcome challenges for 2,000 years. Every obstacle contains the opportunity for growth.</div>
        <div class="post-text">Our Classics Collection presents wisdom not as museum pieces, but as practical tools for modern life.</div>
        <div class="post-text">What challenge are you facing right now?</div>
        <div class="post-meta">From "Meditations" - available for free during launch at onde.la</div>
    </div>
    
    <div class="post">
        <div class="post-number">MEDITATIONS - 9</div>
        <div class="post-text">"You have power over your mind - not outside events. Realize this, and you will find strength."</div>
        <div class="post-text">In uncertain times, Marcus Aurelius offers this timeless truth: focus on what you can control. Your mindset, your response, your choices.</div>
        <div class="post-text">We've created a beautiful edition of "Meditations" that brings ancient wisdom to modern challenges.</div>
        <div class="post-meta">From "Meditations" - available for free during launch at onde.la</div>
    </div>
    
    <div class="post">
        <div class="post-number">MEDITATIONS - 10</div>
        <div class="post-text">"Very little is needed to make a happy life; it is all within yourself, in your way of thinking."</div>
        <div class="post-text">Marcus Aurelius reminds us that happiness isn't about what we have—it's about how we think. A message that matters more than ever in our consumer culture.</div>
        <div class="post-text">Our mission is to make wisdom accessible, beautiful, and practical.</div>
        <div class="post-text">What makes you truly happy?</div>
        <div class="post-meta">From "Meditations" - available for free during launch at onde.la</div>
    </div>
    
    <div class="post">
        <div class="post-number">PSALM 23 - 1</div>
        <div class="post-image"><img src="data:image/jpeg;base64,{base64_images.get('psalm1', '')}" alt="The Good Shepherd"></div>
        <div class="post-text">The Lord is my shepherd; I shall not want. He makes me lie down in green pastures.</div>
        <div class="post-meta">From "Psalm 23" - Ancient wisdom, timeless peace. Available for free during launch at onde.la</div>
    </div>
    
    <div class="post">
        <div class="post-number">PSALM 23 - 2</div>
        <div class="post-text">In an era of constant distraction, ancient wisdom offers something remarkable: clarity.</div>
        <div class="post-text">Psalm 23's "The Lord is my shepherd" isn't just poetry—it's a framework for leadership that has guided minds for 3,000 years.</div>
        <div class="post-text">We're bringing this timeless perspective to modern readers through our Classics Collection. Because some truths don't age.</div>
        <div class="post-meta">From "Psalm 23" - available for free during launch at onde.la</div>
    </div>
    
    <div style="text-align: center; margin-top: 40px; color: #4682b4; font-size: 1.2em;">
        @ONDE_FRH - Where Stories Flow...
    </div>
</body>
</html>"""

# Save HTML
output_path = '/Users/mattia/Projects/Onde/CONTENUTI-SOCIAL-WITH-IMAGES.html'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"\n✅ Created: {output_path}")
print("✅ Images embedded as base64 - will be visible when opened!")
