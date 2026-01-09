# Guida alle Illustrazioni nei Libri VR

Questo documento descrive le best practices per visualizzare immagini e illustrazioni all'interno di libri ePub in ambiente VR (Meta Quest, PCVR).

---

## 1. Formati Immagine Supportati

### Formati Consigliati

| Formato | Pro | Contro | Uso Consigliato |
|---------|-----|--------|-----------------|
| **PNG** | Trasparenza, lossless | File piu' grandi | Illustrazioni con trasparenza, grafici |
| **JPG/JPEG** | File compatti, caricamento veloce | No trasparenza, artefatti compressione | Fotografie, copertine, sfondi |
| **WebP** | Ottimo rapporto qualita'/dimensione | Supporto variabile | Alternativa moderna a JPG |

### Formato Raccomandato per VR

**JPEG con qualita' 85-90%** per la maggior parte delle illustrazioni:
- Bilanciamento ottimale tra qualita' e performance
- Caricamento veloce (importante per fluidita' VR)
- Ampio supporto

**PNG** quando serve trasparenza (es. elementi sovrapposti al testo).

---

## 2. Risoluzione Ottimale per VR

### Il Problema del "Blur" in VR

In VR le immagini vengono visualizzate su display ad alta densita' (Quest 3: ~1800x1920 per occhio). Immagini a bassa risoluzione appaiono sfocate e sgranate.

### Risoluzioni Raccomandate

| Tipo Immagine | Risoluzione Minima | Risoluzione Ottimale | Note |
|---------------|-------------------|---------------------|------|
| **Copertina** | 1200 x 1600 px | 2400 x 3200 px | Sempre alta qualita' |
| **Illustrazione full-page** | 1600 x 2000 px | 2400 x 3000 px | Riempie la pagina virtuale |
| **Illustrazione half-page** | 1200 x 800 px | 1800 x 1200 px | Meta' pagina superiore/inferiore |
| **Thumbnail/icona** | 256 x 256 px | 512 x 512 px | Elementi decorativi piccoli |

### Formula per Calcolare Risoluzione VR

```
Risoluzione_ottimale = Dimensione_pagina_VR (metri) x PPM

Dove PPM (Pixels Per Meter) = ~3000 per VR nitido
```

**Esempio**: Pagina 40cm x 60cm
- Larghezza: 0.4m x 3000 = 1200px minimo
- Altezza: 0.6m x 3000 = 1800px minimo

### Impostazioni Unity/Godot per Texture VR

```csharp
// Unity - Import Settings per illustrazioni libri
textureImporter.textureType = TextureImporterType.Sprite;
textureImporter.maxTextureSize = 4096;  // Non limitare troppo
textureImporter.textureCompression = TextureImporterCompression.HighQuality;
textureImporter.mipmapEnabled = true;   // Mipmap per distanze variabili
textureImporter.filterMode = FilterMode.Trilinear;  // Smoothing
textureImporter.anisoLevel = 8;  // Anisotropic filtering per angoli
```

```gdscript
# Godot - Texture import presets
# In project.godot o .import file
compress/mode=0  # Lossless
mipmaps/generate=true
mipmaps/limit=-1
```

---

## 3. Posizionamento Immagini Rispetto al Testo

### Layout Standard Libro VR

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER (titolo capitolo, numero pagina)                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │              ILLUSTRAZIONE                               │ │
│  │              (zona superiore)                            │ │
│  │                                                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Lorem ipsum dolor sit amet, consectetur                     │
│  adipiscing elit. Sed do eiusmod tempor                      │
│  incididunt ut labore et dolore magna aliqua.                │
│  Ut enim ad minim veniam, quis nostrud...                    │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│  FOOTER (progress bar, controlli)                            │
└──────────────────────────────────────────────────────────────┘
```

### Tipologie di Layout

#### 1. Illustrazione Full-Page (Splash)
- L'immagine occupa tutta la pagina
- Nessun testo sulla stessa pagina
- Ideale per: copertine, scene importanti, inizio capitoli

#### 2. Illustrazione Top (Header Image)
- Immagine nella parte superiore (30-50% altezza pagina)
- Testo sotto l'immagine
- Ideale per: inizio paragrafi, scene descrittive

#### 3. Illustrazione Inline
- Immagine piccola all'interno del flusso di testo
- Testo scorre intorno (wrap)
- Ideale per: icone, simboli, piccole decorazioni

#### 4. Illustrazione Floating
- Immagine che "galleggia" sopra il testo con trasparenza
- Sfondo dell'immagine e' trasparente
- Ideale per: effetti artistici, sovrapposizioni

### Implementazione Unity

```csharp
public enum ImageLayout
{
    FullPage,
    TopHalf,
    BottomHalf,
    InlineLeft,
    InlineRight,
    Floating
}

public class PageLayoutManager : MonoBehaviour
{
    [SerializeField] private RectTransform imageContainer;
    [SerializeField] private RectTransform textContainer;
    [SerializeField] private float imageTextGap = 0.02f; // 2cm gap

    public void SetLayout(ImageLayout layout, Texture2D illustration)
    {
        switch (layout)
        {
            case ImageLayout.FullPage:
                imageContainer.anchorMin = Vector2.zero;
                imageContainer.anchorMax = Vector2.one;
                textContainer.gameObject.SetActive(false);
                break;

            case ImageLayout.TopHalf:
                imageContainer.anchorMin = new Vector2(0, 0.5f);
                imageContainer.anchorMax = Vector2.one;
                textContainer.anchorMin = Vector2.zero;
                textContainer.anchorMax = new Vector2(1, 0.5f - imageTextGap);
                break;

            case ImageLayout.InlineLeft:
                imageContainer.anchorMin = new Vector2(0, 0.6f);
                imageContainer.anchorMax = new Vector2(0.4f, 1f);
                // Text wrapping handled by TextMeshPro margins
                break;
        }
    }
}
```

### Implementazione Godot

```gdscript
# page_layout.gd
extends Control

enum Layout { FULL_PAGE, TOP_HALF, BOTTOM_HALF, INLINE_LEFT, INLINE_RIGHT, FLOATING }

@export var image_container: TextureRect
@export var text_container: RichTextLabel
@export var image_text_gap: float = 20.0  # pixels

func set_layout(layout: Layout, illustration: Texture2D) -> void:
    image_container.texture = illustration

    match layout:
        Layout.FULL_PAGE:
            image_container.anchor_left = 0
            image_container.anchor_right = 1
            image_container.anchor_top = 0
            image_container.anchor_bottom = 1
            text_container.visible = false

        Layout.TOP_HALF:
            image_container.anchor_left = 0
            image_container.anchor_right = 1
            image_container.anchor_top = 0
            image_container.anchor_bottom = 0.5

            text_container.anchor_left = 0
            text_container.anchor_right = 1
            text_container.anchor_top = 0.5 + image_text_gap / size.y
            text_container.anchor_bottom = 1
            text_container.visible = true

        Layout.INLINE_LEFT:
            image_container.anchor_left = 0
            image_container.anchor_right = 0.4
            image_container.anchor_top = 0
            image_container.anchor_bottom = 0.5
            # Configure text wrap in RichTextLabel
```

---

## 4. Effetti Visivi per Illustrazioni VR

### 4.1 Effetto Parallax

Crea profondita' separando l'illustrazione in layer che si muovono a velocita' diverse.

```csharp
// Unity - ParallaxIllustration.cs
public class ParallaxIllustration : MonoBehaviour
{
    [System.Serializable]
    public class ParallaxLayer
    {
        public SpriteRenderer sprite;
        [Range(0f, 1f)] public float depth;  // 0 = vicino, 1 = lontano
    }

    [SerializeField] private ParallaxLayer[] layers;
    [SerializeField] private float maxOffset = 0.05f;  // 5cm massimo
    [SerializeField] private Transform headTracker;

    private Vector3 _initialHeadPosition;

    void Start()
    {
        _initialHeadPosition = headTracker.position;
    }

    void Update()
    {
        Vector3 headDelta = headTracker.position - _initialHeadPosition;

        foreach (var layer in layers)
        {
            float parallaxFactor = 1f - layer.depth;
            Vector3 offset = new Vector3(
                headDelta.x * parallaxFactor * maxOffset,
                headDelta.y * parallaxFactor * maxOffset,
                0
            );
            layer.sprite.transform.localPosition = offset;
        }
    }
}
```

```gdscript
# parallax_illustration.gd - Godot
extends Node3D

class ParallaxLayer:
    var sprite: Sprite3D
    var depth: float  # 0-1

@export var layers: Array[ParallaxLayer] = []
@export var max_offset: float = 0.05
@export var head_tracker: XRCamera3D

var _initial_head_position: Vector3

func _ready():
    _initial_head_position = head_tracker.global_position

func _process(_delta):
    var head_delta = head_tracker.global_position - _initial_head_position

    for layer in layers:
        var parallax_factor = 1.0 - layer.depth
        var offset = Vector3(
            head_delta.x * parallax_factor * max_offset,
            head_delta.y * parallax_factor * max_offset,
            0
        )
        layer.sprite.position = offset
```

### 4.2 Effetto Zoom Interattivo

Permette all'utente di ingrandire l'illustrazione per vedere i dettagli.

```csharp
// Unity - ZoomableIllustration.cs
public class ZoomableIllustration : MonoBehaviour
{
    [SerializeField] private Transform illustrationQuad;
    [SerializeField] private float minZoom = 1f;
    [SerializeField] private float maxZoom = 3f;
    [SerializeField] private float zoomSpeed = 2f;
    [SerializeField] private float panSpeed = 0.5f;

    private float _currentZoom = 1f;
    private Vector2 _panOffset = Vector2.zero;
    private bool _isZoomed = false;

    // Chiamato da input VR (pinch gesture o controller)
    public void OnZoomGesture(float delta)
    {
        _currentZoom = Mathf.Clamp(_currentZoom + delta * zoomSpeed * Time.deltaTime, minZoom, maxZoom);
        _isZoomed = _currentZoom > 1.1f;
        UpdateTransform();
    }

    public void OnPanGesture(Vector2 delta)
    {
        if (!_isZoomed) return;

        float maxPan = (_currentZoom - 1f) * 0.5f;  // Limita pan in base allo zoom
        _panOffset.x = Mathf.Clamp(_panOffset.x + delta.x * panSpeed, -maxPan, maxPan);
        _panOffset.y = Mathf.Clamp(_panOffset.y + delta.y * panSpeed, -maxPan, maxPan);
        UpdateTransform();
    }

    public void ResetZoom()
    {
        _currentZoom = 1f;
        _panOffset = Vector2.zero;
        _isZoomed = false;
        UpdateTransform();
    }

    private void UpdateTransform()
    {
        illustrationQuad.localScale = Vector3.one * _currentZoom;
        illustrationQuad.localPosition = new Vector3(_panOffset.x, _panOffset.y, 0);
    }
}
```

### 4.3 Effetto Glow (Luminescenza)

Aggiunge un alone luminoso attorno a elementi importanti dell'illustrazione.

```csharp
// Unity - Shader per glow su elementi illustrazione
// IllustrationGlow.shader

Shader "Onde/IllustrationGlow"
{
    Properties
    {
        _MainTex ("Illustration", 2D) = "white" {}
        _GlowColor ("Glow Color", Color) = (1, 0.9, 0.7, 1)
        _GlowIntensity ("Glow Intensity", Range(0, 2)) = 0.5
        _GlowSize ("Glow Size", Range(0, 0.1)) = 0.02
    }

    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" }
        Blend SrcAlpha OneMinusSrcAlpha

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            sampler2D _MainTex;
            float4 _GlowColor;
            float _GlowIntensity;
            float _GlowSize;

            struct v2f
            {
                float4 pos : SV_POSITION;
                float2 uv : TEXCOORD0;
            };

            v2f vert(appdata_base v)
            {
                v2f o;
                o.pos = UnityObjectToClipPos(v.vertex);
                o.uv = v.texcoord;
                return o;
            }

            float4 frag(v2f i) : SV_Target
            {
                float4 color = tex2D(_MainTex, i.uv);

                // Sample surrounding pixels for glow
                float glow = 0;
                for (int x = -2; x <= 2; x++)
                {
                    for (int y = -2; y <= 2; y++)
                    {
                        float2 offset = float2(x, y) * _GlowSize;
                        glow += tex2D(_MainTex, i.uv + offset).a;
                    }
                }
                glow /= 25.0;

                // Add glow to edges
                float4 glowColor = _GlowColor * glow * _GlowIntensity * (1 - color.a);
                return color + glowColor;
            }
            ENDCG
        }
    }
}
```

```gdscript
# glow_illustration.gd - Godot (usa shader personalizzato)
extends Sprite3D

@export var glow_color: Color = Color(1.0, 0.9, 0.7, 1.0)
@export var glow_intensity: float = 0.5
@export var glow_enabled: bool = false

var _shader_material: ShaderMaterial

func _ready():
    _shader_material = material_override as ShaderMaterial
    update_glow()

func set_glow(enabled: bool, intensity: float = 0.5):
    glow_enabled = enabled
    glow_intensity = intensity
    update_glow()

func update_glow():
    if _shader_material:
        _shader_material.set_shader_parameter("glow_color", glow_color)
        _shader_material.set_shader_parameter("glow_intensity", glow_intensity if glow_enabled else 0.0)
```

### 4.4 Animazione Sottile (Ken Burns Effect)

Movimento lento e continuo che da' vita alle illustrazioni statiche.

```csharp
// Unity - KenBurnsEffect.cs
public class KenBurnsEffect : MonoBehaviour
{
    [SerializeField] private RectTransform imageRect;
    [SerializeField] private float duration = 10f;
    [SerializeField] private float zoomAmount = 0.1f;  // 10% zoom
    [SerializeField] private Vector2 panDirection = new Vector2(0.05f, 0.02f);

    private float _timer = 0f;
    private Vector2 _startAnchor;
    private Vector2 _startScale;

    void Start()
    {
        _startAnchor = imageRect.anchoredPosition;
        _startScale = imageRect.localScale;
    }

    void Update()
    {
        _timer += Time.deltaTime;
        float t = (_timer % duration) / duration;  // Loop 0-1

        // Ease in-out
        float eased = t < 0.5f
            ? 2f * t * t
            : 1f - Mathf.Pow(-2f * t + 2f, 2f) / 2f;

        // Apply zoom
        float scale = 1f + zoomAmount * eased;
        imageRect.localScale = _startScale * scale;

        // Apply pan
        imageRect.anchoredPosition = _startAnchor + panDirection * eased * 100f;
    }
}
```

---

## 5. Ottimizzazione Performance VR

### Regole d'Oro

1. **Texture Atlas**: Raggruppa illustrazioni piccole in atlas per ridurre draw calls
2. **Mipmap**: Sempre abilitati per texture che variano in distanza
3. **Compressione**: Usa ASTC (Quest) o BC7 (PCVR) per texture
4. **LOD**: Carica versioni a bassa risoluzione per pagine lontane
5. **Streaming**: Carica illustrazioni on-demand, non tutte insieme

### Memory Budget per Libro VR

```
Target: 512MB massimo per libro attivo

- Copertina (2400x3200, compressed): ~5MB
- Illustrazione full-page x10: ~30MB
- Illustrazioni piccole x20: ~10MB
- Testo/Font: ~5MB
- Overhead sistema: ~50MB

Totale tipico: ~100MB per libro standard
```

### Script di Ottimizzazione Automatica

```csharp
// Unity - TextureOptimizer.cs (Editor script)
#if UNITY_EDITOR
using UnityEditor;

public class TextureOptimizer : AssetPostprocessor
{
    void OnPreprocessTexture()
    {
        TextureImporter importer = (TextureImporter)assetImporter;

        // Solo per cartella illustrazioni
        if (assetPath.Contains("Illustrations"))
        {
            importer.textureType = TextureImporterType.Sprite;
            importer.mipmapEnabled = true;
            importer.streamingMipmaps = true;
            importer.filterMode = FilterMode.Trilinear;
            importer.anisoLevel = 4;

            // Compressione platform-specific
            var questSettings = importer.GetPlatformTextureSettings("Android");
            questSettings.overridden = true;
            questSettings.format = TextureImporterFormat.ASTC_6x6;
            questSettings.maxTextureSize = 2048;
            importer.SetPlatformTextureSettings(questSettings);

            var pcSettings = importer.GetPlatformTextureSettings("Standalone");
            pcSettings.overridden = true;
            pcSettings.format = TextureImporterFormat.BC7;
            pcSettings.maxTextureSize = 4096;
            importer.SetPlatformTextureSettings(pcSettings);
        }
    }
}
#endif
```

---

## 6. Checklist Pre-Pubblicazione Illustrazioni

Prima di includere un'illustrazione in un libro VR:

- [ ] **Risoluzione**: Almeno 1600x2000px per full-page
- [ ] **Formato**: JPG 85%+ o PNG (se trasparenza necessaria)
- [ ] **Dimensione file**: Max 2MB per illustrazione
- [ ] **Aspect ratio**: Compatibile con layout pagina (circa 3:4)
- [ ] **Colori**: sRGB color space
- [ ] **Compressione**: Testata su device VR reale
- [ ] **Performance**: Nessun frame drop durante page turn
- [ ] **Posizionamento**: Testato con testo di lunghezza variabile
- [ ] **Effetti**: Parallax/zoom/glow testati e non invasivi

---

## 7. Risorse e Riferimenti

### Tool per Preparazione Immagini

- **ImageMagick**: Batch resize e conversione
- **TinyPNG/TinyJPG**: Compressione senza perdita visibile
- **Photopea**: Editor online gratuito

### Comandi ImageMagick Utili

```bash
# Resize a 2400px di larghezza mantenendo aspect ratio
magick input.png -resize 2400x output.jpg

# Conversione batch PNG->JPG qualita' 90%
magick mogrify -format jpg -quality 90 *.png

# Crea thumbnail 512x512
magick input.jpg -resize 512x512^ -gravity center -extent 512x512 thumb.jpg
```

---

*Documento generato per Onde Books VR - Task vr-003*
*Ultimo aggiornamento: 9 Gennaio 2026*
