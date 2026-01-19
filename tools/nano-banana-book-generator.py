#!/usr/bin/env python3
"""
Nano Banana Book Illustration Generator
Generates consistent character images for children's books using Gemini API

Usage:
    export GOOGLE_API_KEY="your-api-key"
    python nano-banana-book-generator.py --book milo-internet

Setup:
    pip install google-genai pillow

Get API key: https://aistudio.google.com/apikey
"""

import os
import sys
import json
import argparse
import time
from pathlib import Path
from datetime import datetime

try:
    from google import genai
    from PIL import Image
except ImportError:
    print("Installing required packages...")
    os.system("pip install google-genai pillow")
    from google import genai
    from PIL import Image

# Rate limiting settings
RATE_LIMIT_DELAY = 5  # seconds between requests
MAX_RETRIES = 3
RETRY_DELAY = 60  # seconds to wait on rate limit error


# Book configurations
BOOKS = {
    "milo-internet": {
        "title": "MILO e il Viaggio dei Messaggi",
        "folder": "/Users/mattiapetrucciani/CascadeProjects/Onde/books/milo-internet",
        "style": "Soft watercolor children's book illustration, European style, warm colors, 4k",
        "reference_images": {
            "MILO": "/Users/mattiapetrucciani/CascadeProjects/Onde/books/milo-ai/images/cover.jpg",
            "group": "/Users/mattiapetrucciani/CascadeProjects/Onde/books/milo-ai/images/1.jpg"
        },
        "characters": {
            "MILO": "small friendly robot, silver and light blue color, round base with NO legs, expressive LED eyes shaped like teardrops, cute proportions, can show emotions through eyes",
            "Sofia": "7-year-old girl, brown hair with pink bow, curious expression, colorful but simple clothes",
            "Luca": "5-year-old boy, messy blonde hair, enthusiastic expression, Sofia's younger brother",
            "Nonna": "elderly Italian grandmother, wearing apron, warm smile, gray hair in bun"
        },
        "scenes": [
            {
                "chapter": 1,
                "title": "Un Messaggio per la Nonna",
                "characters": ["Sofia", "MILO", "Luca"],
                "scene": "Sofia sitting on couch with tablet, MILO beside her, Luca playing on carpet. Warm afternoon light through window. Cozy living room."
            },
            {
                "chapter": 2,
                "title": "La Grande Rete",
                "characters": ["Sofia", "MILO", "Luca"],
                "scene": "MILO pointing at stylized world map with glowing lines connecting continents like a spider web. Golden cables under ocean. Children watching fascinated."
            },
            {
                "chapter": 3,
                "title": "Le Lettere Diventano Numeri",
                "characters": ["MILO"],
                "scene": "Message 'CIAO NONNA' transforming into colorful trail of 0s and 1s like confetti. MILO holding a letter becoming numbers. Blue background with luminous bubbles."
            },
            {
                "chapter": 4,
                "title": "Il Pacchetto Postale Digitale",
                "characters": [],
                "scene": "Message being divided into many small colorful packets, each with a label. Packets look like little letters with wings. A robot postman sorting packets. Pastel colors."
            },
            {
                "chapter": 5,
                "title": "I Semafori di Internet",
                "characters": ["Sofia", "MILO", "Luca"],
                "scene": "Futuristic city where buildings are routers and servers, luminous streets with colorful packets traveling. Digital traffic lights. MILO, Sofia and Luca flying above on a little cloud."
            },
            {
                "chapter": 6,
                "title": "Sotto l'Oceano",
                "characters": ["MILO"],
                "scene": "Underwater view with thick cable running on ocean floor, surrounded by colorful fish and a curious whale. Cable is transparent showing messages traveling as little lights. Marine blues and turquoise."
            },
            {
                "chapter": 7,
                "title": "Arrivo in Italia!",
                "characters": ["Nonna"],
                "scene": "Italian landscape with green hills and country house. Grandmother holding phone with Sofia's message on screen. Packets reassembling like puzzle pieces in the air. Golden sunset light."
            },
            {
                "chapter": 8,
                "title": "Più Veloce della Luce?",
                "characters": ["Sofia", "MILO", "Luca"],
                "scene": "Giant stopwatch showing '0.2 seconds'. MILO, Sofia and Luca celebrating. Stars and sparkles around them. Stylized Earth in background with luminous trail of the message."
            },
            {
                "chapter": 9,
                "title": "Tutti Connessi",
                "characters": ["Sofia", "MILO", "Luca", "Nonna"],
                "scene": "Sofia video calling grandmother on tablet - both smiling. MILO and Luca beside her. Window shows American sunset on one side and Italian sunrise on other (artistically divided). Hearts and stars around."
            },
            {
                "chapter": 10,
                "title": "La Prossima Avventura",
                "characters": ["Sofia", "MILO", "Luca"],
                "scene": "Sofia, Luca and MILO on couch, evening light. MILO projecting holograms of robots and stars from his hand. Children watching enchanted. Warm cozy atmosphere, orange sunset tones."
            }
        ]
    }
}


class NanoBananaGenerator:
    def __init__(self, api_key: str = None, model: str = "gemini-2.5-flash-image"):
        self.api_key = api_key or os.environ.get("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found. Set it via environment or pass api_key parameter.")

        self.client = genai.Client(api_key=self.api_key)
        self.model = model
        self.conversation_history = []
        self.master_images = {}

    def generate_image(self, prompt: str, reference_image: Image.Image = None) -> Image.Image:
        """Generate an image from prompt, optionally with reference image."""
        for attempt in range(MAX_RETRIES):
            try:
                contents = [prompt]
                if reference_image:
                    contents.append(reference_image)

                response = self.client.models.generate_content(
                    model=self.model,
                    contents=contents,
                )

                for part in response.parts:
                    if part.inline_data is not None:
                        time.sleep(RATE_LIMIT_DELAY)  # Rate limiting
                        return part.as_image()

                return None

            except Exception as e:
                if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                    print(f"    Rate limited, waiting {RETRY_DELAY}s (attempt {attempt + 1}/{MAX_RETRIES})...")
                    time.sleep(RETRY_DELAY)
                else:
                    raise e

        return None

    def generate_character_master(self, character_name: str, character_desc: str, style: str) -> Image.Image:
        """Generate a master reference image for a character."""
        prompt = f"""Create a character sheet for a children's book:

Character: {character_name}
Description: {character_desc}

Style: {style}
Show the character on a simple white/light background, full body visible, friendly pose.
This will be the reference for all future illustrations."""

        print(f"  Generating master for {character_name}...")
        image = self.generate_image(prompt)

        if image:
            self.master_images[character_name] = image

        return image

    def generate_scene(self, scene_config: dict, book_config: dict) -> Image.Image:
        """Generate a scene maintaining character consistency."""
        characters_in_scene = scene_config.get("characters", [])
        scene_desc = scene_config.get("scene", "")
        style = book_config.get("style", "")

        # Build character descriptions for this scene
        char_descriptions = []
        for char_name in characters_in_scene:
            if char_name in book_config["characters"]:
                char_descriptions.append(f"- {char_name}: {book_config['characters'][char_name]}")

        # Build the prompt
        if characters_in_scene:
            char_text = "\n".join(char_descriptions)
            prompt = f"""Generate a children's book illustration.

IMPORTANT: Keep these characters EXACTLY the same as previously shown:
{char_text}

Scene: {scene_desc}

Style: {style}

Maintain perfect consistency with the character designs. Same faces, same colors, same proportions."""
        else:
            prompt = f"""Generate a children's book illustration.

Scene: {scene_desc}

Style: {style}"""

        # If we have master images, include the one with most characters as reference
        reference = None
        if self.master_images and characters_in_scene:
            # Use the master with the most matching characters
            for char in characters_in_scene:
                if char in self.master_images:
                    reference = self.master_images[char]
                    break

        return self.generate_image(prompt, reference)

    def generate_book(self, book_key: str, output_dir: str = None):
        """Generate all illustrations for a book."""
        if book_key not in BOOKS:
            raise ValueError(f"Book '{book_key}' not found. Available: {list(BOOKS.keys())}")

        book = BOOKS[book_key]
        output_dir = output_dir or os.path.join(book["folder"], "images-nanob")
        os.makedirs(output_dir, exist_ok=True)

        print(f"\n{'='*60}")
        print(f"NANO BANANA BOOK GENERATOR")
        print(f"Book: {book['title']}")
        print(f"Output: {output_dir}")
        print(f"{'='*60}\n")

        # Step 1: Load reference images or generate character masters
        print("STEP 1: Loading reference images...")
        masters_dir = os.path.join(output_dir, "masters")
        os.makedirs(masters_dir, exist_ok=True)

        # Load pre-existing reference images if available
        if "reference_images" in book:
            for ref_name, ref_path in book["reference_images"].items():
                if os.path.exists(ref_path):
                    print(f"  Loading reference: {ref_name} from {ref_path}")
                    self.master_images[ref_name] = Image.open(ref_path)
                else:
                    print(f"  ⚠ Reference not found: {ref_path}")

        # Generate any missing character masters
        for char_name, char_desc in book["characters"].items():
            if char_name in self.master_images:
                print(f"  ✓ {char_name}: Using reference image")
                continue

            master_path = os.path.join(masters_dir, f"master-{char_name.lower()}.png")

            if os.path.exists(master_path):
                print(f"  Loading existing master for {char_name}...")
                self.master_images[char_name] = Image.open(master_path)
            else:
                image = self.generate_character_master(char_name, char_desc, book["style"])
                if image:
                    image.save(master_path)
                    print(f"  ✓ Saved {master_path}")

        # Step 2: Generate scene with ALL main characters (for consistency reference)
        print("\nSTEP 2: Generating group master (all characters)...")
        all_chars = [c for c in book["characters"].keys() if c != "Nonna"]  # Main recurring chars
        group_scene = next((s for s in book["scenes"] if set(s["characters"]) == set(all_chars)), None)

        if group_scene:
            group_path = os.path.join(masters_dir, "master-group.png")
            if not os.path.exists(group_path):
                image = self.generate_scene(group_scene, book)
                if image:
                    image.save(group_path)
                    self.master_images["_group"] = image
                    print(f"  ✓ Saved {group_path}")

        # Step 3: Generate all chapter illustrations
        print("\nSTEP 3: Generating chapter illustrations...")

        # Sort scenes by number of characters (descending) for better consistency
        sorted_scenes = sorted(book["scenes"], key=lambda s: len(s["characters"]), reverse=True)

        for scene in sorted_scenes:
            chapter_num = scene["chapter"]
            chapter_title = scene["title"]
            output_path = os.path.join(output_dir, f"{chapter_num}.png")

            if os.path.exists(output_path):
                print(f"  Chapter {chapter_num}: Already exists, skipping...")
                continue

            print(f"  Chapter {chapter_num}: {chapter_title}...")
            print(f"    Characters: {', '.join(scene['characters']) or 'None'}")

            image = self.generate_scene(scene, book)
            if image:
                image.save(output_path)
                print(f"    ✓ Saved {output_path}")
            else:
                print(f"    ✗ Failed to generate")

        # Step 4: Generate cover
        print("\nSTEP 4: Generating cover...")
        cover_path = os.path.join(output_dir, "cover.png")
        if not os.path.exists(cover_path):
            cover_prompt = f"""Children's book cover illustration.

Title: {book['title']}

Main character MILO (the robot) prominently featured.
{book['characters']['MILO']}

Style: {book['style']}
Make it eye-catching and appealing for children ages 5-10.
Leave space at top for title text."""

            image = self.generate_image(cover_prompt, self.master_images.get("MILO"))
            if image:
                image.save(cover_path)
                print(f"  ✓ Saved {cover_path}")

        print(f"\n{'='*60}")
        print("GENERATION COMPLETE!")
        print(f"Images saved to: {output_dir}")
        print(f"{'='*60}\n")

        # Generate report
        report = {
            "book": book_key,
            "title": book["title"],
            "generated_at": datetime.now().isoformat(),
            "output_dir": output_dir,
            "model": self.model,
            "chapters": len(book["scenes"]),
            "characters": list(book["characters"].keys())
        }

        report_path = os.path.join(output_dir, "generation-report.json")
        with open(report_path, "w") as f:
            json.dump(report, f, indent=2)

        return output_dir


def main():
    parser = argparse.ArgumentParser(description="Generate book illustrations with Nano Banana")
    parser.add_argument("--book", required=True, help="Book key (e.g., milo-internet)")
    parser.add_argument("--output", help="Output directory (default: book folder/images-nanob)")
    parser.add_argument("--model", default="gemini-2.5-flash-image",
                       help="Model to use (gemini-2.5-flash-image or gemini-3-pro-image-preview)")
    parser.add_argument("--api-key", help="Google API key (or set GOOGLE_API_KEY env var)")

    args = parser.parse_args()

    try:
        generator = NanoBananaGenerator(api_key=args.api_key, model=args.model)
        generator.generate_book(args.book, args.output)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
