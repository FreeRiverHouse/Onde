const Epub = require('epub-gen');
const path = require('path');
const fs = require('fs');

const imagesDir = path.join(__dirname, 'images');

// Helper function to create base64 data URI for images
function getImageDataUri(imageName) {
  const imagePath = path.join(imagesDir, imageName);
  const imageBuffer = fs.readFileSync(imagePath);
  return `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
}

const translations = {
  es: {
    title: 'La Promesa del Pastor',
    subtitle: 'Salmo 23: Una Historia de Abundancia y Confianza',
    author: 'Gianni Parola',
    illustrator: 'Pina Pennello',
    description: 'Una hermosa adaptación del Salmo 23 para niños, con ilustraciones encantadoras que enseñan sobre la abundancia, la gratitud y el amor de Dios.',
    chapters: [
      {
        title: 'Dedicatoria',
        data: `
          <div style="text-align: center; padding: 2em;">
            <p style="font-style: italic; font-size: 1.2em; color: #5a7a5a; line-height: 2;">
              Para cada niño que sueña en grande,<br>
              sabe que el universo siempre te escucha,<br>
              y todo lo que necesitas<br>
              ya está en camino hacia ti.
            </p>
          </div>
        `
      },
      {
        title: 'Capítulo 1: Todo Lo Que Necesitas',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('01-pastore.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>Hay un buen pastor que te cuida,<br>
            el amigo más amable que conocerás.<br>
            Él conoce tu corazón y todos tus sueños.</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "Siempre tendrás suficiente," dice,<br>
            "Todo lo que necesitas ya está aquí.<br>
            Solo cree, y lo verás."
            </p>
            <p>Las ovejitas sonrieron y se sintieron tan ligeras,<br>
            porque sabían: siempre hay suficiente.<br>
            Siempre suficiente amor. Siempre suficiente alegría.</p>
          </div>
        `
      },
      {
        title: 'Capítulo 2: El Regalo del Momento',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('02-acque-tranquille.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>El pastor los llevó a un lugar mágico:<br>
            suaves prados verdes, arroyos brillantes,<br>
            donde cada flor susurraba "gracias".</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "Detente y siente lo bueno que es esto," dijo,<br>
            "Cuando estás agradecido por lo que tienes,<br>
            más cosas buenas vienen hacia ti."
            </p>
            <p>Las ovejitas respiraron profundamente y sonrieron.<br>
            Notaron el sol cálido, la brisa fresca.<br>
            "Gracias, gracias, gracias," cantaron.</p>
          </div>
        `
      },
      {
        title: 'Capítulo 3: Confía en el Camino',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('03-sentieri.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>A veces el camino adelante parecía confuso,<br>
            girando y dando vueltas, difícil de ver.</p>
            <p>Pero el pastor sonrió y dijo:</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "No necesitas conocer todo el camino.<br>
            Solo da el siguiente paso.<br>
            Te llevaré a lugares maravillosos<br>
            que aún no puedes imaginar."
            </p>
            <p>Y las ovejitas aprendieron a confiar,<br>
            sabiendo que vendrían cosas buenas.</p>
          </div>
        `
      },
      {
        title: 'Capítulo 4: El Amor Es Más Fuerte Que el Miedo',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('04-valle-oscura.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>Un día llegaron a un valle de sombras,<br>
            donde el miedo susurraba cosas inquietantes.</p>
            <p>Pero la voz del pastor era tranquila y clara:</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "El miedo es solo una sombra - no puede hacerte daño.<br>
            Cuando eliges el amor en lugar del miedo,<br>
            las sombras desaparecen.<br>
            Siempre estoy contigo."
            </p>
            <p>Las ovejitas eligieron el amor, y de repente<br>
            el valle no parecía tan oscuro.</p>
          </div>
        `
      },
      {
        title: 'Capítulo 5: Más de Lo Que Pediste',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('05-tavola.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>¡Entonces sucedió algo maravilloso!<br>
            El pastor preparó un gran banquete<br>
            con más cosas deliciosas<br>
            de las que podrían comer.</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "Así es como funciona la vida," dijo alegremente,<br>
            "Cuando crees y estás agradecido,<br>
            no solo obtienes lo que necesitas -<br>
            ¡obtienes más! ¡Tu copa rebosa!"
            </p>
            <p>Las ovejitas rieron de alegría.<br>
            ¡Había tanta abundancia para compartir!</p>
          </div>
        `
      },
      {
        title: 'Capítulo 6: Ya Perteneces',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('06-casa-signore.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>Y así, día tras día,<br>
            el pastor los llevó a casa -<br>
            un hermoso hogar de luz y amor.</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "No tienes que ganar tu lugar," dijo,<br>
            "Ya perteneces aquí.<br>
            La bondad y el amor te seguirán<br>
            todos los días de tu vida."
            </p>
            <p>Y las ovejitas entendieron:<br>
            Siempre fueron amadas, siempre seguras,<br>
            y todo lo que necesitaban<br>
            ya era suyo.</p>
          </div>
        `
      },
      {
        title: 'Salmo 23',
        data: `
          <div style="text-align: center; padding: 2em;">
            <p style="line-height: 2.2; color: #555;">
              El Señor es mi pastor, nada me falta.<br><br>
              En verdes praderas me hace descansar<br>
              y me conduce hacia fuentes tranquilas.<br><br>
              Él restaura mi alma.<br>
              Me guía por senderos de justicia<br>
              por amor de su nombre.<br><br>
              Aunque camine por valles de sombra de muerte,<br>
              no temeré ningún mal, porque tú estás conmigo.<br><br>
              Tu vara y tu cayado<br>
              me infunden confianza.<br><br>
              Preparas ante mí una mesa<br>
              en presencia de mis enemigos.<br><br>
              Unges mi cabeza con aceite<br>
              y mi copa rebosa.<br><br>
              El bien y la misericordia me acompañarán<br>
              todos los días de mi vida,<br>
              y habitaré en la casa del Señor<br>
              por siempre.
            </p>
          </div>
        `
      }
    ]
  },
  fr: {
    title: 'La Promesse du Berger',
    subtitle: 'Psaume 23: Une Histoire d\'Abondance et de Confiance',
    author: 'Gianni Parola',
    illustrator: 'Pina Pennello',
    description: 'Une belle adaptation du Psaume 23 pour les enfants, avec de charmantes illustrations.',
    chapters: [
      {
        title: 'Dédicace',
        data: `
          <div style="text-align: center; padding: 2em;">
            <p style="font-style: italic; font-size: 1.2em; color: #5a7a5a; line-height: 2;">
              Pour chaque enfant qui rêve grand,<br>
              sache que l'univers t'écoute toujours,<br>
              et tout ce dont tu as besoin<br>
              est déjà en chemin vers toi.
            </p>
          </div>
        `
      },
      {
        title: 'Chapitre 1: Tout Ce Dont Tu As Besoin',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('01-pastore.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>Il y a un bon berger qui veille sur toi,<br>
            l'ami le plus gentil que tu connaîtras.<br>
            Il connaît ton cœur et tous tes rêves.</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "Tu auras toujours assez," dit-il,<br>
            "Tout ce dont tu as besoin est déjà là.<br>
            Crois seulement, et tu le verras."
            </p>
            <p>Les petits moutons sourirent et se sentirent si légers,<br>
            car ils savaient: il y a toujours assez.<br>
            Toujours assez d'amour. Toujours assez de joie.</p>
          </div>
        `
      },
      {
        title: 'Chapitre 2: Le Cadeau du Moment',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('02-acque-tranquille.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>Le berger les emmena dans un endroit magique:<br>
            de doux prés verts, des ruisseaux scintillants,<br>
            où chaque fleur murmurait "merci".</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "Arrête-toi et ressens combien c'est bon," dit-il,<br>
            "Quand tu es reconnaissant pour ce que tu as,<br>
            plus de bonnes choses viennent à toi."
            </p>
            <p>Les petits moutons respirèrent profondément et sourirent.<br>
            Ils remarquèrent le soleil chaud, la brise fraîche.<br>
            "Merci, merci, merci," chantèrent-ils.</p>
          </div>
        `
      },
      {
        title: 'Chapitre 3: Fais Confiance au Chemin',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('03-sentieri.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>Parfois le chemin devant semblait confus,<br>
            tournant et serpentant, difficile à voir.</p>
            <p>Mais le berger sourit et dit:</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "Tu n'as pas besoin de connaître tout le chemin.<br>
            Fais juste le prochain pas.<br>
            Je te mènerai à des endroits merveilleux<br>
            que tu ne peux pas encore imaginer."
            </p>
            <p>Et les petits moutons apprirent à faire confiance,<br>
            sachant que de bonnes choses viendraient.</p>
          </div>
        `
      },
      {
        title: 'Chapitre 4: L\'Amour Est Plus Fort Que la Peur',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('04-valle-oscura.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>Un jour ils arrivèrent dans une vallée d'ombres,<br>
            où la peur chuchotait des choses inquiétantes.</p>
            <p>Mais la voix du berger était calme et claire:</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "La peur n'est qu'une ombre - elle ne peut pas te faire de mal.<br>
            Quand tu choisis l'amour au lieu de la peur,<br>
            les ombres disparaissent.<br>
            Je suis toujours avec toi."
            </p>
            <p>Les petits moutons choisirent l'amour, et soudain<br>
            la vallée ne semblait plus si sombre.</p>
          </div>
        `
      },
      {
        title: 'Chapitre 5: Plus Que Ce Que Tu As Demandé',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('05-tavola.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>Puis quelque chose de merveilleux se produisit!<br>
            Le berger prépara un grand festin<br>
            avec plus de délices<br>
            qu'ils ne pourraient jamais manger.</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "C'est ainsi que fonctionne la vie," dit-il joyeusement,<br>
            "Quand tu crois et que tu es reconnaissant,<br>
            tu n'obtiens pas seulement ce dont tu as besoin -<br>
            tu obtiens plus! Ta coupe déborde!"
            </p>
            <p>Les petits moutons rirent de joie.<br>
            Il y avait tant d'abondance à partager!</p>
          </div>
        `
      },
      {
        title: 'Chapitre 6: Tu Appartiens Déjà',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('06-casa-signore.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>Et ainsi, jour après jour,<br>
            le berger les ramena à la maison -<br>
            une belle maison de lumière et d'amour.</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "Tu n'as pas à gagner ta place," dit-il,<br>
            "Tu appartiens déjà ici.<br>
            La bonté et l'amour te suivront<br>
            tous les jours de ta vie."
            </p>
            <p>Et les petits moutons comprirent:<br>
            Ils étaient toujours aimés, toujours en sécurité,<br>
            et tout ce dont ils avaient besoin<br>
            était déjà à eux.</p>
          </div>
        `
      },
      {
        title: 'Psaume 23',
        data: `
          <div style="text-align: center; padding: 2em;">
            <p style="line-height: 2.2; color: #555;">
              L'Éternel est mon berger, je ne manquerai de rien.<br><br>
              Il me fait reposer dans de verts pâturages<br>
              et me conduit près des eaux paisibles.<br><br>
              Il restaure mon âme.<br>
              Il me guide dans les sentiers de la justice<br>
              à cause de son nom.<br><br>
              Même si je marche dans la vallée de l'ombre de la mort,<br>
              je ne craindrai aucun mal, car tu es avec moi.<br><br>
              Ta houlette et ton bâton<br>
              me rassurent.<br><br>
              Tu dresses devant moi une table<br>
              en face de mes adversaires.<br><br>
              Tu oins ma tête d'huile<br>
              et ma coupe déborde.<br><br>
              Oui, la bonté et la grâce m'accompagneront<br>
              tous les jours de ma vie,<br>
              et j'habiterai dans la maison de l'Éternel<br>
              pour toujours.
            </p>
          </div>
        `
      }
    ]
  },
  de: {
    title: 'Das Versprechen des Hirten',
    subtitle: 'Psalm 23: Eine Geschichte von Fülle und Vertrauen',
    author: 'Gianni Parola',
    illustrator: 'Pina Pennello',
    description: 'Eine wunderschöne Adaption des Psalm 23 für Kinder.',
    chapters: [
      {
        title: 'Widmung',
        data: `
          <div style="text-align: center; padding: 2em;">
            <p style="font-style: italic; font-size: 1.2em; color: #5a7a5a; line-height: 2;">
              Für jedes Kind, das groß träumt,<br>
              wisse, dass das Universum dir immer zuhört,<br>
              und alles, was du brauchst,<br>
              ist bereits auf dem Weg zu dir.
            </p>
          </div>
        `
      },
      {
        title: 'Kapitel 1: Alles, Was Du Brauchst',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('01-pastore.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>Es gibt einen guten Hirten, der über dich wacht,<br>
            den freundlichsten Freund, den du je kennen wirst.<br>
            Er kennt dein Herz und alle deine Träume.</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "Du wirst immer genug haben," sagt er,<br>
            "Alles, was du brauchst, ist bereits hier.<br>
            Glaube nur, und du wirst es sehen."
            </p>
            <p>Die kleinen Schafe lächelten und fühlten sich so leicht,<br>
            denn sie wussten: Es gibt immer genug.<br>
            Immer genug Liebe. Immer genug Freude.</p>
          </div>
        `
      },
      {
        title: 'Kapitel 2: Das Geschenk des Augenblicks',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('02-acque-tranquille.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>Der Hirte führte sie an einen magischen Ort:<br>
            weiche grüne Wiesen, funkelnde Bäche,<br>
            wo jede Blume "danke" flüsterte.</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "Halte inne und fühle, wie gut das ist," sagte er,<br>
            "Wenn du dankbar bist für das, was du hast,<br>
            kommen noch mehr gute Dinge zu dir."
            </p>
            <p>Die kleinen Schafe atmeten tief ein und lächelten.<br>
            Sie bemerkten die warme Sonne, die frische Brise.<br>
            "Danke, danke, danke," sangen sie.</p>
          </div>
        `
      },
      {
        title: 'Kapitel 3: Vertraue dem Weg',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('03-sentieri.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>Manchmal sah der Weg voraus verwirrend aus,<br>
            sich windend und drehend, schwer zu sehen.</p>
            <p>Aber der Hirte lächelte und sagte:</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "Du musst nicht den ganzen Weg kennen.<br>
            Mach einfach den nächsten Schritt.<br>
            Ich werde dich zu wunderbaren Orten führen,<br>
            die du dir noch nicht vorstellen kannst."
            </p>
            <p>Und die kleinen Schafe lernten zu vertrauen,<br>
            wissend, dass gute Dinge kommen würden.</p>
          </div>
        `
      },
      {
        title: 'Kapitel 4: Liebe ist Stärker als Angst',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('04-valle-oscura.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>Eines Tages kamen sie in ein Tal der Schatten,<br>
            wo die Angst beunruhigende Dinge flüsterte.</p>
            <p>Aber die Stimme des Hirten war ruhig und klar:</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "Angst ist nur ein Schatten - sie kann dir nicht schaden.<br>
            Wenn du Liebe statt Angst wählst,<br>
            verschwinden die Schatten.<br>
            Ich bin immer bei dir."
            </p>
            <p>Die kleinen Schafe wählten die Liebe, und plötzlich<br>
            schien das Tal nicht mehr so dunkel.</p>
          </div>
        `
      },
      {
        title: 'Kapitel 5: Mehr als Du Erbeten Hast',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('05-tavola.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>Dann geschah etwas Wunderbares!<br>
            Der Hirte bereitete ein großes Festmahl<br>
            mit mehr köstlichen Dingen,<br>
            als sie jemals essen könnten.</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "So funktioniert das Leben," sagte er freudig,<br>
            "Wenn du glaubst und dankbar bist,<br>
            bekommst du nicht nur, was du brauchst -<br>
            du bekommst mehr! Dein Becher läuft über!"
            </p>
            <p>Die kleinen Schafe lachten vor Freude.<br>
            Es gab so viel Fülle zu teilen!</p>
          </div>
        `
      },
      {
        title: 'Kapitel 6: Du Gehörst Bereits Dazu',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('06-casa-signore.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>Und so, Tag für Tag,<br>
            führte der Hirte sie nach Hause -<br>
            ein wunderschönes Zuhause aus Licht und Liebe.</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "Du musst dir deinen Platz nicht verdienen," sagte er,<br>
            "Du gehörst bereits hierher.<br>
            Güte und Liebe werden dir folgen<br>
            alle Tage deines Lebens."
            </p>
            <p>Und die kleinen Schafe verstanden:<br>
            Sie waren immer geliebt, immer sicher,<br>
            und alles, was sie jemals brauchten,<br>
            gehörte ihnen bereits.</p>
          </div>
        `
      },
      {
        title: 'Psalm 23',
        data: `
          <div style="text-align: center; padding: 2em;">
            <p style="line-height: 2.2; color: #555;">
              Der Herr ist mein Hirte, mir wird nichts mangeln.<br><br>
              Er weidet mich auf einer grünen Aue<br>
              und führet mich zum frischen Wasser.<br><br>
              Er erquicket meine Seele.<br>
              Er führet mich auf rechter Straße<br>
              um seines Namens willen.<br><br>
              Und ob ich schon wanderte im finstern Tal,<br>
              fürchte ich kein Unglück; denn du bist bei mir.<br><br>
              Dein Stecken und Stab<br>
              trösten mich.<br><br>
              Du bereitest vor mir einen Tisch<br>
              im Angesicht meiner Feinde.<br><br>
              Du salbest mein Haupt mit Öl<br>
              und schenkest mir voll ein.<br><br>
              Gutes und Barmherzigkeit werden mir folgen<br>
              mein Leben lang,<br>
              und ich werde bleiben im Hause des Herrn<br>
              immerdar.
            </p>
          </div>
        `
      }
    ]
  },
  ko: {
    title: '목자의 약속',
    subtitle: '시편 23편: 풍요와 신뢰의 이야기',
    author: 'Gianni Parola',
    illustrator: 'Pina Pennello',
    description: '어린이를 위한 시편 23편의 아름다운 각색.',
    chapters: [
      {
        title: '헌정',
        data: `
          <div style="text-align: center; padding: 2em;">
            <p style="font-style: italic; font-size: 1.2em; color: #5a7a5a; line-height: 2;">
              크게 꿈꾸는 모든 어린이에게,<br>
              우주가 항상 너의 말을 듣고 있다는 걸 알아,<br>
              그리고 네가 필요한 모든 것은<br>
              이미 너에게 오고 있단다.
            </p>
          </div>
        `
      },
      {
        title: '1장: 필요한 모든 것',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('01-pastore.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>너를 돌봐주는 착한 목자가 있어,<br>
            네가 만날 가장 친절한 친구야.<br>
            그는 네 마음과 모든 꿈을 알고 있단다.</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "너는 항상 충분히 가질 거야," 그가 말해,<br>
            "네가 필요한 모든 것은 이미 여기 있어.<br>
            믿기만 해, 그러면 보게 될 거야."
            </p>
            <p>작은 양들은 미소 지으며 아주 가벼워졌어,<br>
            왜냐하면 알았거든: 항상 충분해.<br>
            항상 충분한 사랑. 항상 충분한 기쁨.</p>
          </div>
        `
      },
      {
        title: '2장: 순간의 선물',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('02-acque-tranquille.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>목자는 그들을 마법 같은 곳으로 데려갔어:<br>
            부드러운 초록 목초지, 반짝이는 시냇물,<br>
            모든 꽃이 "감사해요"라고 속삭이는 곳.</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "멈추고 이게 얼마나 좋은지 느껴봐," 그가 말해,<br>
            "가진 것에 감사하면,<br>
            더 좋은 것들이 너에게 올 거야."
            </p>
            <p>작은 양들은 깊이 숨을 쉬며 미소 지었어.<br>
            따뜻한 햇살, 시원한 바람을 느꼈지.<br>
            "감사해요, 감사해요, 감사해요," 그들이 노래했어.</p>
          </div>
        `
      },
      {
        title: '3장: 길을 믿어요',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('03-sentieri.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>때때로 앞의 길이 혼란스러워 보였어,<br>
            구불구불, 보기 어려웠지.</p>
            <p>하지만 목자는 미소 지으며 말했어:</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "전체 길을 알 필요 없어.<br>
            그냥 다음 발걸음만 내딛어.<br>
            내가 너를 아직 상상할 수 없는<br>
            놀라운 곳으로 데려갈 거야."
            </p>
            <p>그리고 작은 양들은 믿는 것을 배웠어,<br>
            좋은 일이 올 거라는 걸 알면서.</p>
          </div>
        `
      },
      {
        title: '4장: 사랑은 두려움보다 강해요',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('04-valle-oscura.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>어느 날 그들은 그림자의 골짜기에 도착했어,<br>
            두려움이 불안한 것들을 속삭이는 곳.</p>
            <p>하지만 목자의 목소리는 차분하고 명확했어:</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "두려움은 그냥 그림자야 - 너를 해칠 수 없어.<br>
            두려움 대신 사랑을 선택하면,<br>
            그림자는 사라져.<br>
            나는 항상 너와 함께야."
            </p>
            <p>작은 양들은 사랑을 선택했고, 갑자기<br>
            골짜기가 더 이상 그렇게 어둡지 않았어.</p>
          </div>
        `
      },
      {
        title: '5장: 요청한 것보다 더',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('05-tavola.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>그때 놀라운 일이 일어났어!<br>
            목자가 큰 잔치를 준비했어<br>
            그들이 먹을 수 있는 것보다<br>
            더 많은 맛있는 것들로.</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "이게 삶이 작동하는 방식이야," 그가 기쁘게 말해,<br>
            "믿고 감사하면,<br>
            필요한 것만 얻는 게 아니라 -<br>
            더 많이 얻어! 네 잔이 넘쳐!"
            </p>
            <p>작은 양들은 기쁨으로 웃었어.<br>
            나눌 풍요가 너무 많았어!</p>
          </div>
        `
      },
      {
        title: '6장: 이미 속해 있어요',
        data: `
          <div style="text-align: center;">
            <img src="${getImageDataUri('06-casa-signore.jpg')}" style="max-width: 100%; border-radius: 10px;"/>
            <p>그리고 날마다,<br>
            목자는 그들을 집으로 데려갔어 -<br>
            빛과 사랑의 아름다운 집.</p>
            <p style="font-style: italic; color: #7a6030; padding: 1em; border-left: 4px solid #d4a855;">
            "네 자리를 얻을 필요 없어," 그가 말해,<br>
            "너는 이미 여기 속해 있어.<br>
            선함과 사랑이 너를 따를 거야<br>
            네 평생 동안."
            </p>
            <p>그리고 작은 양들은 이해했어:<br>
            그들은 항상 사랑받고, 항상 안전했고,<br>
            그들이 필요한 모든 것은<br>
            이미 그들의 것이었어.</p>
          </div>
        `
      },
      {
        title: '시편 23편',
        data: `
          <div style="text-align: center; padding: 2em;">
            <p style="line-height: 2.2; color: #555;">
              여호와는 나의 목자시니 내게 부족함이 없으리로다.<br><br>
              그가 나를 푸른 초장에 누이시며<br>
              쉴 만한 물 가로 인도하시는도다.<br><br>
              내 영혼을 소생시키시고<br>
              자기 이름을 위하여<br>
              의의 길로 인도하시는도다.<br><br>
              내가 사망의 음침한 골짜기로 다닐지라도<br>
              해를 두려워하지 않을 것은 주께서 나와 함께 하심이라.<br><br>
              주의 지팡이와 막대기가<br>
              나를 안위하시나이다.<br><br>
              주께서 내 원수의 목전에서<br>
              내게 상을 베푸시고<br><br>
              내 머리에 기름을 부으셨으니<br>
              내 잔이 넘치나이다.<br><br>
              내 평생에 선하심과 인자하심이<br>
              반드시 나를 따르리니<br>
              내가 여호와의 집에<br>
              영원히 거하리로다.
            </p>
          </div>
        `
      }
    ]
  }
};

async function createEPUB(lang) {
  const book = translations[lang];
  const epubPath = path.join(__dirname, `psalm-23-abundance-${lang}.epub`);
  const coverPath = path.join(imagesDir, '00-copertina.jpg');

  const options = {
    title: book.title,
    author: book.author,
    publisher: 'Onde Publishing',
    cover: coverPath,
    content: book.chapters,
    css: `
      body {
        font-family: Georgia, serif;
        line-height: 1.8;
        text-align: center;
        padding: 1em;
      }
      img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 1em auto;
        border-radius: 10px;
      }
      p { margin: 1em 0; }
    `,
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

async function createAllEPUBs() {
  console.log('Creating EPUBs for all translations...\n');

  for (const lang of Object.keys(translations)) {
    try {
      await createEPUB(lang);
    } catch (err) {
      console.error(`Failed ${lang}`);
    }
  }

  console.log('\nDone!');
}

createAllEPUBs();
