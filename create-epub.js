const EPub = require('epub-gen-memory').default;
const fs = require('fs');
const path = require('path');

const bookDir = '/Users/mattiapetrucciani/CascadeProjects/OndePRDB/clients/onde/books/the-shepherds-promise';
const imagesDir = path.join(bookDir, 'images');

// Read image as base64
function getImageBase64(filename) {
    const filepath = path.join(imagesDir, filename);
    const data = fs.readFileSync(filepath);
    return `data:image/jpeg;base64,${data.toString('base64')}`;
}

const italianContent = [
    {
        title: 'Dedica',
        content: `<div style="text-align: center; padding: 50px 20px; font-style: italic;">
            <p style="font-size: 1.2em; line-height: 2;">
                A ogni bambino che sogna in grande:<br>
                sappi che l'universo ti sta ascoltando,<br>
                e tutto ciò di cui hai bisogno<br>
                è già in cammino verso di te.
            </p>
        </div>`
    },
    {
        title: 'Capitolo 1: Tutto ciò di cui hai bisogno',
        content: `<div style="text-align: center;">
            <img src="${getImageBase64('01-pastore.jpg')}" alt="Il pastore gentile accoglie le pecorelle con le braccia aperte in una vallata fiorita" style="max-width: 100%; height: auto;"/>
            <p>C'è un pastore gentile che veglia su di te,<br>
            l'amico più gentile che tu possa mai conoscere.<br>
            Lui conosce il tuo cuore e tutti i tuoi sogni.</p>
            <p style="font-style: italic; border-left: 3px solid #d4a855; padding-left: 15px; margin: 20px 0;">
            "Avrai sempre abbastanza," dice,<br>
            "Tutto ciò di cui hai bisogno è già qui.<br>
            Credi, e vedrai."
            </p>
            <p>Le pecorelle sorrisero e si sentirono leggere,<br>
            perché sapevano: c'è sempre abbastanza.<br>
            Sempre abbastanza amore. Sempre abbastanza gioia.</p>
        </div>`
    },
    {
        title: 'Capitolo 2: Il dono del presente',
        content: `<div style="text-align: center;">
            <img src="${getImageBase64('02-acque-tranquille.jpg')}" alt="Le pecorelle riposano accanto a un ruscello cristallino tra prati verdi" style="max-width: 100%; height: auto;"/>
            <p>Il pastore le condusse in un luogo magico:<br>
            prati verdi e morbidi, ruscelli scintillanti,<br>
            dove ogni fiore sussurrava "grazie."</p>
            <p style="font-style: italic; border-left: 3px solid #d4a855; padding-left: 15px; margin: 20px 0;">
            "Fermati e senti quanto è bello," disse,<br>
            "Quando sei grato per ciò che hai,<br>
            ancora più cose belle arrivano a te."
            </p>
            <p>Le pecorelle respirarono profondamente e sorrisero.<br>
            Notarono il sole caldo, la brezza fresca.<br>
            "Grazie, grazie, grazie," cantarono.</p>
        </div>`
    },
    {
        title: 'Capitolo 3: Fidati del cammino',
        content: `<div style="text-align: center;">
            <img src="${getImageBase64('03-sentieri.jpg')}" alt="Il pastore guida le pecorelle lungo un sentiero che si snoda tra le colline" style="max-width: 100%; height: auto;"/>
            <p>A volte la strada davanti sembrava confusa,<br>
            tortuosa e difficile da vedere.</p>
            <p>Ma il pastore sorrise e disse:</p>
            <p style="font-style: italic; border-left: 3px solid #d4a855; padding-left: 15px; margin: 20px 0;">
            "Non devi conoscere tutta la strada.<br>
            Fai solo il prossimo passo.<br>
            Ti guiderò verso luoghi meravigliosi<br>
            che non puoi ancora nemmeno immaginare."
            </p>
            <p>E le pecorelle impararono a fidarsi,<br>
            sapendo che cose belle stavano arrivando.</p>
        </div>`
    },
    {
        title: "Capitolo 4: L'amore è più forte della paura",
        content: `<div style="text-align: center;">
            <img src="${getImageBase64('04-valle-oscura.jpg')}" alt="Le pecorelle attraversano una valle in ombra, illuminate dalla presenza rassicurante del pastore" style="max-width: 100%; height: auto;"/>
            <p>Un giorno arrivarono in una valle di ombre,<br>
            dove la paura sussurrava cose spaventose.</p>
            <p>Ma la voce del pastore era calma e chiara:</p>
            <p style="font-style: italic; border-left: 3px solid #d4a855; padding-left: 15px; margin: 20px 0;">
            "La paura è solo un'ombra - non può farti del male.<br>
            Quando scegli l'amore invece della paura,<br>
            le ombre scompaiono.<br>
            Io sono sempre con te."
            </p>
            <p>Le pecorelle scelsero l'amore, e all'improvviso<br>
            la valle non sembrava più così buia.</p>
        </div>`
    },
    {
        title: 'Capitolo 5: Più di quanto hai chiesto',
        content: `<div style="text-align: center;">
            <img src="${getImageBase64('05-tavola.jpg')}" alt="Una tavola imbandita con frutta e cibo abbondante sotto un grande albero" style="max-width: 100%; height: auto;"/>
            <p>Poi successe qualcosa di meraviglioso!<br>
            Il pastore preparò una grande festa<br>
            con più cose deliziose<br>
            di quante ne potessero mai mangiare.</p>
            <p style="font-style: italic; border-left: 3px solid #d4a855; padding-left: 15px; margin: 20px 0;">
            "È così che funziona la vita," disse con gioia,<br>
            "Quando credi e sei grato,<br>
            non ricevi solo ciò di cui hai bisogno -<br>
            ricevi di più! La tua coppa trabocca!"
            </p>
            <p>Le pecorelle risero di gioia.<br>
            C'era così tanta abbondanza da condividere!</p>
        </div>`
    },
    {
        title: 'Capitolo 6: Tu appartieni già',
        content: `<div style="text-align: center;">
            <img src="${getImageBase64('06-casa-signore.jpg')}" alt="Una casa luminosa e accogliente avvolta da luce dorata al tramonto" style="max-width: 100%; height: auto;"/>
            <p>E così, giorno dopo giorno,<br>
            il pastore le condusse a casa -<br>
            una casa bellissima fatta di luce e amore.</p>
            <p style="font-style: italic; border-left: 3px solid #d4a855; padding-left: 15px; margin: 20px 0;">
            "Non devi guadagnarti il tuo posto," disse,<br>
            "Tu appartieni già qui.<br>
            Bontà e amore ti seguiranno<br>
            tutti i giorni della tua vita."
            </p>
            <p>E le pecorelle capirono:<br>
            erano sempre amate, sempre al sicuro,<br>
            e tutto ciò di cui avevano bisogno<br>
            era già loro.</p>
        </div>`
    },
    {
        title: 'Salmo 23',
        content: `<div style="text-align: center; font-style: italic; padding: 30px 20px;">
            <h3>Salmo 23</h3>
            <p>Il Signore è il mio pastore: non manco di nulla.</p>
            <p>Su pascoli erbosi mi fa riposare,<br>ad acque tranquille mi conduce.</p>
            <p>Rinfranca l'anima mia,<br>mi guida per il giusto cammino<br>a motivo del suo nome.</p>
            <p>Anche se vado per una valle oscura,<br>non temo alcun male, perché tu sei con me.</p>
            <p>Il tuo bastone e il tuo vincastro<br>mi danno sicurezza.</p>
            <p>Davanti a me tu prepari una mensa<br>sotto gli occhi dei miei nemici.</p>
            <p>Ungi di olio il mio capo;<br>il mio calice trabocca.</p>
            <p>Sì, bontà e fedeltà mi saranno compagne<br>tutti i giorni della mia vita,<br>e abiterò nella casa del Signore<br>per lunghi giorni.</p>
        </div>`
    },
    {
        title: 'Fine',
        content: `<div style="text-align: center; padding: 50px 20px;">
            <p style="font-size: 2em; font-style: italic;">Fine</p>
            <p style="margin-top: 50px;">Testi: Gianni Parola<br>Illustrazioni: Pino Pennello</p>
            <p style="margin-top: 30px; font-weight: bold;">Published by Onde, Free River House</p>
            <p style="color: #999;">Prima Edizione · 2026</p>
        </div>`
    }
];

const englishContent = [
    {
        title: 'Dedication',
        content: `<div style="text-align: center; padding: 50px 20px; font-style: italic;">
            <p style="font-size: 1.2em; line-height: 2;">
                To every child who dreams big,<br>
                know that the universe is always listening,<br>
                and everything you need<br>
                is already on its way to you.
            </p>
        </div>`
    },
    {
        title: 'Chapter 1: Everything you need',
        content: `<div style="text-align: center;">
            <img src="${getImageBase64('01-pastore.jpg')}" alt="The gentle shepherd welcomes the little sheep with open arms in a flowery valley" style="max-width: 100%; height: auto;"/>
            <p>There is a kind shepherd who watches over you,<br>
            the kindest friend you could ever know.<br>
            He knows your heart and all your dreams.</p>
            <p style="font-style: italic; border-left: 3px solid #d4a855; padding-left: 15px; margin: 20px 0;">
            "You will always have enough," he says,<br>
            "Everything you need is already here.<br>
            Just believe, and you will see."
            </p>
            <p>The little sheep smiled and felt so light,<br>
            because they knew: there is always enough.<br>
            Always enough love. Always enough joy.</p>
        </div>`
    },
    {
        title: 'Chapter 2: The gift of now',
        content: `<div style="text-align: center;">
            <img src="${getImageBase64('02-acque-tranquille.jpg')}" alt="The little sheep rest beside a crystal-clear stream among green meadows" style="max-width: 100%; height: auto;"/>
            <p>The shepherd led them to a magical place:<br>
            soft green meadows, sparkling streams,<br>
            where every flower whispered "thank you."</p>
            <p style="font-style: italic; border-left: 3px solid #d4a855; padding-left: 15px; margin: 20px 0;">
            "Stop and feel how good this is," he said,<br>
            "When you are grateful for what you have,<br>
            even more good things come to you."
            </p>
            <p>The little sheep breathed deeply and smiled.<br>
            They noticed the warm sun, the cool breeze.<br>
            "Thank you, thank you, thank you," they sang.</p>
        </div>`
    },
    {
        title: 'Chapter 3: Trust the path',
        content: `<div style="text-align: center;">
            <img src="${getImageBase64('03-sentieri.jpg')}" alt="The shepherd guides the little sheep along a winding path through the hills" style="max-width: 100%; height: auto;"/>
            <p>Sometimes the road ahead looked confusing,<br>
            twisting and turning, hard to see.</p>
            <p>But the shepherd smiled and said:</p>
            <p style="font-style: italic; border-left: 3px solid #d4a855; padding-left: 15px; margin: 20px 0;">
            "You don't need to know the whole way.<br>
            Just take the next step.<br>
            I will guide you to wonderful places<br>
            you cannot even imagine yet."
            </p>
            <p>And the little sheep learned to trust,<br>
            knowing that good things were coming.</p>
        </div>`
    },
    {
        title: 'Chapter 4: Love is stronger than fear',
        content: `<div style="text-align: center;">
            <img src="${getImageBase64('04-valle-oscura.jpg')}" alt="The little sheep walk through a shadowy valley, illuminated by the shepherds reassuring presence" style="max-width: 100%; height: auto;"/>
            <p>One day they came to a valley of shadows,<br>
            where fear whispered scary things.</p>
            <p>But the shepherd's voice was calm and clear:</p>
            <p style="font-style: italic; border-left: 3px solid #d4a855; padding-left: 15px; margin: 20px 0;">
            "Fear is just a shadow - it cannot hurt you.<br>
            When you choose love instead of fear,<br>
            the shadows disappear.<br>
            I am always with you."
            </p>
            <p>The little sheep chose love, and suddenly<br>
            the valley didn't seem so dark anymore.</p>
        </div>`
    },
    {
        title: 'Chapter 5: More than you asked for',
        content: `<div style="text-align: center;">
            <img src="${getImageBase64('05-tavola.jpg')}" alt="A table laden with fruit and abundant food under a great tree" style="max-width: 100%; height: auto;"/>
            <p>Then something wonderful happened!<br>
            The shepherd prepared a great feast<br>
            with more delicious things<br>
            than they could ever eat.</p>
            <p style="font-style: italic; border-left: 3px solid #d4a855; padding-left: 15px; margin: 20px 0;">
            "This is how life works," he said with joy,<br>
            "When you believe and are grateful,<br>
            you don't just get what you need -<br>
            you get more! Your cup overflows!"
            </p>
            <p>The little sheep laughed with delight.<br>
            There was so much abundance to share!</p>
        </div>`
    },
    {
        title: 'Chapter 6: You already belong',
        content: `<div style="text-align: center;">
            <img src="${getImageBase64('06-casa-signore.jpg')}" alt="A bright and welcoming home bathed in golden sunset light" style="max-width: 100%; height: auto;"/>
            <p>And so, day by day,<br>
            the shepherd led them home -<br>
            a beautiful home made of light and love.</p>
            <p style="font-style: italic; border-left: 3px solid #d4a855; padding-left: 15px; margin: 20px 0;">
            "You don't have to earn your place," he said,<br>
            "You already belong here.<br>
            Goodness and love will follow you<br>
            all the days of your life."
            </p>
            <p>And the little sheep understood:<br>
            they were always loved, always safe,<br>
            and everything they ever needed<br>
            was already theirs.</p>
        </div>`
    },
    {
        title: 'Psalm 23',
        content: `<div style="text-align: center; font-style: italic; padding: 30px 20px;">
            <h3>Psalm 23</h3>
            <p>The Lord is my shepherd; I shall not want.</p>
            <p>He makes me lie down in green pastures.<br>He leads me beside still waters.</p>
            <p>He restores my soul.<br>He leads me in paths of righteousness<br>for his name's sake.</p>
            <p>Even though I walk through the valley<br>of the shadow of death,<br>I will fear no evil, for you are with me.</p>
            <p>Your rod and your staff,<br>they comfort me.</p>
            <p>You prepare a table before me<br>in the presence of my enemies.</p>
            <p>You anoint my head with oil;<br>my cup overflows.</p>
            <p>Surely goodness and mercy shall follow me<br>all the days of my life,<br>and I shall dwell in the house of the Lord<br>forever.</p>
        </div>`
    },
    {
        title: 'The End',
        content: `<div style="text-align: center; padding: 50px 20px;">
            <p style="font-size: 2em; font-style: italic;">The End</p>
            <p style="margin-top: 50px;">Words: Gianni Parola<br>Illustrations: Pino Pennello</p>
            <p style="margin-top: 30px; font-weight: bold;">Published by Onde, Free River House</p>
            <p style="color: #999;">First Edition · 2026</p>
        </div>`
    }
];

async function generateBooks() {
    try {
        // Generate Italian ePub
        console.log('Generating Italian ePub...');
        const italianEpub = await new EPub({
            title: 'La Promessa del Pastore',
            author: 'Gianni Parola',
            publisher: 'Onde, Free River House',
            lang: 'it',
            tocTitle: 'Indice',
            cover: path.join(imagesDir, '00-copertina.jpg')
        }, italianContent).genEpub();
        fs.writeFileSync(path.join(bookDir, 'La-Promessa-del-Pastore.epub'), italianEpub);
        console.log('Italian ePub created: La-Promessa-del-Pastore.epub');

        // Generate English ePub
        console.log('Generating English ePub...');
        const englishEpub = await new EPub({
            title: "The Shepherd's Promise",
            author: 'Gianni Parola',
            publisher: 'Onde, Free River House',
            lang: 'en',
            tocTitle: 'Contents',
            cover: path.join(imagesDir, '00-copertina.jpg')
        }, englishContent).genEpub();
        fs.writeFileSync(path.join(bookDir, 'The-Shepherds-Promise.epub'), englishEpub);
        console.log('English ePub created: The-Shepherds-Promise.epub');

        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
    }
}

generateBooks();
