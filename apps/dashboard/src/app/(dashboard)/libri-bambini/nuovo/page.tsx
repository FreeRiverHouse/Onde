'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Baby,
  BookOpen,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  Palette,
  Languages,
  Target
} from 'lucide-react';
import Link from 'next/link';

type Step = 'info' | 'audience' | 'style' | 'chapters' | 'confirm';

interface BookFormData {
  title: string;
  titleEn: string;
  description: string;
  genre: 'educativo' | 'poesia' | 'spiritualita' | 'avventura' | 'favole';
  ageMin: number;
  ageMax: number;
  language: 'it' | 'en' | 'both';
  illustrationStyle: 'cartoon' | 'watercolor' | 'digital' | 'minimal';
  colorPalette: 'warm' | 'cool' | 'pastel' | 'vibrant';
  chaptersCount: number;
  wordsPerChapter: number;
  aiInstructions: string;
}

const defaultFormData: BookFormData = {
  title: '',
  titleEn: '',
  description: '',
  genre: 'educativo',
  ageMin: 6,
  ageMax: 8,
  language: 'both',
  illustrationStyle: 'cartoon',
  colorPalette: 'warm',
  chaptersCount: 8,
  wordsPerChapter: 500,
  aiInstructions: '',
};

const genres = [
  { value: 'educativo', label: 'Educativo', description: 'Insegna concetti in modo divertente' },
  { value: 'poesia', label: 'Poesia', description: 'Versi e rime per bambini' },
  { value: 'spiritualita', label: 'Spiritualità', description: 'Temi religiosi e valori' },
  { value: 'avventura', label: 'Avventura', description: 'Storie emozionanti' },
  { value: 'favole', label: 'Favole', description: 'Racconti con morale' },
];

const illustrationStyles = [
  { value: 'cartoon', label: 'Cartoon', description: 'Colorato e vivace' },
  { value: 'watercolor', label: 'Acquerello', description: 'Morbido e artistico' },
  { value: 'digital', label: 'Digitale', description: 'Moderno e definito' },
  { value: 'minimal', label: 'Minimal', description: 'Semplice ed elegante' },
];

const colorPalettes = [
  { value: 'warm', label: 'Colori Caldi', colors: ['#FF6B6B', '#FFA07A', '#FFD93D'] },
  { value: 'cool', label: 'Colori Freddi', colors: ['#6BCB77', '#4D96FF', '#9B59B6'] },
  { value: 'pastel', label: 'Pastello', colors: ['#FFB5E8', '#B5DEFF', '#E7FFAC'] },
  { value: 'vibrant', label: 'Vivaci', colors: ['#FF1493', '#00CED1', '#FFD700'] },
];

export default function NuovoLibroPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('info');
  const [formData, setFormData] = useState<BookFormData>(defaultFormData);
  const [isGenerating, setIsGenerating] = useState(false);

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Informazioni', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'audience', label: 'Pubblico', icon: <Target className="h-4 w-4" /> },
    { id: 'style', label: 'Stile', icon: <Palette className="h-4 w-4" /> },
    { id: 'chapters', label: 'Struttura', icon: <Languages className="h-4 w-4" /> },
    { id: 'confirm', label: 'Conferma', icon: <Check className="h-4 w-4" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleCreate = async () => {
    setIsGenerating(true);
    // TODO: Call API to create book and generate outline with AI
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push('/libri-bambini/ai-spiegata-bambini');
  };

  const updateFormData = (updates: Partial<BookFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <>
      <Header
        title="Nuovo Libro per Bambini"
        description="Crea un nuovo e-book con l'aiuto dell'intelligenza artificiale"
      />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  index < currentStepIndex
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : index === currentStepIndex
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                      : 'border-gray-300 text-gray-400'
                }`}>
                  {index < currentStepIndex ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-1 mx-2 rounded ${
                    index < currentStepIndex ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} style={{ width: '60px' }} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <span key={step.id} className="text-xs text-gray-500 w-20 text-center">
                {step.label}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            {currentStep === 'info' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titolo del Libro *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateFormData({ title: e.target.value })}
                    placeholder="Es: AI Spiegata ai Bambini"
                    className="w-full p-3 border rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titolo in Inglese
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => updateFormData({ titleEn: e.target.value })}
                    placeholder="Es: AI Explained to Kids"
                    className="w-full p-3 border rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrizione / Concetto
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="Descrivi brevemente di cosa tratterà il libro..."
                    className="w-full h-32 p-3 border rounded-lg resize-none focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Genere
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {genres.map((genre) => (
                      <button
                        key={genre.value}
                        type="button"
                        onClick={() => updateFormData({ genre: genre.value as BookFormData['genre'] })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.genre === genre.value
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium">{genre.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{genre.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'audience' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Fascia d'Età
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">Da</label>
                      <select
                        value={formData.ageMin}
                        onChange={(e) => updateFormData({ ageMin: parseInt(e.target.value) })}
                        className="w-full p-3 border rounded-lg mt-1"
                      >
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(age => (
                          <option key={age} value={age}>{age} anni</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">A</label>
                      <select
                        value={formData.ageMax}
                        onChange={(e) => updateFormData({ ageMax: parseInt(e.target.value) })}
                        className="w-full p-3 border rounded-lg mt-1"
                      >
                        {[4, 5, 6, 7, 8, 9, 10, 11, 12].map(age => (
                          <option key={age} value={age}>{age} anni</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Lingua di Pubblicazione
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => updateFormData({ language: 'it' })}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        formData.language === 'it'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">🇮🇹</span>
                      <p className="font-medium mt-2">Solo Italiano</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateFormData({ language: 'en' })}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        formData.language === 'en'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">🇬🇧</span>
                      <p className="font-medium mt-2">Solo Inglese</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateFormData({ language: 'both' })}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        formData.language === 'both'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">🌍</span>
                      <p className="font-medium mt-2">Entrambe</p>
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Consiglio:</strong> Per massimizzare le vendite su Amazon, pubblica in entrambe le lingue.
                    Il mercato anglofono è molto più grande!
                  </p>
                </div>
              </div>
            )}

            {currentStep === 'style' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Stile Illustrazioni
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {illustrationStyles.map((style) => (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() => updateFormData({ illustrationStyle: style.value as BookFormData['illustrationStyle'] })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.illustrationStyle === style.value
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium">{style.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{style.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Palette Colori
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {colorPalettes.map((palette) => (
                      <button
                        key={palette.value}
                        type="button"
                        onClick={() => updateFormData({ colorPalette: palette.value as BookFormData['colorPalette'] })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.colorPalette === palette.value
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex gap-2 mb-2">
                          {palette.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="font-medium">{palette.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'chapters' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numero di Capitoli
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="4"
                      max="20"
                      value={formData.chaptersCount}
                      onChange={(e) => updateFormData({ chaptersCount: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="w-16 text-center font-bold text-lg">{formData.chaptersCount}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Consigliato: 6-10 capitoli per bambini piccoli, 10-15 per più grandi
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parole per Capitolo (circa)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="200"
                      max="1500"
                      step="100"
                      value={formData.wordsPerChapter}
                      onChange={(e) => updateFormData({ wordsPerChapter: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="w-16 text-center font-bold text-lg">{formData.wordsPerChapter}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    3-5 anni: ~200 parole | 6-8 anni: ~500 parole | 9-12 anni: ~1000 parole
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Istruzioni Speciali per l'AI (opzionale)
                  </label>
                  <textarea
                    value={formData.aiInstructions}
                    onChange={(e) => updateFormData({ aiInstructions: e.target.value })}
                    placeholder="Es: Includi un personaggio robot simpatico, usa molte metafore con la natura, evita temi di separazione..."
                    className="w-full h-24 p-3 border rounded-lg resize-none focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Stima del Libro</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Parole totali:</span>
                      <span className="ml-2 font-medium">{formData.chaptersCount * formData.wordsPerChapter}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Pagine stimate:</span>
                      <span className="ml-2 font-medium">{Math.ceil((formData.chaptersCount * formData.wordsPerChapter) / 250)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Illustrazioni:</span>
                      <span className="ml-2 font-medium">{formData.chaptersCount * 2}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tempo lettura:</span>
                      <span className="ml-2 font-medium">{Math.ceil((formData.chaptersCount * formData.wordsPerChapter) / 150)} min</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'confirm' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold">Pronto a Creare!</h3>
                  <p className="text-gray-500 mt-1">Verifica i dettagli e avvia la generazione con AI</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Titolo:</span>
                    <span className="font-medium">{formData.title || '(non specificato)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Genere:</span>
                    <span className="font-medium">{genres.find(g => g.value === formData.genre)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Età target:</span>
                    <span className="font-medium">{formData.ageMin}-{formData.ageMax} anni</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lingua:</span>
                    <span className="font-medium">
                      {formData.language === 'it' ? 'Italiano' : formData.language === 'en' ? 'Inglese' : 'IT + EN'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stile illustrazioni:</span>
                    <span className="font-medium">{illustrationStyles.find(s => s.value === formData.illustrationStyle)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Capitoli:</span>
                    <span className="font-medium">{formData.chaptersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Parole stimate:</span>
                    <span className="font-medium">{formData.chaptersCount * formData.wordsPerChapter}</span>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-sm text-indigo-800">
                    <strong>Prossimi passi:</strong> L'AI genererà un outline con i titoli dei capitoli.
                    Potrai modificarlo prima di procedere alla scrittura completa.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <div>
            {currentStepIndex > 0 ? (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Indietro
              </Button>
            ) : (
              <Link href="/libri-bambini">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Annulla
                </Button>
              </Link>
            )}
          </div>

          <div>
            {currentStep === 'confirm' ? (
              <Button
                onClick={handleCreate}
                disabled={isGenerating || !formData.title}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    Generazione in corso...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Crea con AI
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Avanti
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
