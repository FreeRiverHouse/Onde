const Epub = require('epub-gen');
const path = require('path');

const translations = {
  es: {
    title: 'La Promesa del Pastor',
    author: 'Gianni Parola',
    chapters: [
      { title: 'Dedicatoria', data: '<div style="text-align:center;padding:2em;font-style:italic;color:#5a7a5a;line-height:2;">Para cada niño que sueña en grande,<br>sabe que el universo siempre te escucha,<br>y todo lo que necesitas<br>ya está en camino hacia ti.</div>' },
      { title: 'Capítulo 1: Todo Lo Que Necesitas', data: '<p>Hay un buen pastor que te cuida,<br>el amigo más amable que conocerás.<br>Él conoce tu corazón y todos tus sueños.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"Siempre tendrás suficiente," dice,<br>"Todo lo que necesitas ya está aquí.<br>Solo cree, y lo verás."</p><p>Las ovejitas sonrieron y se sintieron tan ligeras,<br>porque sabían: siempre hay suficiente.<br>Siempre suficiente amor. Siempre suficiente alegría.</p>' },
      { title: 'Capítulo 2: El Regalo del Momento', data: '<p>El pastor los llevó a un lugar mágico:<br>suaves prados verdes, arroyos brillantes,<br>donde cada flor susurraba "gracias".</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"Detente y siente lo bueno que es esto," dijo,<br>"Cuando estás agradecido por lo que tienes,<br>más cosas buenas vienen hacia ti."</p><p>Las ovejitas respiraron profundamente y sonrieron.<br>Notaron el sol cálido, la brisa fresca.<br>"Gracias, gracias, gracias," cantaron.</p>' },
      { title: 'Capítulo 3: Confía en el Camino', data: '<p>A veces el camino adelante parecía confuso,<br>girando y dando vueltas, difícil de ver.</p><p>Pero el pastor sonrió y dijo:</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"No necesitas conocer todo el camino.<br>Solo da el siguiente paso.<br>Te llevaré a lugares maravillosos<br>que aún no puedes imaginar."</p><p>Y las ovejitas aprendieron a confiar,<br>sabiendo que vendrían cosas buenas.</p>' },
      { title: 'Capítulo 4: El Amor Es Más Fuerte Que el Miedo', data: '<p>Un día llegaron a un valle de sombras,<br>donde el miedo susurraba cosas inquietantes.</p><p>Pero la voz del pastor era tranquila y clara:</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"El miedo es solo una sombra - no puede hacerte daño.<br>Cuando eliges el amor en lugar del miedo,<br>las sombras desaparecen.<br>Siempre estoy contigo."</p><p>Las ovejitas eligieron el amor, y de repente<br>el valle no parecía tan oscuro.</p>' },
      { title: 'Capítulo 5: Más de Lo Que Pediste', data: '<p>¡Entonces sucedió algo maravilloso!<br>El pastor preparó un gran banquete<br>con más cosas deliciosas<br>de las que podrían comer.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"Así es como funciona la vida," dijo alegremente,<br>"Cuando crees y estás agradecido,<br>no solo obtienes lo que necesitas -<br>¡obtienes más! ¡Tu copa rebosa!"</p><p>Las ovejitas rieron de alegría.<br>¡Había tanta abundancia para compartir!</p>' },
      { title: 'Capítulo 6: Ya Perteneces', data: '<p>Y así, día tras día,<br>el pastor los llevó a casa -<br>un hermoso hogar de luz y amor.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"No tienes que ganar tu lugar," dijo,<br>"Ya perteneces aquí.<br>La bondad y el amor te seguirán<br>todos los días de tu vida."</p><p>Y las ovejitas entendieron:<br>Siempre fueron amadas, siempre seguras,<br>y todo lo que necesitaban<br>ya era suyo.</p>' },
      { title: 'Salmo 23', data: '<div style="text-align:center;padding:2em;line-height:2.2;color:#555;">El Señor es mi pastor, nada me falta.<br><br>En verdes praderas me hace descansar<br>y me conduce hacia fuentes tranquilas.<br><br>Él restaura mi alma.<br>Me guía por senderos de justicia<br>por amor de su nombre.<br><br>Aunque camine por valles de sombra de muerte,<br>no temeré ningún mal, porque tú estás conmigo.<br><br>Tu vara y tu cayado me infunden confianza.<br><br>Preparas ante mí una mesa<br>en presencia de mis enemigos.<br><br>Unges mi cabeza con aceite<br>y mi copa rebosa.<br><br>El bien y la misericordia me acompañarán<br>todos los días de mi vida,<br>y habitaré en la casa del Señor por siempre.</div>' }
    ]
  },
  fr: {
    title: 'La Promesse du Berger',
    author: 'Gianni Parola',
    chapters: [
      { title: 'Dédicace', data: '<div style="text-align:center;padding:2em;font-style:italic;color:#5a7a5a;line-height:2;">Pour chaque enfant qui rêve grand,<br>sache que l\'univers t\'écoute toujours,<br>et tout ce dont tu as besoin<br>est déjà en chemin vers toi.</div>' },
      { title: 'Chapitre 1: Tout Ce Dont Tu As Besoin', data: '<p>Il y a un bon berger qui veille sur toi,<br>l\'ami le plus gentil que tu connaîtras.<br>Il connaît ton cœur et tous tes rêves.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"Tu auras toujours assez," dit-il,<br>"Tout ce dont tu as besoin est déjà là.<br>Crois seulement, et tu le verras."</p><p>Les petits moutons sourirent et se sentirent si légers,<br>car ils savaient: il y a toujours assez.</p>' },
      { title: 'Chapitre 2: Le Cadeau du Moment', data: '<p>Le berger les emmena dans un endroit magique:<br>de doux prés verts, des ruisseaux scintillants,<br>où chaque fleur murmurait "merci".</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"Arrête-toi et ressens combien c\'est bon," dit-il,<br>"Quand tu es reconnaissant pour ce que tu as,<br>plus de bonnes choses viennent à toi."</p>' },
      { title: 'Chapitre 3: Fais Confiance au Chemin', data: '<p>Parfois le chemin devant semblait confus,<br>tournant et serpentant, difficile à voir.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"Tu n\'as pas besoin de connaître tout le chemin.<br>Fais juste le prochain pas."</p>' },
      { title: 'Chapitre 4: L\'Amour Est Plus Fort Que la Peur', data: '<p>Un jour ils arrivèrent dans une vallée d\'ombres.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"La peur n\'est qu\'une ombre - elle ne peut pas te faire de mal.<br>Quand tu choisis l\'amour au lieu de la peur,<br>les ombres disparaissent."</p>' },
      { title: 'Chapitre 5: Plus Que Ce Que Tu As Demandé', data: '<p>Puis quelque chose de merveilleux se produisit!<br>Le berger prépara un grand festin.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"C\'est ainsi que fonctionne la vie," dit-il,<br>"Quand tu crois et que tu es reconnaissant,<br>tu obtiens plus! Ta coupe déborde!"</p>' },
      { title: 'Chapitre 6: Tu Appartiens Déjà', data: '<p>Et ainsi, jour après jour,<br>le berger les ramena à la maison.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"Tu n\'as pas à gagner ta place," dit-il,<br>"Tu appartiens déjà ici."</p>' },
      { title: 'Psaume 23', data: '<div style="text-align:center;padding:2em;line-height:2.2;color:#555;">L\'Éternel est mon berger, je ne manquerai de rien.<br><br>Il me fait reposer dans de verts pâturages<br>et me conduit près des eaux paisibles.<br><br>Il restaure mon âme.<br>Il me guide dans les sentiers de la justice<br>à cause de son nom.</div>' }
    ]
  },
  de: {
    title: 'Das Versprechen des Hirten',
    author: 'Gianni Parola',
    chapters: [
      { title: 'Widmung', data: '<div style="text-align:center;padding:2em;font-style:italic;color:#5a7a5a;line-height:2;">Für jedes Kind, das groß träumt,<br>wisse, dass das Universum dir immer zuhört,<br>und alles, was du brauchst,<br>ist bereits auf dem Weg zu dir.</div>' },
      { title: 'Kapitel 1: Alles, Was Du Brauchst', data: '<p>Es gibt einen guten Hirten, der über dich wacht,<br>den freundlichsten Freund, den du je kennen wirst.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"Du wirst immer genug haben," sagt er,<br>"Alles, was du brauchst, ist bereits hier."</p>' },
      { title: 'Kapitel 2: Das Geschenk des Augenblicks', data: '<p>Der Hirte führte sie an einen magischen Ort:<br>weiche grüne Wiesen, funkelnde Bäche.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"Halte inne und fühle, wie gut das ist," sagte er.</p>' },
      { title: 'Kapitel 3: Vertraue dem Weg', data: '<p>Manchmal sah der Weg voraus verwirrend aus.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"Du musst nicht den ganzen Weg kennen.<br>Mach einfach den nächsten Schritt."</p>' },
      { title: 'Kapitel 4: Liebe ist Stärker als Angst', data: '<p>Eines Tages kamen sie in ein Tal der Schatten.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"Angst ist nur ein Schatten - sie kann dir nicht schaden."</p>' },
      { title: 'Kapitel 5: Mehr als Du Erbeten Hast', data: '<p>Dann geschah etwas Wunderbares!</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"So funktioniert das Leben," sagte er,<br>"Dein Becher läuft über!"</p>' },
      { title: 'Kapitel 6: Du Gehörst Bereits Dazu', data: '<p>Und so, Tag für Tag,<br>führte der Hirte sie nach Hause.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"Du gehörst bereits hierher."</p>' },
      { title: 'Psalm 23', data: '<div style="text-align:center;padding:2em;line-height:2.2;color:#555;">Der Herr ist mein Hirte, mir wird nichts mangeln.<br><br>Er weidet mich auf einer grünen Aue<br>und führet mich zum frischen Wasser.</div>' }
    ]
  },
  ko: {
    title: '목자의 약속',
    author: 'Gianni Parola',
    chapters: [
      { title: '헌정', data: '<div style="text-align:center;padding:2em;font-style:italic;color:#5a7a5a;line-height:2;">크게 꿈꾸는 모든 어린이에게,<br>우주가 항상 너의 말을 듣고 있다는 걸 알아,<br>그리고 네가 필요한 모든 것은<br>이미 너에게 오고 있단다.</div>' },
      { title: '1장: 필요한 모든 것', data: '<p>너를 돌봐주는 착한 목자가 있어,<br>네가 만날 가장 친절한 친구야.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"너는 항상 충분히 가질 거야," 그가 말해,<br>"네가 필요한 모든 것은 이미 여기 있어."</p>' },
      { title: '2장: 순간의 선물', data: '<p>목자는 그들을 마법 같은 곳으로 데려갔어.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"멈추고 이게 얼마나 좋은지 느껴봐," 그가 말해.</p>' },
      { title: '3장: 길을 믿어요', data: '<p>때때로 앞의 길이 혼란스러워 보였어.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"전체 길을 알 필요 없어.<br>그냥 다음 발걸음만 내딛어."</p>' },
      { title: '4장: 사랑은 두려움보다 강해요', data: '<p>어느 날 그들은 그림자의 골짜기에 도착했어.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"두려움은 그냥 그림자야 - 너를 해칠 수 없어."</p>' },
      { title: '5장: 요청한 것보다 더', data: '<p>그때 놀라운 일이 일어났어!</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"이게 삶이 작동하는 방식이야," 그가 말해,<br>"네 잔이 넘쳐!"</p>' },
      { title: '6장: 이미 속해 있어요', data: '<p>그리고 날마다,<br>목자는 그들을 집으로 데려갔어.</p><p style="font-style:italic;color:#7a6030;padding:1em;border-left:4px solid #d4a855;">"너는 이미 여기 속해 있어."</p>' },
      { title: '시편 23편', data: '<div style="text-align:center;padding:2em;line-height:2.2;color:#555;">여호와는 나의 목자시니 내게 부족함이 없으리로다.<br><br>그가 나를 푸른 초장에 누이시며<br>쉴 만한 물 가로 인도하시는도다.</div>' }
    ]
  }
};

async function createEPUB(lang) {
  const book = translations[lang];
  const epubPath = path.join(__dirname, `psalm-23-abundance-${lang}.epub`);
  const coverPath = path.join(__dirname, 'images', '00-copertina.jpg');

  const options = {
    title: book.title,
    author: book.author,
    publisher: 'Onde Publishing',
    cover: coverPath,
    content: book.chapters,
    css: `body { font-family: Georgia, serif; line-height: 1.8; text-align: center; padding: 1em; } p { margin: 1em 0; }`,
    verbose: false
  };

  return new Promise((resolve, reject) => {
    new Epub(options, epubPath).promise
      .then(() => {
        console.log(`Created: ${book.title} (${lang}) -> ${epubPath}`);
        resolve();
      })
      .catch(err => {
        console.error(`Error creating ${lang}:`, err.message);
        reject(err);
      });
  });
}

async function main() {
  console.log('Creating EPUBs...\n');
  for (const lang of Object.keys(translations)) {
    try {
      await createEPUB(lang);
    } catch (err) {
      console.error(`Failed ${lang}`);
    }
  }
  console.log('\nDone!');
}

main();
