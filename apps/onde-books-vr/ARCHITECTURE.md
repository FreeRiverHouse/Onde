# Onde Books VR - Architettura Lettore ePub

## Panoramica

Questo documento descrive l'architettura per il caricamento e rendering dinamico di file ePub in ambiente VR, con supporto per Unity e Godot.

---

## 1. Struttura File ePub

Un file ePub e' essenzialmente un archivio ZIP contenente:

```
book.epub/
├── mimetype                    # "application/epub+zip"
├── META-INF/
│   └── container.xml           # Punta al file OPF
├── OEBPS/
│   ├── content.opf             # Manifest e spine (ordine capitoli)
│   ├── toc.ncx                 # Table of Contents (ePub 2)
│   ├── nav.xhtml               # Navigation Document (ePub 3)
│   ├── chapter1.xhtml          # Contenuto capitoli
│   ├── chapter2.xhtml
│   ├── styles/
│   │   └── style.css
│   └── images/
│       └── cover.jpg
```

---

## 2. Pipeline di Caricamento

### 2.1 Flusso Generale

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  File Pick  │────▶│  Unzip      │────▶│  Parse OPF  │────▶│  Build TOC  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                    │
                                                                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  VR Render  │◀────│  Paginate   │◀────│  Parse HTML │◀────│  Load Chapter│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### 2.2 Componenti Principali

| Componente | Responsabilita' |
|------------|-----------------|
| EpubLoader | Caricamento e estrazione ZIP |
| EpubParser | Parsing container.xml, OPF, NCX |
| ChapterReader | Parsing XHTML dei capitoli |
| Paginator | Divisione testo in pagine VR |
| VRRenderer | Rendering 3D del testo |

---

## 3. Parser ePub in C# (Unity)

### 3.1 Struttura Classi

```csharp
// EpubBook.cs - Modello dati principale
public class EpubBook
{
    public string Title { get; set; }
    public string Author { get; set; }
    public byte[] CoverImage { get; set; }
    public List<EpubChapter> Chapters { get; set; }
    public Dictionary<string, byte[]> Resources { get; set; }
}

public class EpubChapter
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string HtmlContent { get; set; }
    public string PlainText { get; set; }
    public int Order { get; set; }
}
```

### 3.2 EpubLoader Implementation

```csharp
using System.IO.Compression;
using System.Xml.Linq;

public class EpubLoader
{
    public async Task<EpubBook> LoadAsync(string filePath)
    {
        var book = new EpubBook();

        using (var archive = ZipFile.OpenRead(filePath))
        {
            // 1. Trova il root file da container.xml
            var containerXml = await ReadEntryAsync(archive, "META-INF/container.xml");
            var rootFilePath = ParseContainerXml(containerXml);

            // 2. Parse OPF per metadata e manifest
            var opfContent = await ReadEntryAsync(archive, rootFilePath);
            var opfData = ParseOpf(opfContent);

            book.Title = opfData.Title;
            book.Author = opfData.Author;

            // 3. Carica capitoli nell'ordine dello spine
            foreach (var spineItem in opfData.Spine)
            {
                var chapterHtml = await ReadEntryAsync(archive, spineItem.Href);
                book.Chapters.Add(new EpubChapter
                {
                    Id = spineItem.Id,
                    HtmlContent = chapterHtml,
                    PlainText = StripHtml(chapterHtml),
                    Order = spineItem.Order
                });
            }

            // 4. Carica cover image
            if (opfData.CoverImagePath != null)
            {
                book.CoverImage = await ReadBinaryEntryAsync(archive, opfData.CoverImagePath);
            }
        }

        return book;
    }

    private string ParseContainerXml(string xml)
    {
        var doc = XDocument.Parse(xml);
        var ns = XNamespace.Get("urn:oasis:names:tc:opendocument:xmlns:container");
        return doc.Descendants(ns + "rootfile")
                  .First()
                  .Attribute("full-path")?.Value;
    }

    private string StripHtml(string html)
    {
        // Rimuovi tags HTML mantenendo il testo
        return Regex.Replace(html, "<[^>]+>", " ")
                    .Replace("&nbsp;", " ")
                    .Trim();
    }
}
```

### 3.3 Parsing OPF (Open Packaging Format)

```csharp
public class OpfParser
{
    private static readonly XNamespace OPF = "http://www.idpf.org/2007/opf";
    private static readonly XNamespace DC = "http://purl.org/dc/elements/1.1/";

    public OpfData Parse(string opfContent, string basePath)
    {
        var doc = XDocument.Parse(opfContent);
        var data = new OpfData();

        // Metadata
        var metadata = doc.Descendants(OPF + "metadata").First();
        data.Title = metadata.Element(DC + "title")?.Value ?? "Untitled";
        data.Author = metadata.Element(DC + "creator")?.Value ?? "Unknown";

        // Manifest - mappa id -> href
        var manifest = new Dictionary<string, ManifestItem>();
        foreach (var item in doc.Descendants(OPF + "item"))
        {
            manifest[item.Attribute("id").Value] = new ManifestItem
            {
                Id = item.Attribute("id").Value,
                Href = Path.Combine(basePath, item.Attribute("href").Value),
                MediaType = item.Attribute("media-type").Value
            };
        }

        // Spine - ordine di lettura
        int order = 0;
        foreach (var itemref in doc.Descendants(OPF + "itemref"))
        {
            var idref = itemref.Attribute("idref").Value;
            if (manifest.TryGetValue(idref, out var item))
            {
                data.Spine.Add(new SpineItem
                {
                    Id = idref,
                    Href = item.Href,
                    Order = order++
                });
            }
        }

        // Cover image
        var coverMeta = metadata.Elements(OPF + "meta")
            .FirstOrDefault(m => m.Attribute("name")?.Value == "cover");
        if (coverMeta != null)
        {
            var coverId = coverMeta.Attribute("content")?.Value;
            if (manifest.TryGetValue(coverId, out var coverItem))
            {
                data.CoverImagePath = coverItem.Href;
            }
        }

        return data;
    }
}
```

---

## 4. Parser ePub in GDScript (Godot)

### 4.1 Struttura del Parser

```gdscript
# epub_loader.gd
extends RefCounted
class_name EpubLoader

var _zip_reader: ZIPReader
var _base_path: String

signal loading_progress(percent: float, status: String)
signal loading_complete(book: EpubBook)
signal loading_error(message: String)


func load_epub(file_path: String) -> EpubBook:
	_zip_reader = ZIPReader.new()
	var err = _zip_reader.open(file_path)

	if err != OK:
		loading_error.emit("Impossibile aprire il file ePub")
		return null

	emit_signal("loading_progress", 0.1, "Lettura container...")

	# 1. Parse container.xml
	var container_xml = _read_file("META-INF/container.xml")
	var root_file_path = _parse_container(container_xml)
	_base_path = root_file_path.get_base_dir()

	emit_signal("loading_progress", 0.2, "Parsing metadati...")

	# 2. Parse OPF
	var opf_content = _read_file(root_file_path)
	var book_data = _parse_opf(opf_content)

	emit_signal("loading_progress", 0.4, "Caricamento capitoli...")

	# 3. Load chapters
	var chapters: Array[EpubChapter] = []
	var total_chapters = book_data.spine.size()

	for i in range(total_chapters):
		var spine_item = book_data.spine[i]
		var chapter_html = _read_file(spine_item.href)

		var chapter = EpubChapter.new()
		chapter.id = spine_item.id
		chapter.html_content = chapter_html
		chapter.plain_text = _strip_html(chapter_html)
		chapter.order = i
		chapters.append(chapter)

		var progress = 0.4 + (0.5 * (i + 1) / total_chapters)
		emit_signal("loading_progress", progress, "Capitolo %d/%d" % [i+1, total_chapters])

	# 4. Build book object
	var book = EpubBook.new()
	book.title = book_data.title
	book.author = book_data.author
	book.chapters = chapters

	# 5. Load cover
	if book_data.cover_path:
		book.cover_image = _read_binary(book_data.cover_path)

	_zip_reader.close()

	emit_signal("loading_progress", 1.0, "Completato")
	emit_signal("loading_complete", book)

	return book


func _read_file(path: String) -> String:
	var content = _zip_reader.read_file(path)
	if content:
		return content.get_string_from_utf8()
	return ""


func _read_binary(path: String) -> PackedByteArray:
	return _zip_reader.read_file(path)


func _parse_container(xml: String) -> String:
	var parser = XMLParser.new()
	parser.open_buffer(xml.to_utf8_buffer())

	while parser.read() == OK:
		if parser.get_node_type() == XMLParser.NODE_ELEMENT:
			if parser.get_node_name() == "rootfile":
				return parser.get_named_attribute_value_safe("full-path")

	return ""


func _parse_opf(xml: String) -> Dictionary:
	var result = {
		"title": "Untitled",
		"author": "Unknown",
		"spine": [],
		"manifest": {},
		"cover_path": null
	}

	var parser = XMLParser.new()
	parser.open_buffer(xml.to_utf8_buffer())

	var in_metadata = false
	var in_manifest = false
	var in_spine = false
	var current_element = ""

	while parser.read() == OK:
		match parser.get_node_type():
			XMLParser.NODE_ELEMENT:
				var node_name = parser.get_node_name()

				if node_name == "metadata":
					in_metadata = true
				elif node_name == "manifest":
					in_manifest = true
				elif node_name == "spine":
					in_spine = true
				elif in_metadata:
					if node_name == "dc:title":
						current_element = "title"
					elif node_name == "dc:creator":
						current_element = "author"
				elif in_manifest and node_name == "item":
					var id = parser.get_named_attribute_value_safe("id")
					var href = _base_path.path_join(parser.get_named_attribute_value_safe("href"))
					result.manifest[id] = {"id": id, "href": href}
				elif in_spine and node_name == "itemref":
					var idref = parser.get_named_attribute_value_safe("idref")
					if result.manifest.has(idref):
						result.spine.append(result.manifest[idref])

			XMLParser.NODE_TEXT:
				var text = parser.get_node_data().strip_edges()
				if text and current_element:
					result[current_element] = text
					current_element = ""

			XMLParser.NODE_ELEMENT_END:
				var node_name = parser.get_node_name()
				if node_name in ["metadata", "manifest", "spine"]:
					in_metadata = false
					in_manifest = false
					in_spine = false

	return result


func _strip_html(html: String) -> String:
	var regex = RegEx.new()
	regex.compile("<[^>]+>")
	var text = regex.sub(html, " ", true)
	text = text.replace("&nbsp;", " ")
	text = text.replace("&amp;", "&")
	text = text.replace("&lt;", "<")
	text = text.replace("&gt;", ">")
	return text.strip_edges()
```

### 4.2 Modelli Dati GDScript

```gdscript
# epub_book.gd
extends Resource
class_name EpubBook

@export var title: String
@export var author: String
@export var cover_image: PackedByteArray
@export var chapters: Array[EpubChapter]

func get_chapter(index: int) -> EpubChapter:
	if index >= 0 and index < chapters.size():
		return chapters[index]
	return null

func get_total_chapters() -> int:
	return chapters.size()


# epub_chapter.gd
extends Resource
class_name EpubChapter

@export var id: String
@export var title: String
@export var html_content: String
@export var plain_text: String
@export var order: int
```

---

## 5. Rendering Testo in VR

### 5.1 SDF (Signed Distance Field) Fonts

I font SDF sono essenziali per il testo VR perche':
- Scalano senza perdita di qualita' a qualsiasi distanza
- Supportano effetti (outline, glow, shadow) senza texture aggiuntive
- Performance ottimali anche con molto testo

### 5.2 Unity - TextMeshPro Configuration

```csharp
using TMPro;
using UnityEngine;

public class VRTextRenderer : MonoBehaviour
{
    [Header("Text Settings")]
    [SerializeField] private TMP_FontAsset sdfFont;
    [SerializeField] private float fontSize = 0.05f; // Metri in VR
    [SerializeField] private float lineSpacing = 1.2f;
    [SerializeField] private float characterSpacing = 0f;

    [Header("Page Settings")]
    [SerializeField] private Vector2 pageSize = new Vector2(0.4f, 0.6f); // 40x60 cm
    [SerializeField] private float marginHorizontal = 0.03f;
    [SerializeField] private float marginVertical = 0.04f;

    [Header("VR Optimization")]
    [SerializeField] private float readingDistance = 0.8f; // 80 cm dall'utente
    [SerializeField] private float curveRadius = 2f; // Curvatura pagina

    private TextMeshPro _textMesh;
    private MeshRenderer _pageRenderer;

    void Awake()
    {
        SetupTextMesh();
        SetupPageGeometry();
    }

    private void SetupTextMesh()
    {
        _textMesh = gameObject.AddComponent<TextMeshPro>();
        _textMesh.font = sdfFont;
        _textMesh.fontSize = fontSize * 100; // TMP usa unita' diverse
        _textMesh.lineSpacing = lineSpacing;
        _textMesh.characterSpacing = characterSpacing;
        _textMesh.alignment = TextAlignmentOptions.TopLeft;
        _textMesh.enableWordWrapping = true;

        // Ottimizzazioni VR
        _textMesh.overflowMode = TextOverflowModes.Page;
        _textMesh.renderMode = TextRenderFlags.Render; // No extra raycast geometry

        // Area di rendering
        var rectTransform = GetComponent<RectTransform>();
        rectTransform.sizeDelta = new Vector2(
            (pageSize.x - marginHorizontal * 2) * 100,
            (pageSize.y - marginVertical * 2) * 100
        );
    }

    private void SetupPageGeometry()
    {
        // Crea mesh curva per comfort visivo
        var filter = gameObject.AddComponent<MeshFilter>();
        filter.mesh = CreateCurvedPageMesh();

        _pageRenderer = gameObject.AddComponent<MeshRenderer>();
        _pageRenderer.material = new Material(Shader.Find("Unlit/Color"));
        _pageRenderer.material.color = new Color(0.98f, 0.96f, 0.92f); // Paper color
    }

    private Mesh CreateCurvedPageMesh()
    {
        // Genera mesh con leggera curvatura per ridurre affaticamento
        var mesh = new Mesh();
        int segments = 10;

        var vertices = new Vector3[(segments + 1) * 2];
        var uvs = new Vector2[(segments + 1) * 2];

        for (int i = 0; i <= segments; i++)
        {
            float t = (float)i / segments;
            float x = Mathf.Lerp(-pageSize.x / 2, pageSize.x / 2, t);
            float z = -Mathf.Cos(t * Mathf.PI) * 0.02f; // Leggera curva

            vertices[i * 2] = new Vector3(x, pageSize.y / 2, z);
            vertices[i * 2 + 1] = new Vector3(x, -pageSize.y / 2, z);
            uvs[i * 2] = new Vector2(t, 1);
            uvs[i * 2 + 1] = new Vector2(t, 0);
        }

        // Triangoli
        var triangles = new int[segments * 6];
        for (int i = 0; i < segments; i++)
        {
            int start = i * 6;
            int v = i * 2;
            triangles[start] = v;
            triangles[start + 1] = v + 2;
            triangles[start + 2] = v + 1;
            triangles[start + 3] = v + 1;
            triangles[start + 4] = v + 2;
            triangles[start + 5] = v + 3;
        }

        mesh.vertices = vertices;
        mesh.uv = uvs;
        mesh.triangles = triangles;
        mesh.RecalculateNormals();

        return mesh;
    }

    public void SetText(string content)
    {
        _textMesh.text = content;
    }

    public int GetTotalPages()
    {
        return _textMesh.textInfo.pageCount;
    }

    public void ShowPage(int pageIndex)
    {
        _textMesh.pageToDisplay = pageIndex + 1; // TMP usa indici 1-based
    }
}
```

### 5.3 Godot - Label3D con SDF

```gdscript
# vr_text_renderer.gd
extends Node3D
class_name VRTextRenderer

@export_group("Text Settings")
@export var font: Font
@export var font_size: int = 48
@export var line_spacing: float = 1.2
@export var outline_size: int = 2

@export_group("Page Settings")
@export var page_width: float = 0.4  # metri
@export var page_height: float = 0.6  # metri
@export var margin: float = 0.03
@export var chars_per_line: int = 60

@export_group("VR Settings")
@export var reading_distance: float = 0.8
@export var background_color: Color = Color(0.98, 0.96, 0.92)

var _label: Label3D
var _background: MeshInstance3D
var _pages: PackedStringArray
var _current_page: int = 0


func _ready():
	_setup_background()
	_setup_label()

	# Posiziona a distanza di lettura
	position.z = -reading_distance


func _setup_background():
	_background = MeshInstance3D.new()
	var quad = QuadMesh.new()
	quad.size = Vector2(page_width, page_height)
	_background.mesh = quad

	var material = StandardMaterial3D.new()
	material.albedo_color = background_color
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_background.material_override = material

	add_child(_background)


func _setup_label():
	_label = Label3D.new()
	_label.font = font
	_label.font_size = font_size
	_label.outline_size = outline_size
	_label.modulate = Color.BLACK
	_label.outline_modulate = Color(0.2, 0.2, 0.2, 0.5)

	# Dimensioni area testo
	_label.width = (page_width - margin * 2) * 1000  # Godot usa unita' diverse
	_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	_label.vertical_alignment = VERTICAL_ALIGNMENT_TOP

	# Offset per centrare sulla pagina
	_label.position.z = 0.001  # Leggermente davanti al background

	add_child(_label)


func set_text(content: String) -> void:
	_pages = _paginate_text(content)
	_current_page = 0
	_show_current_page()


func _paginate_text(text: String) -> PackedStringArray:
	var pages: PackedStringArray = []
	var lines = text.split("\n")

	# Calcola linee per pagina basandosi su font size e altezza pagina
	var line_height = font_size * line_spacing / 1000.0  # Converti in metri
	var usable_height = page_height - margin * 2
	var lines_per_page = int(usable_height / line_height)

	var current_page_lines: PackedStringArray = []

	for line in lines:
		# Word wrap manuale per linee lunghe
		var wrapped = _wrap_line(line, chars_per_line)

		for wrapped_line in wrapped:
			if current_page_lines.size() >= lines_per_page:
				pages.append("\n".join(current_page_lines))
				current_page_lines.clear()
			current_page_lines.append(wrapped_line)

	# Aggiungi ultima pagina
	if current_page_lines.size() > 0:
		pages.append("\n".join(current_page_lines))

	return pages


func _wrap_line(line: String, max_chars: int) -> PackedStringArray:
	if line.length() <= max_chars:
		return [line]

	var result: PackedStringArray = []
	var words = line.split(" ")
	var current_line = ""

	for word in words:
		if current_line.length() + word.length() + 1 <= max_chars:
			if current_line.length() > 0:
				current_line += " "
			current_line += word
		else:
			if current_line.length() > 0:
				result.append(current_line)
			current_line = word

	if current_line.length() > 0:
		result.append(current_line)

	return result


func _show_current_page() -> void:
	if _current_page >= 0 and _current_page < _pages.size():
		_label.text = _pages[_current_page]


func next_page() -> bool:
	if _current_page < _pages.size() - 1:
		_current_page += 1
		_show_current_page()
		return true
	return false


func previous_page() -> bool:
	if _current_page > 0:
		_current_page -= 1
		_show_current_page()
		return true
	return false


func go_to_page(index: int) -> bool:
	if index >= 0 and index < _pages.size():
		_current_page = index
		_show_current_page()
		return true
	return false


func get_current_page() -> int:
	return _current_page


func get_total_pages() -> int:
	return _pages.size()
```

---

## 6. Gestione Pagine e Capitoli

### 6.1 Book Controller (Unity)

```csharp
public class VRBookController : MonoBehaviour
{
    [SerializeField] private VRTextRenderer leftPage;
    [SerializeField] private VRTextRenderer rightPage;
    [SerializeField] private Transform bookTransform;

    private EpubBook _currentBook;
    private int _currentChapterIndex = 0;
    private int _currentPageIndex = 0;

    public event Action<int, int> OnPageChanged;  // chapter, page
    public event Action<int> OnChapterChanged;

    public async Task LoadBook(string path)
    {
        var loader = new EpubLoader();
        _currentBook = await loader.LoadAsync(path);

        _currentChapterIndex = 0;
        _currentPageIndex = 0;

        LoadCurrentChapter();
    }

    private void LoadCurrentChapter()
    {
        if (_currentBook == null) return;

        var chapter = _currentBook.Chapters[_currentChapterIndex];

        // Setup pagine con contenuto capitolo
        leftPage.SetText(chapter.PlainText);
        rightPage.SetText(chapter.PlainText);

        _currentPageIndex = 0;
        UpdatePageDisplay();

        OnChapterChanged?.Invoke(_currentChapterIndex);
    }

    private void UpdatePageDisplay()
    {
        // Mostra due pagine affiancate (libro aperto)
        leftPage.ShowPage(_currentPageIndex);
        rightPage.ShowPage(_currentPageIndex + 1);

        OnPageChanged?.Invoke(_currentChapterIndex, _currentPageIndex);
    }

    public void NextPage()
    {
        int totalPages = leftPage.GetTotalPages();

        if (_currentPageIndex + 2 < totalPages)
        {
            _currentPageIndex += 2;
            UpdatePageDisplay();
            AnimatePageTurn(1);
        }
        else if (_currentChapterIndex < _currentBook.Chapters.Count - 1)
        {
            _currentChapterIndex++;
            LoadCurrentChapter();
        }
    }

    public void PreviousPage()
    {
        if (_currentPageIndex >= 2)
        {
            _currentPageIndex -= 2;
            UpdatePageDisplay();
            AnimatePageTurn(-1);
        }
        else if (_currentChapterIndex > 0)
        {
            _currentChapterIndex--;
            LoadCurrentChapter();
            // Vai all'ultima pagina del capitolo precedente
            _currentPageIndex = (leftPage.GetTotalPages() / 2) * 2;
            UpdatePageDisplay();
        }
    }

    public void GoToChapter(int chapterIndex)
    {
        if (chapterIndex >= 0 && chapterIndex < _currentBook.Chapters.Count)
        {
            _currentChapterIndex = chapterIndex;
            LoadCurrentChapter();
        }
    }

    private void AnimatePageTurn(int direction)
    {
        // Animazione page turn (DOTween o Animation)
        StartCoroutine(PageTurnAnimation(direction));
    }

    private IEnumerator PageTurnAnimation(int direction)
    {
        float duration = 0.3f;
        float elapsed = 0f;

        while (elapsed < duration)
        {
            elapsed += Time.deltaTime;
            float t = elapsed / duration;

            // Rotazione pagina
            float angle = Mathf.Lerp(0, 180 * direction, t);
            // Apply rotation to page mesh

            yield return null;
        }
    }

    // Input VR
    public void OnSwipeLeft() => NextPage();
    public void OnSwipeRight() => PreviousPage();
    public void OnPointAndClick(Vector3 point)
    {
        // Determina se click su pagina sinistra o destra
        if (point.x < 0)
            PreviousPage();
        else
            NextPage();
    }
}
```

### 6.2 Navigation/TOC UI

```csharp
public class BookNavigationUI : MonoBehaviour
{
    [SerializeField] private VRBookController bookController;
    [SerializeField] private Transform tocContainer;
    [SerializeField] private GameObject chapterButtonPrefab;

    private List<GameObject> _tocButtons = new List<GameObject>();

    public void ShowTableOfContents(EpubBook book)
    {
        ClearTOC();

        for (int i = 0; i < book.Chapters.Count; i++)
        {
            var chapter = book.Chapters[i];
            var button = Instantiate(chapterButtonPrefab, tocContainer);

            var buttonText = button.GetComponentInChildren<TMP_Text>();
            buttonText.text = $"{i + 1}. {chapter.Title}";

            int chapterIndex = i; // Capture per closure
            button.GetComponent<Button>().onClick.AddListener(() =>
            {
                bookController.GoToChapter(chapterIndex);
                HideTableOfContents();
            });

            _tocButtons.Add(button);
        }
    }

    private void ClearTOC()
    {
        foreach (var button in _tocButtons)
        {
            Destroy(button);
        }
        _tocButtons.Clear();
    }

    public void HideTableOfContents()
    {
        gameObject.SetActive(false);
    }
}
```

---

## 7. Librerie Suggerite

### 7.1 Unity

| Libreria | Uso | Link |
|----------|-----|------|
| **VersOne.Epub** | Parser ePub completo per .NET | NuGet: VersOne.Epub |
| **TextMeshPro** | Rendering SDF text (incluso in Unity) | Package Manager |
| **XR Interaction Toolkit** | Input VR (grab, poke, ray) | Package Manager |
| **DOTween** | Animazioni fluide (page turn) | Asset Store |
| **SharpZipLib** | Alternativa per ZIP handling | NuGet |

### 7.2 Godot

| Libreria | Uso | Link |
|----------|-----|------|
| **Godot XR Tools** | Toolkit VR completo | Asset Library |
| **XML Parser** (built-in) | Parsing XML nativo | Core Godot |
| **ZIPReader** (built-in) | Estrazione ZIP nativo | Core Godot |
| **Label3D** (built-in) | Rendering testo 3D SDF | Core Godot |

### 7.3 Cross-Platform Considerations

```
┌─────────────────────────────────────────────────────────────┐
│                    Onde Books VR                            │
├─────────────────────────────────────────────────────────────┤
│  Web Backend (onde-books-vr-web)                           │
│  - Gestione libreria ePub                                   │
│  - API per sync progresso lettura                           │
│  - Conversione ePub -> JSON ottimizzato                     │
├─────────────────────────────────────────────────────────────┤
│                    ↓ REST/WebSocket ↓                       │
├───────────────────────┬─────────────────────────────────────┤
│  Unity VR Client      │  Godot VR Client                    │
│  - Quest, PCVR        │  - Open source alternative          │
│  - TextMeshPro        │  - Label3D + XR Tools               │
│  - VersOne.Epub       │  - Native ZIP/XML                   │
└───────────────────────┴─────────────────────────────────────┘
```

---

## 8. Performance Optimization

### 8.1 Memory Management

```csharp
public class ChapterCache
{
    private readonly int _maxCachedChapters = 3;
    private readonly LinkedList<CachedChapter> _cache = new();
    private readonly Dictionary<int, LinkedListNode<CachedChapter>> _lookup = new();

    public EpubChapter GetChapter(int index, Func<int, EpubChapter> loader)
    {
        if (_lookup.TryGetValue(index, out var node))
        {
            // Move to front (LRU)
            _cache.Remove(node);
            _cache.AddFirst(node);
            return node.Value.Chapter;
        }

        // Load and cache
        var chapter = loader(index);
        var cached = new CachedChapter { Index = index, Chapter = chapter };
        var newNode = _cache.AddFirst(cached);
        _lookup[index] = newNode;

        // Evict oldest if over limit
        while (_cache.Count > _maxCachedChapters)
        {
            var oldest = _cache.Last;
            _lookup.Remove(oldest.Value.Index);
            _cache.RemoveLast();
        }

        return chapter;
    }

    private class CachedChapter
    {
        public int Index;
        public EpubChapter Chapter;
    }
}
```

### 8.2 Async Loading

```csharp
public async Task PreloadAdjacentChapters(int currentIndex)
{
    var tasks = new List<Task>();

    // Preload next chapter
    if (currentIndex + 1 < _book.Chapters.Count)
    {
        tasks.Add(Task.Run(() => _chapterCache.GetChapter(currentIndex + 1, LoadChapter)));
    }

    // Preload previous chapter
    if (currentIndex - 1 >= 0)
    {
        tasks.Add(Task.Run(() => _chapterCache.GetChapter(currentIndex - 1, LoadChapter)));
    }

    await Task.WhenAll(tasks);
}
```

---

## 9. File Structure Raccomandato

```
apps/onde-books-vr/
├── ARCHITECTURE.md              # Questo file
├── Unity/
│   └── OndeBooks/
│       ├── Scripts/
│       │   ├── Epub/
│       │   │   ├── EpubLoader.cs
│       │   │   ├── EpubBook.cs
│       │   │   ├── EpubChapter.cs
│       │   │   └── OpfParser.cs
│       │   ├── Rendering/
│       │   │   ├── VRTextRenderer.cs
│       │   │   └── PageMeshGenerator.cs
│       │   ├── Controllers/
│       │   │   ├── VRBookController.cs
│       │   │   └── BookNavigationUI.cs
│       │   └── Cache/
│       │       └── ChapterCache.cs
│       ├── Prefabs/
│       │   ├── VRBook.prefab
│       │   └── TOCButton.prefab
│       └── Resources/
│           └── Fonts/
│               └── ReadingFont-SDF.asset
└── Godot/
    └── onde_books/
        ├── scripts/
        │   ├── epub/
        │   │   ├── epub_loader.gd
        │   │   ├── epub_book.gd
        │   │   └── epub_chapter.gd
        │   ├── rendering/
        │   │   └── vr_text_renderer.gd
        │   └── controllers/
        │       └── book_controller.gd
        ├── scenes/
        │   ├── vr_book.tscn
        │   └── toc_menu.tscn
        └── resources/
            └── fonts/
```

---

## 10. Prossimi Passi

1. **Implementazione Base**: Iniziare con il parser ePub in C# o GDScript
2. **Rendering Pipeline**: Setup TextMeshPro/Label3D con font SDF
3. **VR Input**: Integrare gesture (swipe, point) per navigazione
4. **UI/UX**: Design TOC, progress bar, bookmark system
5. **Sync**: Collegamento con onde-books-vr-web per sync libreria
6. **Testing**: Test su dispositivi VR reali (Quest, PCVR)

---

*Documento generato per Onde Books VR - Task vr-001*
