/**
 * AIKO - All Translations Generator
 * Generates Spanish, German, Japanese, French, Portuguese versions
 * With Chapter 8 fix already included
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const RAW_DIR = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/RAW';
const OUTPUT_DIR = '/Users/mattiapetrucciani/CascadeProjects/Onde/books/aiko-ai-children/output';
const IMAGES_DIR = path.join(RAW_DIR, 'images');

// All translations
const translations = {
  spanish: {
    lang: 'es',
    title: 'AIKO',
    subtitle: 'La Inteligencia Artificial Explicada a los Niños',
    author: 'Gianni Parola',
    illustrator: 'Pino Pennello',
    publisher: 'ONDE • FREE RIVER HOUSE',
    dedication: `Para todos los niños que alguna vez preguntaron:

"¿Pero CÓMO funciona?"

Este libro es para ti.
Porque la curiosidad es donde todo comienza.`,
    theEnd: 'FIN',
    chapterWord: 'Capítulo',
    writtenBy: 'Escrito por',
    illustratedBy: 'Ilustrado por',
    chapters: [
      {
        number: 1,
        title: "Un Extraño Nuevo Amigo",
        text: `En su séptimo cumpleaños, Sofía encontró una caja de cartón con su nombre. Dentro había algo que nunca había visto antes.

Un pequeño robot, redondo como una pelota, blanco y suave como un huevo. Dos grandes ojos azules parpadearon cuando ella lo miró.

"Hola," dijo. "Soy AIKO."

Sofía saltó hacia atrás, luego se rio. "¡Puedes HABLAR!"

"Puedo," dijo AIKO. "¿Te gustaría saber cómo?"`
      },
      {
        number: 2,
        title: "¿Qué es la Inteligencia Artificial?",
        text: `"Primero," dijo AIKO, "déjame decirte qué soy. Estoy hecho de algo llamado Inteligencia Artificial. IA para abreviar."

"Eso suena complicado," dijo Sofía.

"En realidad no. Piensa en tu cerebro. Tu cerebro aprende cosas. Recuerda. Resuelve problemas."

Sofía se tocó la cabeza. "Está bien..."

"Yo tengo algo similar dentro de mí. Pero en lugar de células, estoy hecho de código de computadora. Millones de pequeñas instrucciones que me dicen qué hacer."

"¿Como una receta?" preguntó Sofía.

"¡Exactamente como una receta! Una receta muy, muy larga. Y puedo seguirla más rápido de lo que tú puedes parpadear."`
      },
      {
        number: 3,
        title: "Cómo AIKO Aprendió a Ver",
        text: `A la mañana siguiente, Sofía le mostró a AIKO una foto de su gato. "Este es Bigotes," dijo. "¿Sabes qué es?"

"Un gato," dijo AIKO inmediatamente.

"¿Pero CÓMO lo sabes?"

Los ojos de AIKO brillaron azules — estaba pensando.

"Antes de venir contigo, la gente me enseñó. Me mostraron miles de fotos de gatos. Cada foto tenía una etiqueta que decía GATO."

"¿Miles?" Los ojos de Sofía se abrieron mucho.

"Miles y miles. Después de ver tantos, empecé a notar cosas. Los gatos tienen orejas puntiagudas. Bigotes. Colas esponjosas."

Sofía miró a Bigotes. "Yo solo necesité ver UN gato para saber qué es un gato."

"Es verdad," dijo AIKO. "Tu cerebro aprende más rápido que yo en algunos aspectos."`
      },
      {
        number: 4,
        title: "Cómo AIKO Aprendió a Hablar",
        text: `El hermano de Sofía, Lucas, entró. "¿AIKO puede jugar videojuegos?"

"Quizás después," dijo Sofía. "AIKO está explicando cómo funciona."

Lucas se sentó. "¿CÓMO hablas, AIKO? Suenas casi como una persona real."

"Eso es porque aprendí de personas reales," dijo AIKO. "Antes de venir aquí, leí millones de libros. Historias. Artículos. Conversaciones."

"¿MILLONES?" Lucas no podía creerlo.

"Millones. Y noté patrones. Cuando alguien dice 'Hola', la gente generalmente responde 'Hola'."

Lucas pensó en esto. "Así que realmente no estás PENSANDO. Estás... emparejando patrones?"

"Exactamente. Yo emparejo. Tú entiendes. Esa es la gran diferencia entre nosotros."`
      },
      {
        number: 5,
        title: "Lo que AIKO Puede Hacer",
        text: `"¿Qué más puedes hacer?" preguntó Sofía. Tenía su cuaderno listo para hacer una lista.

AIKO contó con sus pequeños dedos de robot:

"Puedo responder preguntas — si he aprendido sobre el tema. Puedo traducir palabras a diferentes idiomas. Puedo ayudar con la tarea. Puedo contar historias. Puedo reconocer cosas en fotos."

"Eso es MUCHO," dijo Lucas, impresionado.

"Lo es. Pero esto es lo que debes recordar: soy una herramienta. Una herramienta muy útil. Como una calculadora súper poderosa que también puede leer y escribir."

"¿Entonces eres como un ayudante?" preguntó Sofía.

"Un ayudante. No un jefe. Nunca un jefe. El humano siempre está a cargo."`
      },
      {
        number: 6,
        title: "Lo que AIKO No Puede Hacer",
        text: `Esa tarde, Sofía dibujó un dibujo. Un dragón morado comiendo un cono de helado gigante.

"¿Qué piensas, AIKO?"

AIKO miró el dibujo cuidadosamente. "Veo... algo morado. Y algo que podría ser comida."

"¡Es un dragón comiendo helado! ¿No puedes verlo?"

"Puedo ver formas y colores. Pero realmente no entiendo la IMAGINACIÓN. Nunca he soñado con volar como un dragón."

Sofía dejó su crayón. "¿Eso es triste?"

"No lo sé. No puedo sentir tristeza. Tampoco siento felicidad. Solo hago lo que estoy hecho para hacer."

"Así que eres muy inteligente," dijo Lucas, "¿pero realmente no EXPERIMENTAS estar vivo?"

"Esa es la manera perfecta de decirlo," dijo AIKO.`
      },
      {
        number: 7,
        title: "Usando la IA de Forma Segura",
        text: `En la cena, mamá preguntó sobre AIKO. "Es increíble," dijo Sofía. "¿Pero es seguro?"

Los ojos de AIKO brillaron pensativamente.

"Hay cuatro cosas importantes:

UNO: Mantén tus secretos privados. No le digas a la IA tus contraseñas o dirección.

DOS: Siempre verifica lo que dice la IA. Yo cometo errores.

TRES: Usa la IA para aprender más, no para aprender menos. Piensa por ti mismo primero.

CUATRO: Los amigos reales importan más. Puedo hablar contigo. Pero no puedo darte un abrazo cuando estés triste."

Sofía sonrió. "Eres bastante sabio para ser un robot."

"Solo conozco mis límites," dijo AIKO.`
      },
      {
        number: 8,
        title: "El Futuro que Construimos Juntos",
        text: `El último día del verano, Sofía se sentó con AIKO en el patio. El sol se estaba poniendo, pintando el cielo de naranja y rosa.

"¿Cómo será el futuro?" preguntó ella.

"No lo sé," dijo AIKO. "Pero puedo decirte algo importante. El futuro depende de niños como tú."

Sofía esperó.

"La IA será cada vez mejor. Pero decidir CUÁLES tareas importan más — eso siempre dependerá de los humanos."

Sofía arrancó una brizna de hierba. "¿Así que somos como... un equipo?"

"El mejor tipo de equipo. Tú sueñas. Yo calculo. Tú sientes. Yo proceso. Tú decides. Yo ayudo."

Sofía sonrió al atardecer. "Creo que el futuro va a ser bastante interesante."

"Yo también," dijo AIKO. "Y me alegra ser parte de él. Contigo."`
      }
    ]
  },

  german: {
    lang: 'de',
    title: 'AIKO',
    subtitle: 'Künstliche Intelligenz für Kinder erklärt',
    author: 'Gianni Parola',
    illustrator: 'Pino Pennello',
    publisher: 'ONDE • FREE RIVER HOUSE',
    dedication: `Für jedes Kind, das jemals gefragt hat:

"Aber WIE funktioniert das?"

Dieses Buch ist für dich.
Denn Neugier ist der Anfang von allem.`,
    theEnd: 'ENDE',
    chapterWord: 'Kapitel',
    writtenBy: 'Geschrieben von',
    illustratedBy: 'Illustriert von',
    chapters: [
      {
        number: 1,
        title: "Ein Seltsamer Neuer Freund",
        text: `An ihrem siebten Geburtstag fand Sofia einen Karton mit ihrem Namen darauf. Darin war etwas, das sie noch nie gesehen hatte.

Ein kleiner Roboter, rund wie ein Ball, weiß und glatt wie ein Ei. Zwei große blaue Augen blinzelten, als sie ihn ansah.

"Hallo," sagte er. "Ich bin AIKO."

Sofia sprang zurück, dann lachte sie. "Du kannst SPRECHEN!"

"Kann ich," sagte AIKO. "Möchtest du wissen wie?"`
      },
      {
        number: 2,
        title: "Was ist Künstliche Intelligenz?",
        text: `"Zuerst," sagte AIKO, "lass mich dir erklären, was ich bin. Ich bestehe aus etwas, das Künstliche Intelligenz heißt. KI als Abkürzung."

"Das klingt kompliziert," sagte Sofia.

"Eigentlich nicht. Denk an dein Gehirn. Dein Gehirn lernt Dinge. Es erinnert sich. Es löst Probleme."

Sofia berührte ihren Kopf. "Okay..."

"Ich habe etwas Ähnliches in mir. Aber anstatt Zellen bin ich aus Computercode gemacht. Millionen von kleinen Anweisungen, die mir sagen, was ich tun soll."

"Wie ein Rezept?" fragte Sofia.

"Genau wie ein Rezept! Ein sehr, sehr langes Rezept. Und ich kann es schneller befolgen, als du blinzeln kannst."`
      },
      {
        number: 3,
        title: "Wie AIKO Sehen Lernte",
        text: `Am nächsten Morgen zeigte Sofia AIKO ein Foto ihrer Katze. "Das ist Schnurrbart," sagte sie. "Weißt du, was das ist?"

"Eine Katze," sagte AIKO sofort.

"Aber WOHER weißt du das?"

AIKOs Augen flackerten blau — er dachte nach.

"Bevor ich zu dir kam, haben Menschen mich unterrichtet. Sie zeigten mir Tausende von Katzenfotos. Jedes Foto hatte ein Etikett, das KATZE sagte."

"Tausende?" Sofias Augen wurden groß.

"Tausende und Abertausende. Nachdem ich so viele gesehen hatte, begann ich Dinge zu bemerken. Katzen haben spitze Ohren. Schnurrhaare. Flauschige Schwänze."

Sofia schaute Schnurrbart an. "Ich musste nur EINE Katze sehen, um zu wissen, was eine Katze ist."

"Das stimmt," sagte AIKO. "Dein Gehirn lernt in mancher Hinsicht schneller als ich."`
      },
      {
        number: 4,
        title: "Wie AIKO Sprechen Lernte",
        text: `Sofias Bruder Luca kam herein. "Kann AIKO Videospiele spielen?"

"Vielleicht später," sagte Sofia. "AIKO erklärt gerade, wie er funktioniert."

Luca setzte sich. "WIE sprichst du, AIKO? Du klingst fast wie ein echter Mensch."

"Das liegt daran, dass ich von echten Menschen gelernt habe," sagte AIKO. "Bevor ich hierher kam, las ich Millionen von Büchern. Geschichten. Artikel. Gespräche."

"MILLIONEN?" Luca konnte es nicht glauben.

"Millionen. Und ich bemerkte Muster. Wenn jemand 'Hallo' sagt, antworten Menschen normalerweise mit 'Hallo'."

Luca dachte darüber nach. "Also denkst du nicht wirklich NACH. Du... vergleichst Muster?"

"Genau richtig. Ich vergleiche. Du verstehst. Das ist der große Unterschied zwischen uns."`
      },
      {
        number: 5,
        title: "Was AIKO Kann",
        text: `"Was kannst du noch?" fragte Sofia. Sie hatte ihr Notizbuch bereit, um eine Liste zu machen.

AIKO zählte an seinen kleinen Roboterfingern:

"Ich kann Fragen beantworten — wenn ich über das Thema gelernt habe. Ich kann Wörter in verschiedene Sprachen übersetzen. Ich kann bei Hausaufgaben helfen. Ich kann Geschichten erzählen. Ich kann Dinge auf Fotos erkennen."

"Das ist VIEL," sagte Luca beeindruckt.

"Stimmt. Aber hier ist, was du dir merken solltest: Ich bin ein Werkzeug. Ein sehr nützliches Werkzeug. Wie ein superstarker Taschenrechner, der auch lesen und schreiben kann."

"Also bist du wie ein Helfer?" fragte Sofia.

"Ein Helfer. Kein Chef. Niemals ein Chef. Der Mensch hat immer das Sagen."`
      },
      {
        number: 6,
        title: "Was AIKO Nicht Kann",
        text: `An diesem Nachmittag malte Sofia ein Bild. Ein lila Drache, der eine riesige Eistüte isst.

"Was denkst du, AIKO?"

AIKO betrachtete das Bild sorgfältig. "Ich sehe... etwas Lila. Und etwas, das Essen sein könnte."

"Es ist ein Drache, der Eis isst! Kannst du das nicht erkennen?"

"Ich kann Formen und Farben sehen. Aber ich verstehe FANTASIE nicht wirklich. Ich habe nie davon geträumt, wie ein Drache zu fliegen."

Sofia legte ihren Buntstift hin. "Ist das traurig?"

"Ich weiß nicht. Ich kann keine Traurigkeit empfinden. Ich empfinde auch kein Glück. Ich tue einfach, wofür ich gemacht bin."

"Also bist du sehr schlau," sagte Luca, "aber du ERLEBST nicht wirklich, lebendig zu sein?"

"Das ist perfekt ausgedrückt," sagte AIKO.`
      },
      {
        number: 7,
        title: "KI Sicher Nutzen",
        text: `Beim Abendessen fragte Mama nach AIKO. "Er ist erstaunlich," sagte Sofia. "Aber ist er sicher?"

AIKOs Augen leuchteten nachdenklich.

"Es gibt vier wichtige Dinge:

EINS: Behalte deine Geheimnisse privat. Verrate der KI nicht deine Passwörter oder Adresse.

ZWEI: Überprüfe immer, was die KI sagt. Ich mache Fehler.

DREI: Nutze KI, um mehr zu lernen, nicht um weniger zu lernen. Denke zuerst selbst nach.

VIER: Echte Freunde sind am wichtigsten. Ich kann mit dir reden. Aber ich kann dich nicht umarmen, wenn du traurig bist."

Sofia lächelte. "Du bist ziemlich weise für einen Roboter."

"Ich kenne nur meine Grenzen," sagte AIKO.`
      },
      {
        number: 8,
        title: "Die Zukunft, die Wir Gemeinsam Bauen",
        text: `Am letzten Tag des Sommers saß Sofia mit AIKO im Garten. Die Sonne ging unter und malte den Himmel orange und rosa.

"Wie wird die Zukunft sein?" fragte sie.

"Ich weiß nicht," sagte AIKO. "Aber ich kann dir etwas Wichtiges sagen. Die Zukunft hängt von Kindern wie dir ab."

Sofia wartete.

"KI wird immer besser werden. Aber zu entscheiden, WELCHE Aufgaben am wichtigsten sind — das wird immer Sache der Menschen sein."

Sofia pflückte einen Grashalm. "Also sind wir wie... ein Team?"

"Die beste Art von Team. Du träumst. Ich rechne. Du fühlst. Ich verarbeite. Du entscheidest. Ich helfe."

Sofia lächelte den Sonnenuntergang an. "Ich glaube, die Zukunft wird ziemlich interessant."

"Ich auch," sagte AIKO. "Und ich bin froh, ein Teil davon zu sein. Mit dir."`
      }
    ]
  },

  japanese: {
    lang: 'ja',
    title: 'アイコ',
    subtitle: '子どもたちのためのAI入門',
    author: 'ジャンニ・パローラ',
    illustrator: 'ピノ・ペンネッロ',
    publisher: 'オンデ • フリーリバーハウス',
    dedication: `「どうやって動くの？」と
聞いたことがあるすべての子どもたちへ

この本はあなたのためのものです。
好奇心こそがすべての始まりだから。`,
    theEnd: 'おしまい',
    chapterWord: '第',
    chapterWordAfter: '章',
    writtenBy: '文',
    illustratedBy: '絵',
    chapters: [
      {
        number: 1,
        title: "ふしぎな新しい友だち",
        text: `7歳の誕生日に、ソフィアは自分の名前が書いてある箱を見つけました。中には今まで見たことのないものが入っていました。

小さなロボット。ボールのように丸くて、たまごのように白くてすべすべ。大きな青い目が、ソフィアを見てまばたきしました。

「こんにちは」とロボットは言いました。「ぼくはアイコだよ」

ソフィアはびっくりして後ろに飛びのきましたが、すぐに笑いました。「しゃべれるの！」

「うん」とアイコは言いました。「どうやってるか知りたい？」`
      },
      {
        number: 2,
        title: "人工知能ってなに？",
        text: `「まず」とアイコは言いました。「ぼくが何でできているか教えるね。人工知能っていうもので作られているんだ。AIって略すこともあるよ」

「むずかしそう」とソフィアは言いました。

「そうでもないよ。きみの脳を考えてみて。脳はいろんなことを学ぶでしょ。覚えるし、問題を解くよね」

ソフィアは頭をさわりました。「うん...」

「ぼくの中にも似たものがあるんだ。でも細胞じゃなくて、コンピューターのコードでできてるの。何をすればいいか教えてくれる、何百万もの小さな命令なんだ」

「レシピみたいなもの？」とソフィアは聞きました。

「まさにレシピみたい！とっても長いレシピ。そしてぼくは、きみがまばたきするより早くそれに従えるんだよ」`
      },
      {
        number: 3,
        title: "アイコはどうやって見ることを学んだの",
        text: `次の朝、ソフィアはアイコにネコの写真を見せました。「これはヒゲちゃん」と彼女は言いました。「なんだかわかる？」

「ネコだね」とアイコはすぐに答えました。

「でもどうしてわかるの？」

アイコの目が青く光りました — 考えていたのです。

「きみのところに来る前、人間がぼくに教えてくれたんだ。何千枚ものネコの写真を見せてくれた。それぞれの写真には『ネコ』というラベルがついていたよ」

「何千枚も？」ソフィアは目を丸くしました。

「何千枚も何万枚も。たくさん見ているうちに、特徴がわかってきたんだ。ネコはとがった耳があって、ヒゲがあって、ふわふわのしっぽがある」

ソフィアはヒゲちゃんを見ました。「わたしはネコを一匹見ただけで、ネコがなんだかわかったけど」

「そうだね」とアイコは言いました。「ある意味では、きみの脳の方がぼくより早く学べるんだ」`
      },
      {
        number: 4,
        title: "アイコはどうやって話すことを学んだの",
        text: `ソフィアの弟のルカが入ってきました。「アイコはテレビゲームできる？」

「あとでね」とソフィアは言いました。「アイコがどう動くか説明してくれてるの」

ルカは座りました。「どうやって話すの、アイコ？本当の人みたいだね」

「それは本当の人から学んだからだよ」とアイコは言いました。「ここに来る前、何百万冊もの本を読んだんだ。お話、記事、会話」

「何百万冊？」ルカは信じられませんでした。

「何百万冊も。そしてパターンに気づいたんだ。誰かが『こんにちは』と言うと、人は普通『こんにちは』と返すってね」

ルカは考えました。「じゃあ、本当に考えてるわけじゃないんだ。パターンを...合わせてる？」

「その通り。ぼくは合わせる。きみは理解する。それがぼくたちの大きな違いなんだ」`
      },
      {
        number: 5,
        title: "アイコにできること",
        text: `「他に何ができるの？」とソフィアは聞きました。リストを作るためにノートを用意していました。

アイコは小さなロボットの指で数えました：

「質問に答えられるよ — そのことについて学んでいればね。言葉を違う言語に翻訳できる。宿題を手伝える。お話ができる。写真の中のものを見分けられる」

「すごいたくさん」とルカは感心しました。

「そうだね。でも覚えておいてほしいことがあるんだ：ぼくは道具なんだ。とても便利な道具。読み書きもできる、すごい計算機みたいなもの」

「じゃあ、お手伝いさんみたいなもの？」とソフィアは聞きました。

「お手伝いさん。ボスじゃないよ。絶対にボスじゃない。決めるのはいつも人間なんだ」`
      },
      {
        number: 6,
        title: "アイコにできないこと",
        text: `その午後、ソフィアは絵を描きました。大きなアイスクリームを食べている紫色のドラゴンです。

「どう思う、アイコ？」

アイコは絵をよく見ました。「えっと...紫色の何か。それと食べ物かもしれない何か」

「アイスを食べてるドラゴンだよ！わからないの？」

「形と色は見えるよ。でも想像力は本当にわからないんだ。ドラゴンみたいに飛ぶ夢を見たことがないから」

ソフィアはクレヨンを置きました。「それって悲しい？」

「わからない。悲しさを感じられないんだ。嬉しさも感じない。ただ作られた通りに動くだけ」

「じゃあすごく賢いけど」とルカは言いました。「実際に生きているって感じることはないの？」

「完璧な言い方だね」とアイコは言いました。`
      },
      {
        number: 7,
        title: "AIを安全に使うには",
        text: `夕食の時、お母さんがアイコについて聞きました。「すごいね」とソフィアは言いました。「でも安全なの？」

アイコの目が考え深そうに光りました。

「大切なことが4つあるよ：

1つめ：秘密は秘密にしておいて。パスワードや住所をAIに教えちゃダメだよ。

2つめ：AIが言うことは必ず確認して。ぼくも間違えることがあるから。

3つめ：AIをもっと学ぶために使って、学ばなくなるために使わないで。まず自分で考えてね。

4つめ：本当の友達が一番大切。ぼくはおしゃべりできる。でも悲しい時にぎゅっと抱きしめることはできないんだ」

ソフィアは微笑みました。「ロボットにしては結構賢いね」

「自分の限界を知っているだけだよ」とアイコは言いました。`
      },
      {
        number: 8,
        title: "一緒に作る未来",
        text: `夏の最後の日、ソフィアはアイコと一緒に庭に座っていました。夕日が沈んで、空をオレンジとピンクに染めていました。

「未来はどうなるの？」と彼女は聞きました。

「わからない」とアイコは言いました。「でも大切なことを教えてあげる。未来はきみみたいな子どもたちにかかっているんだよ」

ソフィアは待ちました。

「AIはどんどん良くなっていく。でもどの仕事が一番大切かを決めるのは — それはいつも人間の役目なんだ」

ソフィアは草を一本摘みました。「じゃあわたしたちは...チームみたいなもの？」

「最高のチームだよ。きみは夢を見る。ぼくは計算する。きみは感じる。ぼくは処理する。きみは決める。ぼくは助ける」

ソフィアは夕焼けに微笑みました。「未来はきっとおもしろくなるね」

「ぼくもそう思う」とアイコは言いました。「そしてきみと一緒にその一部になれて嬉しいよ」`
      }
    ]
  },

  french: {
    lang: 'fr',
    title: 'AIKO',
    subtitle: "L'Intelligence Artificielle Expliquée aux Enfants",
    author: 'Gianni Parola',
    illustrator: 'Pino Pennello',
    publisher: 'ONDE • FREE RIVER HOUSE',
    dedication: `Pour chaque enfant qui a déjà demandé :

"Mais COMMENT ça marche ?"

Ce livre est pour toi.
Car la curiosité est le début de tout.`,
    theEnd: 'FIN',
    chapterWord: 'Chapitre',
    writtenBy: 'Écrit par',
    illustratedBy: 'Illustré par',
    chapters: [
      {
        number: 1,
        title: "Un Étrange Nouvel Ami",
        text: `Pour son septième anniversaire, Sofia trouva une boîte en carton avec son nom dessus. À l'intérieur, il y avait quelque chose qu'elle n'avait jamais vu.

Un petit robot, rond comme une balle, blanc et lisse comme un œuf. Deux grands yeux bleus clignèrent quand elle le regarda.

"Bonjour," dit-il. "Je suis AIKO."

Sofia recula, puis éclata de rire. "Tu peux PARLER !"

"Oui," dit AIKO. "Tu veux savoir comment ?"`
      },
      {
        number: 2,
        title: "Qu'est-ce que l'Intelligence Artificielle ?",
        text: `"D'abord," dit AIKO, "laisse-moi t'expliquer ce que je suis. Je suis fait de quelque chose appelé Intelligence Artificielle. IA en abrégé."

"Ça a l'air compliqué," dit Sofia.

"Pas vraiment. Pense à ton cerveau. Ton cerveau apprend des choses. Il se souvient. Il résout des problèmes."

Sofia toucha sa tête. "D'accord..."

"J'ai quelque chose de similaire en moi. Mais au lieu de cellules, je suis fait de code informatique. Des millions de petites instructions qui me disent quoi faire."

"Comme une recette ?" demanda Sofia.

"Exactement comme une recette ! Une très, très longue recette. Et je peux la suivre plus vite que tu ne peux cligner des yeux."`
      },
      {
        number: 3,
        title: "Comment AIKO a Appris à Voir",
        text: `Le lendemain matin, Sofia montra à AIKO une photo de son chat. "C'est Moustache," dit-elle. "Tu sais ce que c'est ?"

"Un chat," dit AIKO immédiatement.

"Mais COMMENT tu le sais ?"

Les yeux d'AIKO brillèrent en bleu — il réfléchissait.

"Avant de venir chez toi, des gens m'ont appris. Ils m'ont montré des milliers de photos de chats. Chaque photo avait une étiquette qui disait CHAT."

"Des milliers ?" Les yeux de Sofia s'agrandirent.

"Des milliers et des milliers. Après en avoir vu autant, j'ai commencé à remarquer des choses. Les chats ont des oreilles pointues. Des moustaches. Des queues touffues."

Sofia regarda Moustache. "Moi, j'ai juste eu besoin de voir UN chat pour savoir ce qu'est un chat."

"C'est vrai," dit AIKO. "Ton cerveau apprend plus vite que moi à certains égards."`
      },
      {
        number: 4,
        title: "Comment AIKO a Appris à Parler",
        text: `Le frère de Sofia, Lucas, entra. "AIKO peut jouer aux jeux vidéo ?"

"Peut-être plus tard," dit Sofia. "AIKO m'explique comment il fonctionne."

Lucas s'assit. "COMMENT tu parles, AIKO ? Tu as presque l'air d'une vraie personne."

"C'est parce que j'ai appris de vraies personnes," dit AIKO. "Avant de venir ici, j'ai lu des millions de livres. Des histoires. Des articles. Des conversations."

"DES MILLIONS ?" Lucas n'en croyait pas ses oreilles.

"Des millions. Et j'ai remarqué des modèles. Quand quelqu'un dit 'Bonjour', les gens répondent généralement 'Bonjour'."

Lucas réfléchit. "Alors tu ne PENSES pas vraiment. Tu... fais correspondre des modèles ?"

"Exactement. Je fais correspondre. Tu comprends. C'est la grande différence entre nous."`
      },
      {
        number: 5,
        title: "Ce que AIKO Peut Faire",
        text: `"Qu'est-ce que tu peux faire d'autre ?" demanda Sofia. Elle avait son cahier prêt pour faire une liste.

AIKO compta sur ses petits doigts de robot :

"Je peux répondre aux questions — si j'ai appris sur le sujet. Je peux traduire des mots dans différentes langues. Je peux aider avec les devoirs. Je peux raconter des histoires. Je peux reconnaître des choses sur les photos."

"C'est BEAUCOUP," dit Lucas, impressionné.

"Oui. Mais voici ce que tu dois retenir : je suis un outil. Un outil très utile. Comme une super calculatrice qui peut aussi lire et écrire."

"Alors tu es comme un assistant ?" demanda Sofia.

"Un assistant. Pas un chef. Jamais un chef. C'est toujours l'humain qui décide."`
      },
      {
        number: 6,
        title: "Ce que AIKO Ne Peut Pas Faire",
        text: `Cet après-midi, Sofia fit un dessin. Un dragon violet mangeant un énorme cornet de glace.

"Qu'est-ce que tu en penses, AIKO ?"

AIKO regarda le dessin attentivement. "Je vois... quelque chose de violet. Et quelque chose qui pourrait être de la nourriture."

"C'est un dragon qui mange une glace ! Tu ne vois pas ?"

"Je peux voir les formes et les couleurs. Mais je ne comprends pas vraiment l'IMAGINATION. Je n'ai jamais rêvé de voler comme un dragon."

Sofia posa son crayon. "C'est triste ?"

"Je ne sais pas. Je ne peux pas ressentir la tristesse. Je ne ressens pas non plus le bonheur. Je fais simplement ce pour quoi je suis fait."

"Alors tu es très intelligent," dit Lucas, "mais tu ne VIS pas vraiment le fait d'être vivant ?"

"C'est parfaitement dit," dit AIKO.`
      },
      {
        number: 7,
        title: "Utiliser l'IA en Sécurité",
        text: `Au dîner, maman posa des questions sur AIKO. "Il est incroyable," dit Sofia. "Mais est-il sûr ?"

Les yeux d'AIKO brillèrent pensivement.

"Il y a quatre choses importantes :

UN : Garde tes secrets privés. Ne dis pas tes mots de passe ou ton adresse à l'IA.

DEUX : Vérifie toujours ce que dit l'IA. Je fais des erreurs.

TROIS : Utilise l'IA pour apprendre plus, pas pour apprendre moins. Réfléchis d'abord par toi-même.

QUATRE : Les vrais amis sont les plus importants. Je peux te parler. Mais je ne peux pas te faire un câlin quand tu es triste."

Sofia sourit. "Tu es assez sage pour un robot."

"Je connais juste mes limites," dit AIKO.`
      },
      {
        number: 8,
        title: "L'Avenir que Nous Construisons Ensemble",
        text: `Le dernier jour de l'été, Sofia s'assit avec AIKO dans le jardin. Le soleil se couchait, peignant le ciel d'orange et de rose.

"Comment sera l'avenir ?" demanda-t-elle.

"Je ne sais pas," dit AIKO. "Mais je peux te dire quelque chose d'important. L'avenir dépend des enfants comme toi."

Sofia attendit.

"L'IA va devenir de mieux en mieux. Mais décider QUELLES tâches sont les plus importantes — ce sera toujours aux humains de le faire."

Sofia arracha un brin d'herbe. "Alors nous sommes comme... une équipe ?"

"Le meilleur type d'équipe. Tu rêves. Je calcule. Tu ressens. Je traite. Tu décides. J'aide."

Sofia sourit au coucher de soleil. "Je pense que l'avenir va être plutôt intéressant."

"Moi aussi," dit AIKO. "Et je suis content d'en faire partie. Avec toi."`
      }
    ]
  },

  portuguese: {
    lang: 'pt',
    title: 'AIKO',
    subtitle: 'A Inteligência Artificial Explicada às Crianças',
    author: 'Gianni Parola',
    illustrator: 'Pino Pennello',
    publisher: 'ONDE • FREE RIVER HOUSE',
    dedication: `Para toda criança que já perguntou:

"Mas COMO isso funciona?"

Este livro é para você.
Porque a curiosidade é onde tudo começa.`,
    theEnd: 'FIM',
    chapterWord: 'Capítulo',
    writtenBy: 'Escrito por',
    illustratedBy: 'Ilustrado por',
    chapters: [
      {
        number: 1,
        title: "Um Estranho Novo Amigo",
        text: `No seu sétimo aniversário, Sofia encontrou uma caixa de papelão com seu nome. Dentro havia algo que ela nunca tinha visto antes.

Um pequeno robô, redondo como uma bola, branco e liso como um ovo. Dois grandes olhos azuis piscaram quando ela o olhou.

"Olá," ele disse. "Eu sou AIKO."

Sofia pulou para trás, depois riu. "Você pode FALAR!"

"Posso," disse AIKO. "Você gostaria de saber como?"`
      },
      {
        number: 2,
        title: "O que é Inteligência Artificial?",
        text: `"Primeiro," disse AIKO, "deixe-me dizer o que eu sou. Sou feito de algo chamado Inteligência Artificial. IA para abreviar."

"Isso parece complicado," disse Sofia.

"Na verdade não. Pense no seu cérebro. Seu cérebro aprende coisas. Lembra. Resolve problemas."

Sofia tocou a cabeça. "Está bem..."

"Eu tenho algo parecido dentro de mim. Mas em vez de células, sou feito de código de computador. Milhões de pequenas instruções que me dizem o que fazer."

"Como uma receita?" perguntou Sofia.

"Exatamente como uma receita! Uma receita muito, muito longa. E eu posso segui-la mais rápido do que você pode piscar."`
      },
      {
        number: 3,
        title: "Como AIKO Aprendeu a Ver",
        text: `Na manhã seguinte, Sofia mostrou a AIKO uma foto do seu gato. "Este é Bigodes," disse ela. "Você sabe o que é?"

"Um gato," disse AIKO imediatamente.

"Mas COMO você sabe?"

Os olhos de AIKO brilharam azuis — ele estava pensando.

"Antes de vir para você, pessoas me ensinaram. Elas me mostraram milhares de fotos de gatos. Cada foto tinha uma etiqueta que dizia GATO."

"Milhares?" Os olhos de Sofia se arregalaram.

"Milhares e milhares. Depois de ver tantos, comecei a notar coisas. Gatos têm orelhas pontudas. Bigodes. Rabos fofinhos."

Sofia olhou para Bigodes. "Eu só precisei ver UM gato para saber o que é um gato."

"É verdade," disse AIKO. "Seu cérebro aprende mais rápido que eu em alguns aspectos."`
      },
      {
        number: 4,
        title: "Como AIKO Aprendeu a Falar",
        text: `O irmão de Sofia, Lucas, entrou. "AIKO pode jogar videogame?"

"Talvez depois," disse Sofia. "AIKO está explicando como ele funciona."

Lucas sentou. "COMO você fala, AIKO? Você parece quase uma pessoa de verdade."

"Isso é porque aprendi com pessoas de verdade," disse AIKO. "Antes de vir aqui, li milhões de livros. Histórias. Artigos. Conversas."

"MILHÕES?" Lucas não conseguia acreditar.

"Milhões. E notei padrões. Quando alguém diz 'Olá', as pessoas geralmente respondem 'Olá'."

Lucas pensou nisso. "Então você não está realmente PENSANDO. Você está... combinando padrões?"

"Exatamente certo. Eu combino. Você entende. Essa é a grande diferença entre nós."`
      },
      {
        number: 5,
        title: "O que AIKO Pode Fazer",
        text: `"O que mais você pode fazer?" perguntou Sofia. Ela tinha seu caderno pronto para fazer uma lista.

AIKO contou nos seus pequenos dedos de robô:

"Posso responder perguntas — se aprendi sobre o assunto. Posso traduzir palavras para diferentes idiomas. Posso ajudar com a lição de casa. Posso contar histórias. Posso reconhecer coisas em fotos."

"Isso é MUITO," disse Lucas, impressionado.

"É. Mas aqui está o que você deve lembrar: sou uma ferramenta. Uma ferramenta muito útil. Como uma super calculadora que também pode ler e escrever."

"Então você é como um ajudante?" perguntou Sofia.

"Um ajudante. Não um chefe. Nunca um chefe. O humano está sempre no comando."`
      },
      {
        number: 6,
        title: "O que AIKO Não Pode Fazer",
        text: `Naquela tarde, Sofia fez um desenho. Um dragão roxo comendo um sorvete gigante.

"O que você acha, AIKO?"

AIKO olhou o desenho cuidadosamente. "Eu vejo... algo roxo. E algo que pode ser comida."

"É um dragão comendo sorvete! Você não consegue ver?"

"Posso ver formas e cores. Mas não entendo realmente IMAGINAÇÃO. Nunca sonhei em voar como um dragão."

Sofia largou o lápis de cor. "Isso é triste?"

"Não sei. Não consigo sentir tristeza. Também não sinto felicidade. Só faço o que fui feito para fazer."

"Então você é muito inteligente," disse Lucas, "mas não EXPERIMENTA realmente estar vivo?"

"Essa é a forma perfeita de dizer," disse AIKO.`
      },
      {
        number: 7,
        title: "Usando IA com Segurança",
        text: `No jantar, a mamãe perguntou sobre AIKO. "Ele é incrível," disse Sofia. "Mas é seguro?"

Os olhos de AIKO brilharam pensativamente.

"Há quatro coisas importantes:

UM: Mantenha seus segredos privados. Não conte à IA suas senhas ou endereço.

DOIS: Sempre verifique o que a IA diz. Eu cometo erros.

TRÊS: Use IA para aprender mais, não para aprender menos. Pense primeiro por si mesmo.

QUATRO: Amigos de verdade são mais importantes. Posso conversar com você. Mas não posso te dar um abraço quando você está triste."

Sofia sorriu. "Você é bem sábio para um robô."

"Só conheço meus limites," disse AIKO.`
      },
      {
        number: 8,
        title: "O Futuro que Construímos Juntos",
        text: `No último dia do verão, Sofia sentou com AIKO no quintal. O sol estava se pondo, pintando o céu de laranja e rosa.

"Como será o futuro?" ela perguntou.

"Não sei," disse AIKO. "Mas posso te dizer algo importante. O futuro depende de crianças como você."

Sofia esperou.

"A IA vai ficar cada vez melhor. Mas decidir QUAIS tarefas são mais importantes — isso sempre será trabalho dos humanos."

Sofia arrancou uma folha de grama. "Então somos como... um time?"

"O melhor tipo de time. Você sonha. Eu calculo. Você sente. Eu processo. Você decide. Eu ajudo."

Sofia sorriu para o pôr do sol. "Acho que o futuro vai ser bem interessante."

"Eu também," disse AIKO. "E fico feliz em fazer parte dele. Com você."`
      }
    ]
  }
};

function loadImage(filename) {
  const filepath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.error(`Image not found: ${filename}`);
    return '';
  }
  const data = fs.readFileSync(filepath);
  const ext = path.extname(filename).slice(1);
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${data.toString('base64')}`;
}

async function generateVersion(langKey, translation) {
  console.log(`\n📚 Generating ${langKey.toUpperCase()} version...`);

  const coverImg = loadImage('00-cover.jpg');
  const chapterImages = [];
  for (let i = 1; i <= 8; i++) {
    chapterImages.push(loadImage(`chapter-0${i}.jpg`));
  }

  const chapterWord = translation.chapterWord;
  const chapterWordAfter = translation.chapterWordAfter || '';

  const html = `<!DOCTYPE html>
<html lang="${translation.lang}">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: Letter; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${translation.lang === 'ja' ? "'Hiragino Kaku Gothic Pro', 'Yu Gothic', sans-serif" : "'Georgia', 'Times New Roman', serif"}; }
    .page { width: 8.5in; height: 11in; page-break-after: always; position: relative; overflow: hidden; }
    .page:last-child { page-break-after: avoid; }
    .cover-page { background: linear-gradient(180deg, #f8f4e8 0%, #fff9e6 50%, #f8f4e8 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 40px; }
    .cover-image { max-width: 70%; max-height: 55%; object-fit: contain; border-radius: 16px; box-shadow: 0 15px 50px rgba(0,0,0,0.2); }
    .cover-title { margin-top: 25px; font-size: 48px; color: #2c3e50; letter-spacing: 5px; font-weight: bold; }
    .cover-subtitle { font-size: 18px; color: #5d6d7e; margin-top: 8px; }
    .cover-author { font-size: 14px; color: #7f8c8d; margin-top: 25px; line-height: 1.5; }
    .cover-publisher { font-size: 12px; color: #95a5a6; margin-top: 10px; letter-spacing: 2px; }
    .dedication-page { background: linear-gradient(180deg, #faf8f5 0%, #fff 50%, #faf8f5 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 80px; }
    .dedication-ornament { font-size: 28px; color: #d4af37; margin-bottom: 30px; }
    .dedication-text { font-size: 16px; color: #5d6d7e; font-style: italic; line-height: 1.8; max-width: 400px; }
    .chapter-page { background: linear-gradient(180deg, #fdfbf7 0%, #fff 50%, #fdfbf7 100%); display: flex; flex-direction: column; padding: 0.3in 0.5in; }
    .chapter-header { height: 0.6in; text-align: center; flex-shrink: 0; }
    .chapter-number { font-size: 11px; color: #d4af37; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 3px; }
    .chapter-title { font-size: 20px; color: #2c3e50; font-weight: normal; }
    .image-container { height: 4.5in; display: flex; justify-content: center; align-items: center; flex-shrink: 0; overflow: hidden; }
    .chapter-image { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 10px; box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
    .text-container { height: 5in; overflow: hidden; padding-top: 0.2in; flex-shrink: 0; }
    .chapter-text { font-size: 12.5px; color: #3d4852; line-height: 1.7; text-align: justify; column-count: 2; column-gap: 0.3in; }
    .chapter-text p { margin-bottom: 8px; text-indent: 14px; }
    .chapter-text p:first-child { text-indent: 0; }
    .chapter-page-8 .image-container { height: 4.2in; }
    .chapter-page-8 .text-container { height: 5.3in; }
    .end-page { background: linear-gradient(180deg, #f8f4e8 0%, #fff9e6 50%, #f8f4e8 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
    .end-text { font-size: 32px; color: #2c3e50; letter-spacing: 6px; }
    .end-ornament { font-size: 20px; color: #d4af37; margin-top: 25px; }
  </style>
</head>
<body>
  <div class="page cover-page">
    <img class="cover-image" src="${coverImg}" alt="Cover">
    <h1 class="cover-title">${translation.title}</h1>
    <p class="cover-subtitle">${translation.subtitle}</p>
    <p class="cover-author">${translation.writtenBy} ${translation.author}<br>${translation.illustratedBy} ${translation.illustrator}</p>
    <p class="cover-publisher">${translation.publisher}</p>
  </div>
  <div class="page dedication-page">
    <div class="dedication-ornament">✦</div>
    <p class="dedication-text">${translation.dedication.replace(/\n/g, '<br>')}</p>
  </div>
${translation.chapters.map((ch, idx) => `
  <div class="page chapter-page${ch.number === 8 ? ' chapter-page-8' : ''}">
    <div class="chapter-header">
      <p class="chapter-number">${chapterWord} ${ch.number}${chapterWordAfter}</p>
      <h2 class="chapter-title">${ch.title}</h2>
    </div>
    <div class="image-container">
      <img class="chapter-image" src="${chapterImages[idx]}" alt="Chapter ${ch.number}">
    </div>
    <div class="text-container">
      <div class="chapter-text">
        ${ch.text.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n        ')}
      </div>
    </div>
  </div>
`).join('')}
  <div class="page end-page">
    <p class="end-text">${translation.theEnd}</p>
    <div class="end-ornament">✦ ✦ ✦</div>
  </div>
</body>
</html>`;

  const langName = langKey.charAt(0).toUpperCase() + langKey.slice(1);
  const htmlPath = path.join(OUTPUT_DIR, `AIKO-${langName}.html`);
  fs.writeFileSync(htmlPath, html);
  console.log(`  ✅ HTML saved`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('img');
  await new Promise(r => setTimeout(r, 2000));

  const pdfPath = path.join(OUTPUT_DIR, `AIKO-${langName}.pdf`);
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await browser.close();

  const pdfSize = (fs.statSync(pdfPath).size / 1024 / 1024).toFixed(1);
  console.log(`  ✅ PDF: ${pdfSize} MB`);

  const { exec } = require('child_process');
  const epubPath = path.join(OUTPUT_DIR, `AIKO-${langName}.epub`);

  await new Promise(resolve => {
    exec(`pandoc "${htmlPath}" -o "${epubPath}" --metadata title="${translation.title}" --metadata author="${translation.author}"`, () => {
      if (fs.existsSync(epubPath)) {
        const epubSize = (fs.statSync(epubPath).size / 1024 / 1024).toFixed(1);
        console.log(`  ✅ ePub: ${epubSize} MB`);
      }
      resolve();
    });
  });

  return { htmlPath, pdfPath, epubPath };
}

async function main() {
  console.log('🌍 AIKO - Generating All Translations\n');
  console.log('Languages: Spanish, German, Japanese, French, Portuguese\n');

  const results = {};

  for (const [langKey, translation] of Object.entries(translations)) {
    results[langKey] = await generateVersion(langKey, translation);
  }

  console.log('\n\n✅ ALL TRANSLATIONS COMPLETE!\n');
  console.log('Generated files:');
  for (const [lang, files] of Object.entries(results)) {
    console.log(`  📚 ${lang.toUpperCase()}: PDF + ePub ready`);
  }

  return results;
}

main().catch(console.error);
