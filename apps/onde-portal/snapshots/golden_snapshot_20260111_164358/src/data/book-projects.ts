// Progetti libri in lavorazione per Image Factory
// Tecnica: caricare immagine reference su Grok, poi usare "stesso personaggio, ma [scena]"

export interface Chapter {
  num: number
  title: string
  scene: string
}

export interface BookProject {
  id: string
  title: string
  referenceImage: string // Path all'immagine di riferimento del personaggio
  status: 'in-progress' | 'images-done' | 'published'
  chapters: Chapter[]
}

export const bookProjects: BookProject[] = [
  {
    id: 'il-respiro-magico',
    title: 'Il Respiro Magico',
    referenceImage: '/books/respiro/reference.jpg',
    status: 'in-progress',
    chapters: [
      { num: 1, title: 'Il Primo Respiro', scene: 'bambino seduto a gambe incrociate nel prato fiorito, occhi chiusi, espressione serena' },
      { num: 2, title: 'Il Respiro del Vento', scene: 'bambino in piedi con braccia aperte, vento nei capelli, foglie che volano intorno' },
      { num: 3, title: 'Il Respiro del Mare', scene: 'bambino sulla spiaggia al tramonto, guarda le onde, piedi nella sabbia' },
      { num: 4, title: 'Il Respiro della Montagna', scene: 'bambino seduto su una roccia in montagna, alba dorata sullo sfondo' },
      { num: 5, title: 'Il Respiro del Cuore', scene: 'bambino con mano sul cuore, luce calda che emana dal petto, sorriso dolce' },
    ]
  },
  {
    id: 'la-luce-dentro',
    title: 'La Luce Dentro',
    referenceImage: '/books/luce/reference.jpg',
    status: 'in-progress',
    chapters: [
      { num: 1, title: 'Il Buio', scene: 'bambina in camera buia, un po impaurita, solo una piccola luce dalla finestra' },
      { num: 2, title: 'La Scintilla', scene: 'bambina scopre una piccola luce dorata nel suo cuore, stupore sul viso' },
      { num: 3, title: 'La Luce Cresce', scene: 'bambina circondata da luce dorata calda, braccia aperte, felice' },
      { num: 4, title: 'Illuminare gli Altri', scene: 'bambina tiene la mano di un altro bambino triste, la luce si espande a entrambi' },
      { num: 5, title: 'Il Sole Interiore', scene: 'bambina raggiante, luce dorata come sole dal cuore, altri bambini intorno attratti dalla luce' },
    ]
  },
  {
    id: 'il-piccolo-inventore',
    title: 'Il Piccolo Inventore',
    referenceImage: '/books/inventore/reference.jpg',
    status: 'in-progress',
    chapters: [
      { num: 1, title: 'La Prima Idea', scene: 'bambino nel garage/laboratorio, circondato da attrezzi, lampadina accesa sopra la testa' },
      { num: 2, title: 'Il Fallimento', scene: 'bambino deluso guarda una macchina rotta, pezzi sparsi sul tavolo' },
      { num: 3, title: 'Non Arrendersi', scene: 'bambino determinato riprova, maniche arrotolate, concentrato' },
      { num: 4, title: 'Funziona!', scene: 'bambino esulta, la sua invenzione funziona, luce e movimento dalla macchina' },
      { num: 5, title: 'Condividere', scene: 'bambino mostra la sua invenzione ad altri bambini stupiti, orgoglio sul viso' },
    ]
  },
  {
    id: 'aiko-3-casa-intelligente',
    title: 'AIKO 3: La Casa Intelligente',
    referenceImage: '/books/aiko/reference-sofia.jpg',
    status: 'in-progress',
    chapters: [
      { num: 1, title: 'Benvenuti a Casa AIKO', scene: 'Sofia e AIKO entrano in una casa moderna con luci smart, termostato digitale visibile' },
      { num: 2, title: 'Le Luci che Pensano', scene: 'Sofia parla alle luci, AIKO spiega con diagramma come funzionano i sensori' },
      { num: 3, title: 'Il Termostato Intelligente', scene: 'AIKO mostra a Sofia come il termostato impara le preferenze della famiglia' },
      { num: 4, title: 'La Sicurezza Smart', scene: 'Sofia e AIKO guardano telecamere e sensori, serratura smart sulla porta' },
      { num: 5, title: 'Tutto Connesso', scene: 'Sofia controlla la casa dal tablet, AIKO orgoglioso, famiglia felice in casa smart' },
    ]
  },
]

// Template base per generare prompt
export const PROMPT_TEMPLATE = `stesso personaggio dell'immagine allegata, ma [SCENE],
European watercolor style, Beatrix Potter, warm golden light,
NOT Pixar NOT 3D, natural skin tone, NO rosy cheeks, 4k`

// Funzione helper per generare il prompt completo
export function generatePrompt(scene: string): string {
  return PROMPT_TEMPLATE.replace('[SCENE]', scene)
}
