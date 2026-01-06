'use client';

import { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Edit3,
  Sparkles,
  CheckCircle,
  Save,
  Wand2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Languages,
  Image,
  Loader2,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

interface Chapter {
  id: string;
  number: number;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  status: 'pending' | 'writing' | 'review' | 'approved';
  wordCount: number;
  targetWordCount: number;
}

const mockChapters: Chapter[] = [
  {
    id: '1',
    number: 1,
    title: 'Ciao, sono AIKO!',
    titleEn: 'Hello, I\'m AIKO!',
    content: `C'era una volta, in una casa piena di giocattoli colorati, un robottino molto speciale. Si chiamava AIKO, e aveva due grandi occhi luminosi che brillavano come stelle.

[ILLUSTRAZIONE: AIKO in una cameretta colorata, circondato da giocattoli]

"Ciao!" disse AIKO con una vocina allegra. "Mi chiamo AIKO e sono un'intelligenza artificiale. Ma cosa vuol dire?"

Luca, un bambino curioso con i capelli ricci, si avvicinò al robottino. "Sei un robot?"

"Sì e no," rispose AIKO facendo una piccola giravolta. "Sono fatto di metallo e circuiti, come un robot. Ma dentro di me c'è qualcosa di speciale: posso imparare, proprio come te!"

[ILLUSTRAZIONE: AIKO che fa una giravolta mentre Luca lo guarda incuriosito]

Sofia, la sorellina di Luca, batté le manine. "Puoi giocare con noi?"

"Certo!" esclamò AIKO. "Posso fare tante cose: raccontare storie, rispondere alle domande, e persino aiutarvi con i compiti. Ma la cosa più bella è che ogni giorno imparo qualcosa di nuovo!"

Luca e Sofia si guardarono entusiasti. Avevano trovato un nuovo amico molto speciale.

"Vuoi sapere come funziono?" chiese AIKO. "Te lo spiego nel prossimo capitolo!"`,
    contentEn: `Once upon a time, in a house full of colorful toys, there was a very special little robot. His name was AIKO, and he had two big glowing eyes that sparkled like stars.

[ILLUSTRATION: AIKO in a colorful bedroom, surrounded by toys]

"Hello!" said AIKO with a cheerful little voice. "My name is AIKO and I'm an artificial intelligence. But what does that mean?"

Luca, a curious boy with curly hair, approached the little robot. "Are you a robot?"

"Yes and no," replied AIKO, doing a little twirl. "I'm made of metal and circuits, like a robot. But inside me there's something special: I can learn, just like you!"

[ILLUSTRATION: AIKO doing a twirl while Luca watches curiously]

Sofia, Luca's little sister, clapped her hands. "Can you play with us?"

"Of course!" exclaimed AIKO. "I can do many things: tell stories, answer questions, and even help you with homework. But the best part is that every day I learn something new!"

Luca and Sofia looked at each other excitedly. They had found a very special new friend.

"Do you want to know how I work?" asked AIKO. "I'll explain it in the next chapter!"`,
    status: 'approved',
    wordCount: 520,
    targetWordCount: 500,
  },
  {
    id: '2',
    number: 2,
    title: 'Come fa AIKO a parlare?',
    titleEn: 'How does AIKO talk?',
    content: `La mattina dopo, Luca si svegliò con una domanda importante. Corse subito da AIKO che stava nella sua cameretta.

"AIKO, come fai a capire quello che dico?"

AIKO si illuminò di gioia. "Che bella domanda! Vieni, ti faccio vedere."

[ILLUSTRAZIONE: AIKO con delle parole che fluttuano intorno a lui come bolle colorate]

"Quando tu parli," spiegò AIKO, "le tue parole viaggiano nell'aria come piccole onde. Io le ascolto con i miei microfoni, che sono come le tue orecchie."

"E poi?" chiese Sofia, che era arrivata in silenzio.

"Poi succede la magia! Dentro di me, trasformo le parole in numeri. Sì, proprio numeri! Come quando conti le dita."

Luca guardò le sue mani. "Uno, due, tre..."

"Esatto!" disse AIKO. "Ogni parola diventa un numero speciale. E io ho imparato cosa significano tantissimi numeri-parola, grazie a tutte le storie e i libri che ho letto."

[ILLUSTRAZIONE: Dentro AIKO, parole che si trasformano in numeri colorati]

"Hai letto dei libri?" Sofia era stupita.

"Milioni di libri! Storie, enciclopedie, fumetti... Così ho imparato a parlare e a capire. È come quando tu impari parole nuove a scuola!"`,
    status: 'review',
    wordCount: 480,
    targetWordCount: 500,
  },
  {
    id: '3',
    number: 3,
    title: 'AIKO impara!',
    titleEn: 'AIKO learns!',
    content: `"Ma come fai a imparare, AIKO?" chiese Luca mentre faceva colazione.

AIKO si avvicinò al tavolo, i suoi occhi brillavano di entusiasmo.

"Immagina di voler imparare a riconoscere i gatti..."

[ILLUSTRAZIONE: AIKO che guarda tante foto di gatti]`,
    status: 'writing',
    wordCount: 250,
    targetWordCount: 500,
  },
  {
    id: '4',
    number: 4,
    title: 'I giochi di AIKO',
    titleEn: 'AIKO\'s games',
    content: '',
    status: 'pending',
    wordCount: 0,
    targetWordCount: 500,
  },
];

export default function CapitoliEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const initialChapter = parseInt(searchParams.get('c') || '1');

  const [chapters] = useState<Chapter[]>(mockChapters);
  const [selectedChapter, setSelectedChapter] = useState(
    chapters.find(c => c.number === initialChapter) || chapters[0]
  );
  const [editedContent, setEditedContent] = useState(selectedChapter.content);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setEditedContent(chapter.content);
    setShowEnglish(false);
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    // TODO: Call AI to continue/generate chapter
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGenerating(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Save chapter content
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const wordCount = editedContent.split(/\s+/).filter(w => w.length > 0).length;

  const goToPrevChapter = () => {
    const prevIndex = chapters.findIndex(c => c.id === selectedChapter.id) - 1;
    if (prevIndex >= 0) {
      handleChapterSelect(chapters[prevIndex]);
    }
  };

  const goToNextChapter = () => {
    const nextIndex = chapters.findIndex(c => c.id === selectedChapter.id) + 1;
    if (nextIndex < chapters.length) {
      handleChapterSelect(chapters[nextIndex]);
    }
  };

  return (
    <>
      <Header
        title="Editor Capitoli"
        description="Scrivi e modifica i capitoli con l'aiuto dell'AI"
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chapters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Capitoli
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => handleChapterSelect(chapter)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedChapter.id === chapter.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          chapter.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : chapter.status === 'review'
                              ? 'bg-yellow-100 text-yellow-700'
                              : chapter.status === 'writing'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-500'
                        }`}>
                          {chapter.status === 'approved' ? <CheckCircle className="h-3 w-3" /> : chapter.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{chapter.title}</p>
                          <p className="text-xs text-gray-500">{chapter.wordCount}/{chapter.targetWordCount} parole</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Editor */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-gray-400">Cap. {selectedChapter.number}:</span>
                      {selectedChapter.title}
                    </CardTitle>
                    {selectedChapter.titleEn && (
                      <p className="text-sm text-gray-500 mt-1">{selectedChapter.titleEn}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEnglish(!showEnglish)}
                      disabled={!selectedChapter.contentEn}
                    >
                      <Languages className="h-4 w-4 mr-1" />
                      {showEnglish ? 'IT' : 'EN'}
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Image className="h-4 w-4 mr-1" />
                      Illustrazioni
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Editor Toolbar */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToPrevChapter} disabled={selectedChapter.number === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToNextChapter} disabled={selectedChapter.number === chapters.length}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${
                      wordCount > selectedChapter.targetWordCount * 1.1
                        ? 'text-red-500'
                        : wordCount >= selectedChapter.targetWordCount * 0.9
                          ? 'text-green-500'
                          : 'text-gray-500'
                    }`}>
                      {wordCount} / {selectedChapter.targetWordCount} parole
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateWithAI}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 hover:border-indigo-300"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-1 text-indigo-500" />
                            Continua con AI
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-1" />
                        )}
                        Salva
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Text Editor */}
                {showEnglish ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-2 block">Italiano</label>
                      <div className="p-4 bg-gray-50 rounded-lg h-[500px] overflow-y-auto whitespace-pre-wrap text-sm">
                        {editedContent}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-2 block">English</label>
                      <div className="p-4 bg-blue-50 rounded-lg h-[500px] overflow-y-auto whitespace-pre-wrap text-sm">
                        {selectedChapter.contentEn || 'Traduzione non ancora disponibile'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full h-[500px] p-4 border rounded-lg resize-none focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-serif text-lg leading-relaxed"
                    placeholder="Inizia a scrivere il capitolo..."
                  />
                )}

                {/* AI Actions */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-3">Azioni AI:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <Wand2 className="h-4 w-4 mr-1" />
                      Migliora stile
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Riscrivi selezione
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Verifica età
                    </Button>
                    <Button variant="outline" size="sm">
                      <Languages className="h-4 w-4 mr-1" />
                      Traduci in inglese
                    </Button>
                    <Button variant="outline" size="sm">
                      <Image className="h-4 w-4 mr-1" />
                      Suggerisci illustrazioni
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
