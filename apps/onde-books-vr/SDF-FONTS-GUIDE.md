# SDF Fonts Guide per Onde Books VR

Guida completa all'implementazione di font SDF (Signed Distance Field) per garantire testo nitido e leggibile in realtà virtuale.

## Indice

1. [Cos'è SDF](#cosè-sdf)
2. [Perché SDF in VR](#perché-sdf-in-vr)
3. [Generazione Font SDF](#generazione-font-sdf)
4. [Font Consigliati](#font-consigliati)
5. [Dimensioni e Spaziatura](#dimensioni-e-spaziatura)
6. [Shader per Rendering](#shader-per-rendering)
7. [Implementazione Unity](#implementazione-unity)
8. [Implementazione Godot](#implementazione-godot)
9. [Best Practices](#best-practices)

---

## Cos'è SDF

### Definizione

**Signed Distance Field (SDF)** è una tecnica di rappresentazione delle forme dove ogni pixel di una texture contiene la distanza dal bordo più vicino della forma:
- **Valori positivi**: pixel all'esterno della forma
- **Valori negativi**: pixel all'interno della forma
- **Zero**: esattamente sul bordo

### Come Funziona per i Font

```
Bitmap Tradizionale:          SDF:
█████████████                 Gradiente di distanza
█           █                 dal bordo del carattere
█  ███████  █
█  █     █  █     →          Ogni pixel = distanza
█  ███████  █                 dal contorno più vicino
█  █     █  █
█  █     █  █                 Permette scaling infinito
█████████████                 senza perdita di qualità
```

### Vantaggi SDF vs Bitmap

| Aspetto | Bitmap | SDF |
|---------|--------|-----|
| Scaling | Pixelato/sfocato | Sempre nitido |
| Memoria | Alta (multiple risoluzioni) | Bassa (singola texture) |
| Outline | Difficile | Facile via shader |
| Glow/Shadow | Pre-renderizzato | Real-time via shader |
| Antialiasing | Fisso | Adattivo |

---

## Perché SDF in VR

### Problemi del Testo in VR

1. **Bassa Densità Pixel**: I visori VR hanno ~20 PPD (pixels per degree) vs ~60 PPD di uno smartphone
2. **Distanza Variabile**: L'utente può avvicinarsi/allontanarsi dal testo
3. **Screen-door Effect**: La griglia di pixel è visibile
4. **Rendering Stereo**: Il testo deve apparire identico in entrambi gli occhi

### Come SDF Risolve Questi Problemi

```
PROBLEMA: Testo a diverse distanze
┌─────────────────────────────────────┐
│                                     │
│   Vicino: dettaglio necessario     │
│   Lontano: forma chiara            │
│                                     │
│   SDF si adatta automaticamente    │
│   alla distanza di rendering       │
│                                     │
└─────────────────────────────────────┘

SOLUZIONE SDF:
- Edge detection via threshold nel shader
- Antialiasing calcolato per-pixel
- Nessun artifact di scaling
```

### Confronto Visivo in VR

```
Bitmap 512px visto da vicino:     SDF visto da vicino:
░░▓▓██████▓▓░░                    ████████████
░▓██████████▓░                    ████████████
▓████    ████▓                    ████    ████
████      ████         →          ████    ████
████      ████                    ████    ████
▓████    ████▓                    ████    ████
░▓██████████▓░                    ████████████
░░▓▓██████▓▓░░                    ████████████
   (sfocato)                       (nitido)
```

---

## Generazione Font SDF

### Tool Consigliati

#### 1. msdf-atlas-gen (Raccomandato)

Multi-channel SDF per massima qualità:

```bash
# Installazione
git clone https://github.com/Chlumsky/msdf-atlas-gen
cd msdf-atlas-gen
cmake -B build
cmake --build build

# Generazione MSDF (Multi-channel)
msdf-atlas-gen \
  -font NotoSans-Regular.ttf \
  -type msdf \
  -size 48 \
  -pxrange 4 \
  -charset charset.txt \
  -imageout atlas.png \
  -json atlas.json
```

#### 2. Hiero (Per Unity/LibGDX)

```bash
# Download da: https://libgdx.com/wiki/tools/hiero

# Configurazione per SDF:
# - Distance field: ON
# - Spread: 4-8
# - Scale: 32-64
```

#### 3. BMFont + SDF Generator

```bash
# 1. Genera bitmap con BMFont
# 2. Converti in SDF con:
python sdf_generator.py input.png output_sdf.png --spread 8
```

### Parametri di Generazione

```yaml
# Configurazione Ottimale per VR
font_settings:
  type: msdf              # Multi-channel SDF
  size: 48                # Base size in pixel
  pxrange: 4              # Pixel range per SDF
  miter_limit: 2.0        # Angoli sharp

atlas_settings:
  width: 2048             # Potenza di 2
  height: 2048
  padding: 4              # Spazio tra glifi

charset:
  - basic_latin          # A-Z, a-z, 0-9
  - latin_extended_a     # Caratteri accentati
  - punctuation          # Punteggiatura
  - symbols              # Simboli comuni
```

### Script di Generazione Automatica

```python
#!/usr/bin/env python3
"""
generate_sdf_font.py
Genera font SDF ottimizzati per VR
"""

import subprocess
import json
from pathlib import Path

def generate_vr_font(font_path: str, output_dir: str, charset_file: str = None):
    """
    Genera font SDF con parametri ottimizzati per VR
    """
    font_name = Path(font_path).stem
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Charset di default per libri
    default_charset = """
    ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz
    0123456789
    ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ
    .,;:!?'"()-–—…«»""''
    @#$%&*+=/\\[]{}|<>~^`
    €£¥¢©®™°±×÷
    """

    if charset_file:
        with open(charset_file, 'r', encoding='utf-8') as f:
            charset = f.read()
    else:
        charset = default_charset

    # Salva charset temporaneo
    charset_path = output_path / "charset.txt"
    with open(charset_path, 'w', encoding='utf-8') as f:
        f.write(charset)

    # Genera MSDF atlas
    cmd = [
        "msdf-atlas-gen",
        "-font", font_path,
        "-type", "msdf",
        "-size", "48",
        "-pxrange", "4",
        "-charset", str(charset_path),
        "-imageout", str(output_path / f"{font_name}_msdf.png"),
        "-json", str(output_path / f"{font_name}_msdf.json")
    ]

    subprocess.run(cmd, check=True)

    print(f"Font SDF generato: {output_path / font_name}_msdf.png")
    return output_path / f"{font_name}_msdf.json"

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Uso: python generate_sdf_font.py <font.ttf> <output_dir>")
        sys.exit(1)

    generate_vr_font(sys.argv[1], sys.argv[2])
```

---

## Font Consigliati

### Tier 1: Massima Leggibilità VR

| Font | Tipo | Uso Consigliato | Note |
|------|------|-----------------|------|
| **Noto Sans** | Sans-serif | Corpo testo | Eccellente supporto Unicode |
| **Inter** | Sans-serif | UI/Intestazioni | Ottimizzato per schermi |
| **Atkinson Hyperlegible** | Sans-serif | Accessibilità | Distingue caratteri simili |
| **Source Sans Pro** | Sans-serif | Testo lungo | Adobe, ottimo per lettura |

### Tier 2: Qualità Alta

| Font | Tipo | Uso Consigliato | Note |
|------|------|-----------------|------|
| **Roboto** | Sans-serif | Android-style | Geometrico, pulito |
| **Open Sans** | Sans-serif | Universale | Molto leggibile |
| **Literata** | Serif | Libri classici | Progettato per e-reader |
| **Merriweather** | Serif | Lettura prolungata | Ottimo per corpo testo |

### Tier 3: Casi Speciali

| Font | Tipo | Uso Consigliato | Note |
|------|------|-----------------|------|
| **JetBrains Mono** | Monospace | Codice/tech | Ligature, distinguibile |
| **Fira Code** | Monospace | Programmazione | Ligature per operatori |
| **Lexend** | Sans-serif | Dislessia-friendly | Spaziatura variabile |

### Caratteristiche Font VR-Friendly

```
BUONO per VR:                    EVITARE in VR:
✓ Altezza x elevata              ✗ Tratti sottili
✓ Aperture ampie                 ✗ Serif decorativi
✓ Spaziatura generosa            ✗ Pesi ultra-light
✓ Forme distinguibili            ✗ Font condensati
✓ Contrasto consistente          ✗ Script/calligrafici

Esempi di glifi problematici:
- Il, 1l, |1 → devono essere distinguibili
- 0O, oO → forme diverse
- rn vs m → aperture chiare
```

### Download Font Consigliati

```bash
# Noto Sans (Google)
wget https://fonts.google.com/download?family=Noto%20Sans

# Inter (rsms)
wget https://github.com/rsms/inter/releases/download/v4.0/Inter-4.0.zip

# Atkinson Hyperlegible (Braille Institute)
wget https://brailleinstitute.org/freefont

# Literata (Google)
wget https://fonts.google.com/download?family=Literata
```

---

## Dimensioni e Spaziatura

### Dimensioni Testo in VR

```
Distanza di Lettura Ottimale: 1-2 metri

┌────────────────────────────────────────────┐
│                                            │
│   Titolo:      0.08 - 0.12 m              │
│   (24-36 pt equivalente)                   │
│                                            │
│   Sottotitolo: 0.05 - 0.07 m              │
│   (18-24 pt equivalente)                   │
│                                            │
│   Corpo:       0.03 - 0.05 m              │
│   (14-18 pt equivalente)                   │
│                                            │
│   Caption:     0.02 - 0.03 m              │
│   (10-12 pt equivalente)                   │
│                                            │
└────────────────────────────────────────────┘

Formula: altezza_metri = altezza_angolare * distanza * tan(1°)
```

### Calcolo Dimensioni

```typescript
/**
 * Calcola la dimensione font ottimale per VR
 */
interface VRTextConfig {
  distanceMeters: number;      // Distanza testo-utente
  targetArcMinutes: number;    // Dimensione angolare desiderata
  baseFontSize: number;        // Font size di base in unità mondo
}

function calculateVRFontSize(config: VRTextConfig): number {
  // 1 arc minute = 1/60 grado
  const arcDegrees = config.targetArcMinutes / 60;
  const radians = arcDegrees * (Math.PI / 180);

  // Altezza in metri per il carattere
  const heightMeters = 2 * config.distanceMeters * Math.tan(radians / 2);

  return heightMeters;
}

// Configurazioni consigliate per Onde Books VR
const VR_TEXT_PRESETS = {
  title: {
    arcMinutes: 40,     // Grande, facilmente leggibile
    lineHeight: 1.3,
    letterSpacing: 0.02
  },
  heading: {
    arcMinutes: 30,
    lineHeight: 1.35,
    letterSpacing: 0.01
  },
  body: {
    arcMinutes: 24,     // Standard per lettura prolungata
    lineHeight: 1.5,
    letterSpacing: 0.005
  },
  caption: {
    arcMinutes: 18,
    lineHeight: 1.4,
    letterSpacing: 0.01
  }
};
```

### Spaziatura Ottimale

```
LINE HEIGHT (Interlinea)
─────────────────────────
Corpo testo:    1.4 - 1.6
Titoli:         1.2 - 1.4
Liste:          1.6 - 1.8

Troppo stretto:          Ottimale:              Troppo largo:
┌──────────────┐        ┌──────────────┐       ┌──────────────┐
│Lorem ipsum   │        │Lorem ipsum   │       │Lorem ipsum   │
│dolor sit amet│        │              │       │              │
│consectetur   │        │dolor sit amet│       │              │
│adipiscing    │        │              │       │dolor sit amet│
└──────────────┘        │consectetur   │       │              │
  (faticoso)            └──────────────┘       └──────────────┘
                          (confortevole)         (disconnesso)


LETTER SPACING (Tracking)
─────────────────────────
Corpo:          0 - 0.01 em
Titoli:         0.01 - 0.03 em
ALL CAPS:       0.05 - 0.1 em

WORD SPACING
─────────────────────────
Standard:       0.25 em
VR consigliato: 0.3 - 0.35 em
```

### Larghezza Colonna

```
CARATTERI PER RIGA OTTIMALI
───────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  45-75 caratteri per riga = leggibilità ottimale           │
│                                                             │
│  In VR: preferire 50-60 caratteri                          │
│  (movimenti oculari ridotti)                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Troppo stretto (<40):     Ottimale (50-60):        Troppo largo (>80):
┌────────────┐            ┌──────────────────┐     ┌─────────────────────────┐
│Lorem ipsum │            │Lorem ipsum dolor │     │Lorem ipsum dolor sit    │
│dolor sit   │            │sit amet,         │     │amet, consectetur        │
│amet,       │            │consectetur       │     │adipiscing elit. Sed do  │
│consectetur │            │adipiscing elit.  │     │eiusmod tempor           │
└────────────┘            └──────────────────┘     └─────────────────────────┘
(frammentato)             (fluido)                 (perdi il segno)
```

---

## Shader per Rendering

### Shader SDF Base (GLSL)

```glsl
// sdf_text.vert
#version 300 es
precision highp float;

in vec3 a_position;
in vec2 a_texCoord;

uniform mat4 u_mvpMatrix;

out vec2 v_texCoord;

void main() {
    gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
    v_texCoord = a_texCoord;
}
```

```glsl
// sdf_text.frag
#version 300 es
precision highp float;

in vec2 v_texCoord;

uniform sampler2D u_sdfTexture;
uniform vec4 u_textColor;
uniform float u_smoothing;      // Tipicamente 0.1 - 0.25
uniform float u_threshold;       // Tipicamente 0.5

out vec4 fragColor;

void main() {
    float distance = texture(u_sdfTexture, v_texCoord).a;

    // Calcola smoothing adattivo basato su derivate
    float smoothWidth = fwidth(distance) * u_smoothing;

    // Antialiasing via smoothstep
    float alpha = smoothstep(u_threshold - smoothWidth,
                            u_threshold + smoothWidth,
                            distance);

    fragColor = vec4(u_textColor.rgb, u_textColor.a * alpha);
}
```

### Shader MSDF (Multi-channel)

```glsl
// msdf_text.frag
#version 300 es
precision highp float;

in vec2 v_texCoord;

uniform sampler2D u_msdfTexture;
uniform vec4 u_textColor;
uniform float u_pxRange;        // Pixel range usato in generazione

out vec4 fragColor;

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

float screenPxRange() {
    vec2 unitRange = vec2(u_pxRange) / vec2(textureSize(u_msdfTexture, 0));
    vec2 screenTexSize = vec2(1.0) / fwidth(v_texCoord);
    return max(0.5 * dot(unitRange, screenTexSize), 1.0);
}

void main() {
    vec3 msd = texture(u_msdfTexture, v_texCoord).rgb;
    float sd = median(msd.r, msd.g, msd.b);

    float screenPxDistance = screenPxRange() * (sd - 0.5);
    float opacity = clamp(screenPxDistance + 0.5, 0.0, 1.0);

    fragColor = vec4(u_textColor.rgb, u_textColor.a * opacity);
}
```

### Shader con Effetti VR

```glsl
// vr_text_effects.frag
#version 300 es
precision highp float;

in vec2 v_texCoord;
in vec3 v_worldPos;

uniform sampler2D u_msdfTexture;
uniform vec4 u_textColor;
uniform vec4 u_outlineColor;
uniform vec4 u_shadowColor;
uniform float u_pxRange;
uniform float u_outlineWidth;    // 0.0 - 0.5
uniform vec2 u_shadowOffset;     // In UV space
uniform float u_shadowSoftness;
uniform vec3 u_cameraPos;

out vec4 fragColor;

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

float screenPxRange() {
    vec2 unitRange = vec2(u_pxRange) / vec2(textureSize(u_msdfTexture, 0));
    vec2 screenTexSize = vec2(1.0) / fwidth(v_texCoord);
    return max(0.5 * dot(unitRange, screenTexSize), 1.0);
}

float getSDF(vec2 uv) {
    vec3 msd = texture(u_msdfTexture, uv).rgb;
    return median(msd.r, msd.g, msd.b);
}

void main() {
    float pxRange = screenPxRange();

    // Testo principale
    float sd = getSDF(v_texCoord);
    float textOpacity = clamp(pxRange * (sd - 0.5) + 0.5, 0.0, 1.0);

    // Outline
    float outlineOuter = 0.5 - u_outlineWidth;
    float outlineOpacity = clamp(pxRange * (sd - outlineOuter) + 0.5, 0.0, 1.0);

    // Shadow
    float shadowSd = getSDF(v_texCoord - u_shadowOffset);
    float shadowOpacity = clamp(pxRange * u_shadowSoftness * (shadowSd - 0.5) + 0.5, 0.0, 1.0);

    // Composizione
    vec4 shadow = vec4(u_shadowColor.rgb, u_shadowColor.a * shadowOpacity * (1.0 - textOpacity));
    vec4 outline = vec4(u_outlineColor.rgb, u_outlineColor.a * outlineOpacity * (1.0 - textOpacity));
    vec4 text = vec4(u_textColor.rgb, u_textColor.a * textOpacity);

    // Distance-based fade per VR (opzionale)
    float dist = length(v_worldPos - u_cameraPos);
    float distanceFade = smoothstep(10.0, 8.0, dist); // Fade oltre 8-10 metri

    fragColor = shadow + outline + text;
    fragColor.a *= distanceFade;
}
```

### Shader Subpixel Rendering

```glsl
// subpixel_msdf.frag - Per display LCD in VR
#version 300 es
precision highp float;

in vec2 v_texCoord;

uniform sampler2D u_msdfTexture;
uniform vec4 u_textColor;
uniform float u_pxRange;
uniform vec2 u_texelSize;

out vec4 fragColor;

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

void main() {
    // Campiona 3 posizioni per subpixel RGB
    vec2 offsetR = vec2(-u_texelSize.x * 0.333, 0.0);
    vec2 offsetB = vec2(u_texelSize.x * 0.333, 0.0);

    vec3 msdR = texture(u_msdfTexture, v_texCoord + offsetR).rgb;
    vec3 msdG = texture(u_msdfTexture, v_texCoord).rgb;
    vec3 msdB = texture(u_msdfTexture, v_texCoord + offsetB).rgb;

    float sdR = median(msdR.r, msdR.g, msdR.b);
    float sdG = median(msdG.r, msdG.g, msdG.b);
    float sdB = median(msdB.r, msdB.g, msdB.b);

    vec2 unitRange = vec2(u_pxRange) / vec2(textureSize(u_msdfTexture, 0));
    vec2 screenTexSize = vec2(1.0) / fwidth(v_texCoord);
    float pxRange = max(0.5 * dot(unitRange, screenTexSize), 1.0);

    vec3 alpha = clamp(pxRange * (vec3(sdR, sdG, sdB) - 0.5) + 0.5, 0.0, 1.0);

    fragColor = vec4(u_textColor.rgb * alpha, max(max(alpha.r, alpha.g), alpha.b));
}
```

---

## Implementazione Unity

### Setup TextMesh Pro con SDF

```csharp
// VRTextManager.cs
using UnityEngine;
using TMPro;

namespace OndeBooks.VR.Text
{
    /// <summary>
    /// Gestisce il rendering del testo SDF ottimizzato per VR
    /// </summary>
    public class VRTextManager : MonoBehaviour
    {
        [Header("Font Assets")]
        [SerializeField] private TMP_FontAsset bodyFont;
        [SerializeField] private TMP_FontAsset headingFont;

        [Header("VR Settings")]
        [SerializeField] private float readingDistance = 1.5f;
        [SerializeField] private float bodyArcMinutes = 24f;
        [SerializeField] private float headingArcMinutes = 36f;

        [Header("Style")]
        [SerializeField] private Color textColor = Color.white;
        [SerializeField] private Color outlineColor = new Color(0, 0, 0, 0.5f);
        [SerializeField] private float outlineWidth = 0.1f;

        /// <summary>
        /// Calcola la dimensione font per VR basata su arc minutes
        /// </summary>
        public float CalculateVRFontSize(float arcMinutes, float distance)
        {
            float arcDegrees = arcMinutes / 60f;
            float radians = arcDegrees * Mathf.Deg2Rad;
            return 2f * distance * Mathf.Tan(radians / 2f);
        }

        /// <summary>
        /// Configura un TextMeshPro per ottimale lettura VR
        /// </summary>
        public void ConfigureVRText(TextMeshPro tmp, VRTextStyle style)
        {
            switch (style)
            {
                case VRTextStyle.Body:
                    ConfigureBodyText(tmp);
                    break;
                case VRTextStyle.Heading:
                    ConfigureHeadingText(tmp);
                    break;
                case VRTextStyle.Caption:
                    ConfigureCaptionText(tmp);
                    break;
            }
        }

        private void ConfigureBodyText(TextMeshPro tmp)
        {
            tmp.font = bodyFont;
            tmp.fontSize = CalculateVRFontSize(bodyArcMinutes, readingDistance);
            tmp.color = textColor;
            tmp.lineSpacing = 20f;       // 20% extra
            tmp.characterSpacing = 2f;   // Slight increase
            tmp.wordSpacing = 10f;       // 10% extra

            // Enable outline for better contrast
            tmp.outlineWidth = outlineWidth;
            tmp.outlineColor = outlineColor;

            // SDF-specific settings
            tmp.fontSharedMaterial.SetFloat("_OutlineSoftness", 0.1f);
        }

        private void ConfigureHeadingText(TextMeshPro tmp)
        {
            tmp.font = headingFont;
            tmp.fontSize = CalculateVRFontSize(headingArcMinutes, readingDistance);
            tmp.color = textColor;
            tmp.lineSpacing = 10f;
            tmp.characterSpacing = 5f;

            tmp.outlineWidth = outlineWidth * 1.5f;
            tmp.outlineColor = outlineColor;
        }

        private void ConfigureCaptionText(TextMeshPro tmp)
        {
            tmp.font = bodyFont;
            tmp.fontSize = CalculateVRFontSize(18f, readingDistance);
            tmp.color = new Color(textColor.r, textColor.g, textColor.b, 0.8f);
            tmp.lineSpacing = 15f;
            tmp.characterSpacing = 3f;
        }
    }

    public enum VRTextStyle
    {
        Body,
        Heading,
        Caption
    }
}
```

### Material SDF Personalizzato

```csharp
// VRTextMaterial.cs
using UnityEngine;
using TMPro;

namespace OndeBooks.VR.Text
{
    /// <summary>
    /// Configura materiali SDF per VR
    /// </summary>
    [CreateAssetMenu(fileName = "VRTextMaterial", menuName = "Onde Books/VR Text Material")]
    public class VRTextMaterialConfig : ScriptableObject
    {
        [Header("Face")]
        public Color faceColor = Color.white;
        public float faceDilate = 0f;
        public float faceSoftness = 0f;

        [Header("Outline")]
        public bool enableOutline = true;
        public Color outlineColor = new Color(0, 0, 0, 0.5f);
        public float outlineThickness = 0.1f;
        public float outlineSoftness = 0.05f;

        [Header("Underlay (Shadow)")]
        public bool enableUnderlay = false;
        public Color underlayColor = new Color(0, 0, 0, 0.3f);
        public Vector2 underlayOffset = new Vector2(0.5f, -0.5f);
        public float underlayDilate = 0f;
        public float underlaySoftness = 0.2f;

        [Header("Glow")]
        public bool enableGlow = false;
        public Color glowColor = new Color(1, 1, 1, 0.2f);
        public float glowOffset = 0f;
        public float glowInner = 0f;
        public float glowOuter = 0.5f;
        public float glowPower = 1f;

        /// <summary>
        /// Applica configurazione a un materiale TMP
        /// </summary>
        public void ApplyToMaterial(Material mat)
        {
            // Face
            mat.SetColor("_FaceColor", faceColor);
            mat.SetFloat("_FaceDilate", faceDilate);
            mat.SetFloat("_FaceSoftness", faceSoftness);

            // Outline
            if (enableOutline)
            {
                mat.EnableKeyword("OUTLINE_ON");
                mat.SetColor("_OutlineColor", outlineColor);
                mat.SetFloat("_OutlineWidth", outlineThickness);
                mat.SetFloat("_OutlineSoftness", outlineSoftness);
            }
            else
            {
                mat.DisableKeyword("OUTLINE_ON");
            }

            // Underlay
            if (enableUnderlay)
            {
                mat.EnableKeyword("UNDERLAY_ON");
                mat.SetColor("_UnderlayColor", underlayColor);
                mat.SetFloat("_UnderlayOffsetX", underlayOffset.x);
                mat.SetFloat("_UnderlayOffsetY", underlayOffset.y);
                mat.SetFloat("_UnderlayDilate", underlayDilate);
                mat.SetFloat("_UnderlaySoftness", underlaySoftness);
            }
            else
            {
                mat.DisableKeyword("UNDERLAY_ON");
            }

            // Glow
            if (enableGlow)
            {
                mat.EnableKeyword("GLOW_ON");
                mat.SetColor("_GlowColor", glowColor);
                mat.SetFloat("_GlowOffset", glowOffset);
                mat.SetFloat("_GlowInner", glowInner);
                mat.SetFloat("_GlowOuter", glowOuter);
                mat.SetFloat("_GlowPower", glowPower);
            }
            else
            {
                mat.DisableKeyword("GLOW_ON");
            }
        }
    }
}
```

### Generazione Font Asset

```csharp
// Editor/SDFFontGenerator.cs
#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using TMPro;
using System.IO;

namespace OndeBooks.VR.Text.Editor
{
    public class SDFFontGenerator : EditorWindow
    {
        private Font sourceFont;
        private int atlasResolution = 2048;
        private int samplingPointSize = 90;
        private int padding = 5;
        private AtlasRenderMode renderMode = AtlasRenderMode.SDFAA;

        [MenuItem("Onde Books/Generate SDF Font")]
        public static void ShowWindow()
        {
            GetWindow<SDFFontGenerator>("SDF Font Generator");
        }

        private void OnGUI()
        {
            GUILayout.Label("SDF Font Generator per VR", EditorStyles.boldLabel);

            sourceFont = (Font)EditorGUILayout.ObjectField("Source Font", sourceFont, typeof(Font), false);
            atlasResolution = EditorGUILayout.IntPopup("Atlas Resolution", atlasResolution,
                new string[] { "512", "1024", "2048", "4096" },
                new int[] { 512, 1024, 2048, 4096 });
            samplingPointSize = EditorGUILayout.IntSlider("Sampling Size", samplingPointSize, 10, 200);
            padding = EditorGUILayout.IntSlider("Padding", padding, 1, 10);
            renderMode = (AtlasRenderMode)EditorGUILayout.EnumPopup("Render Mode", renderMode);

            if (GUILayout.Button("Generate Font Asset") && sourceFont != null)
            {
                GenerateFontAsset();
            }
        }

        private void GenerateFontAsset()
        {
            // Usa l'API di TMP per generare font asset
            string path = AssetDatabase.GetAssetPath(sourceFont);
            string outputPath = Path.GetDirectoryName(path) + "/" + sourceFont.name + "_SDF.asset";

            // Nota: La generazione effettiva richiede TMP_FontAssetCreator
            // Questo è un esempio semplificato
            Debug.Log($"Generating SDF font at: {outputPath}");
            Debug.Log($"Settings: {atlasResolution}px, {samplingPointSize}pt, padding {padding}");

            EditorUtility.DisplayDialog("SDF Generator",
                "Use Window > TextMeshPro > Font Asset Creator with these settings:\n" +
                $"- Atlas Resolution: {atlasResolution}\n" +
                $"- Sampling Point Size: {samplingPointSize}\n" +
                $"- Padding: {padding}\n" +
                $"- Render Mode: {renderMode}",
                "OK");
        }
    }
}
#endif
```

---

## Implementazione Godot

### Setup Font SDF in Godot 4

```gdscript
# vr_text_manager.gd
extends Node
class_name VRTextManager

## Gestisce il rendering testo SDF per VR in Godot

@export_group("Fonts")
@export var body_font: Font
@export var heading_font: Font

@export_group("VR Settings")
@export var reading_distance: float = 1.5
@export var body_arc_minutes: float = 24.0
@export var heading_arc_minutes: float = 36.0

@export_group("Style")
@export var text_color: Color = Color.WHITE
@export var outline_color: Color = Color(0, 0, 0, 0.5)
@export var outline_size: int = 4

## Calcola dimensione font per VR
func calculate_vr_font_size(arc_minutes: float, distance: float) -> float:
    var arc_degrees = arc_minutes / 60.0
    var radians = deg_to_rad(arc_degrees)
    return 2.0 * distance * tan(radians / 2.0)

## Configura Label3D per VR
func configure_vr_label(label: Label3D, style: VRTextStyle) -> void:
    match style:
        VRTextStyle.BODY:
            _configure_body(label)
        VRTextStyle.HEADING:
            _configure_heading(label)
        VRTextStyle.CAPTION:
            _configure_caption(label)

func _configure_body(label: Label3D) -> void:
    label.font = body_font
    label.font_size = int(calculate_vr_font_size(body_arc_minutes, reading_distance) * 1000)
    label.modulate = text_color
    label.outline_modulate = outline_color
    label.outline_size = outline_size

    # SDF settings
    label.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
    label.render_priority = 1

func _configure_heading(label: Label3D) -> void:
    label.font = heading_font
    label.font_size = int(calculate_vr_font_size(heading_arc_minutes, reading_distance) * 1000)
    label.modulate = text_color
    label.outline_modulate = outline_color
    label.outline_size = int(outline_size * 1.5)

func _configure_caption(label: Label3D) -> void:
    label.font = body_font
    label.font_size = int(calculate_vr_font_size(18.0, reading_distance) * 1000)
    label.modulate = Color(text_color.r, text_color.g, text_color.b, 0.8)
    label.outline_size = outline_size

enum VRTextStyle {
    BODY,
    HEADING,
    CAPTION
}
```

### Shader SDF Custom per Godot

```gdshader
// vr_msdf_text.gdshader
shader_type spatial;
render_mode blend_mix, depth_draw_opaque, cull_back, diffuse_burley, specular_schlick_ggx;

uniform sampler2D msdf_texture : source_color, filter_linear_mipmap;
uniform vec4 text_color : source_color = vec4(1.0);
uniform vec4 outline_color : source_color = vec4(0.0, 0.0, 0.0, 0.5);
uniform float outline_width : hint_range(0.0, 0.5) = 0.1;
uniform float px_range : hint_range(1.0, 10.0) = 4.0;
uniform float softness : hint_range(0.0, 1.0) = 0.1;

float median(vec3 v) {
    return max(min(v.r, v.g), min(max(v.r, v.g), v.b));
}

float screen_px_range(vec2 uv) {
    vec2 unit_range = vec2(px_range) / vec2(textureSize(msdf_texture, 0));
    vec2 screen_tex_size = vec2(1.0) / fwidth(uv);
    return max(0.5 * dot(unit_range, screen_tex_size), 1.0);
}

void fragment() {
    vec2 uv = UV;
    float spr = screen_px_range(uv);

    vec3 msd = texture(msdf_texture, uv).rgb;
    float sd = median(msd);

    // Testo
    float text_alpha = clamp(spr * (sd - 0.5) + 0.5, 0.0, 1.0);

    // Outline
    float outline_outer = 0.5 - outline_width;
    float outline_alpha = clamp(spr * (sd - outline_outer) + 0.5, 0.0, 1.0);
    float outline_mask = outline_alpha * (1.0 - text_alpha);

    // Composizione
    vec3 final_color = mix(outline_color.rgb, text_color.rgb, text_alpha);
    float final_alpha = max(text_alpha * text_color.a, outline_mask * outline_color.a);

    // Softness per antialiasing
    final_alpha = mix(final_alpha, smoothstep(0.0, 1.0, final_alpha), softness);

    ALBEDO = final_color;
    ALPHA = final_alpha;
    ALPHA_SCISSOR_THRESHOLD = 0.01;
}
```

### Generazione Font con Godot Import

```gdscript
# editor/sdf_font_importer.gd
@tool
extends EditorPlugin

const IMPORT_SETTINGS = {
    "multichannel_signed_distance_field": true,
    "msdf_pixel_range": 8,
    "msdf_size": 48,
    "force_autohinter": false,
    "hinting": 1,  # Light
    "subpixel_positioning": 1,  # Auto
    "oversampling": 2.0
}

func _enter_tree() -> void:
    print("SDF Font Importer loaded")

## Configura import settings per font SDF
static func configure_font_import(font_path: String) -> void:
    var import_file = font_path + ".import"

    var config = ConfigFile.new()
    if config.load(import_file) != OK:
        push_error("Cannot load import file: " + import_file)
        return

    # Applica settings SDF
    for key in IMPORT_SETTINGS:
        config.set_value("params", key, IMPORT_SETTINGS[key])

    config.save(import_file)
    print("Font import configured for SDF: " + font_path)
```

### Scene VR Book Page

```gdscript
# vr_book_page.gd
extends Node3D
class_name VRBookPage

## Rappresenta una pagina di libro in VR con testo SDF

@export var text_manager: VRTextManager

@onready var title_label: Label3D = $TitleLabel
@onready var body_container: Node3D = $BodyContainer
@onready var page_number_label: Label3D = $PageNumberLabel

var _body_labels: Array[Label3D] = []
const MAX_CHARS_PER_LINE = 55
const MAX_LINES_PER_PAGE = 25

func _ready() -> void:
    _setup_labels()

func _setup_labels() -> void:
    # Configura titolo
    text_manager.configure_vr_label(title_label, VRTextManager.VRTextStyle.HEADING)

    # Configura numero pagina
    text_manager.configure_vr_label(page_number_label, VRTextManager.VRTextStyle.CAPTION)

    # Pre-crea label per corpo testo
    for i in range(MAX_LINES_PER_PAGE):
        var label = Label3D.new()
        label.position.y = -i * 0.035  # Spaziatura linee
        text_manager.configure_vr_label(label, VRTextManager.VRTextStyle.BODY)
        body_container.add_child(label)
        _body_labels.append(label)

## Imposta contenuto pagina
func set_content(title: String, body: String, page_num: int) -> void:
    title_label.text = title
    page_number_label.text = str(page_num)

    # Word wrap manuale per controllo preciso
    var lines = _word_wrap(body, MAX_CHARS_PER_LINE)

    for i in range(MAX_LINES_PER_PAGE):
        if i < lines.size():
            _body_labels[i].text = lines[i]
            _body_labels[i].visible = true
        else:
            _body_labels[i].visible = false

func _word_wrap(text: String, max_chars: int) -> Array[String]:
    var lines: Array[String] = []
    var words = text.split(" ")
    var current_line = ""

    for word in words:
        if current_line.length() + word.length() + 1 <= max_chars:
            if current_line.length() > 0:
                current_line += " "
            current_line += word
        else:
            if current_line.length() > 0:
                lines.append(current_line)
            current_line = word

    if current_line.length() > 0:
        lines.append(current_line)

    return lines
```

---

## Best Practices

### Checklist Implementazione

```
PRE-PRODUZIONE
□ Selezionare font appropriati (vedere sezione Font Consigliati)
□ Generare atlas MSDF con parametri corretti
□ Testare charset completo (accenti, simboli)
□ Verificare qualità a diverse distanze

RUNTIME
□ Implementare shader MSDF con antialiasing adattivo
□ Configurare dimensioni basate su arc minutes
□ Impostare spaziatura ottimale (line height, letter spacing)
□ Aggiungere outline per contrasto

OTTIMIZZAZIONE
□ Usare atlas condivisi per font simili
□ Implementare LOD per testo distante
□ Batch draw calls per testo statico
□ Profile GPU per overhead shader

TESTING VR
□ Testare su hardware target (Quest, PCVR, etc.)
□ Verificare leggibilità a 1m, 1.5m, 2m
□ Controllare confort visivo per lettura prolungata
□ Testare con utenti reali
```

### Errori Comuni da Evitare

```
❌ ERRORI FREQUENTI                    ✓ SOLUZIONI

Font bitmap invece di SDF              Generare sempre MSDF
├─ Sfocato da vicino                   └─ Nitido a qualsiasi distanza
└─ Pixelato da lontano

Dimensioni fisse in pixel              Calcolare da arc minutes
├─ Troppo piccolo/grande               └─ Adattivo alla distanza
└─ Non scala con distanza

Outline hardcoded                      Outline via shader SDF
├─ Richiede texture separate           └─ Single-pass, configurabile
└─ Memoria extra

Antialiasing assente                   fwidth() per AA adattivo
├─ Bordi seghettati                    └─ Smooth a ogni distanza
└─ Shimmer in movimento

Spaziatura default                     Aumentare per VR
├─ Testo compresso                     └─ Line height 1.5+
└─ Faticoso da leggere                 └─ Letter spacing positivo

Charset incompleto                     Includere tutti caratteri necessari
├─ Caratteri mancanti = □              └─ Latin extended + simboli
└─ Crash o glitch
```

### Performance Tips

```
MEMORIA
─────────────────────────────────────────
• Atlas 2048x2048 per ~500 glifi
• MSDF usa 3 canali (RGB) vs 1 per SDF
• Compressione: BC7 o ETC2 per mobile
• Mipmap: abilitare per testo distante

GPU
─────────────────────────────────────────
• Batch: raggruppare testo con stesso materiale
• Shader complexity: MSDF è ~20% più costoso di SDF base
• Overdraw: outline/glow aggiungono fill rate
• Mobile: preferire SDF single-channel

DRAW CALLS
─────────────────────────────────────────
Unity:
• TextMesh Pro usa SRP Batcher
• Stesso font + materiale = 1 batch

Godot:
• Label3D con stesso material = batched
• MultiMeshInstance3D per testo ripetuto
```

### Risorse Aggiuntive

```
TOOL
─────────────────────────────────────────
• msdf-atlas-gen: https://github.com/Chlumsky/msdf-atlas-gen
• msdfgen: https://github.com/Chlumsky/msdfgen
• Hiero: https://libgdx.com/wiki/tools/hiero
• Font Forge: https://fontforge.org/

FONT GRATUITI VR-FRIENDLY
─────────────────────────────────────────
• Google Fonts: https://fonts.google.com/
• Font Squirrel: https://www.fontsquirrel.com/
• Braille Institute (Atkinson): https://brailleinstitute.org/freefont

DOCUMENTAZIONE
─────────────────────────────────────────
• TMP Documentation: https://docs.unity3d.com/Packages/com.unity.textmeshpro@latest
• Godot Font Docs: https://docs.godotengine.org/en/stable/tutorials/ui/gui_using_fonts.html
• SDF Paper (Valve): https://steamcdn-a.akamaihd.net/apps/valve/2007/SIGGRAPH2007_AlphaTestedMagnification.pdf

ARTICOLI TECNICI
─────────────────────────────────────────
• "Improved Alpha-Tested Magnification" - Valve, SIGGRAPH 2007
• "Multi-channel signed distance field generator" - Viktor Chlumský
• "Distance Field Fonts" - LibGDX Wiki
```

---

## Appendice: Configurazioni Pronte

### Preset Unity - Onde Books VR

```csharp
// Presets/VRBookTextPresets.cs
public static class VRBookTextPresets
{
    public static readonly TextConfig ChapterTitle = new TextConfig
    {
        FontSize = 0.08f,      // 8cm a 1.5m
        LineSpacing = 30,
        CharacterSpacing = 5,
        OutlineWidth = 0.15f,
        OutlineColor = new Color(0, 0, 0, 0.4f)
    };

    public static readonly TextConfig SectionHeading = new TextConfig
    {
        FontSize = 0.05f,
        LineSpacing = 25,
        CharacterSpacing = 3,
        OutlineWidth = 0.1f,
        OutlineColor = new Color(0, 0, 0, 0.3f)
    };

    public static readonly TextConfig BodyText = new TextConfig
    {
        FontSize = 0.035f,     // 3.5cm a 1.5m = ~24 arc min
        LineSpacing = 20,
        CharacterSpacing = 1,
        OutlineWidth = 0.08f,
        OutlineColor = new Color(0, 0, 0, 0.25f)
    };

    public static readonly TextConfig Footnote = new TextConfig
    {
        FontSize = 0.025f,
        LineSpacing = 15,
        CharacterSpacing = 2,
        OutlineWidth = 0.05f,
        OutlineColor = new Color(0, 0, 0, 0.2f)
    };
}
```

### Preset Godot - Onde Books VR

```gdscript
# presets/vr_book_text_presets.gd
class_name VRBookTextPresets

const CHAPTER_TITLE = {
    "font_size": 80,       # mm
    "line_spacing": 1.3,
    "outline_size": 6,
    "outline_color": Color(0, 0, 0, 0.4)
}

const SECTION_HEADING = {
    "font_size": 50,
    "line_spacing": 1.35,
    "outline_size": 4,
    "outline_color": Color(0, 0, 0, 0.3)
}

const BODY_TEXT = {
    "font_size": 35,       # 35mm a 1.5m = ~24 arc min
    "line_spacing": 1.5,
    "outline_size": 3,
    "outline_color": Color(0, 0, 0, 0.25)
}

const FOOTNOTE = {
    "font_size": 25,
    "line_spacing": 1.4,
    "outline_size": 2,
    "outline_color": Color(0, 0, 0, 0.2)
}
```

---

*Guida creata per Onde Books VR - Gennaio 2025*
