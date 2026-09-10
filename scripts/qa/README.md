# Verificări automate

Trei baterii, rulate pe site-ul de producție pornit local (`npm run build && npm start`).

```bash
npm run qa            # toate trei, în ordine
npm run qa:api        # doar API-ul: formular, Telegram, autentificare, rute
npm run qa:devices    # doar dispozitivele
npm run qa:flows      # doar parcursurile din browser
```

## `suite.mjs` — API și rute

Nu are nevoie de browser. Citește `.env.local` pentru tokenul de Telegram și
pentru emailul de admin.

Acoperă validarea formularului de contact pe fiecare câmp, capcana pentru
roboți, limita de trimiteri, botul și grupul de Telegram (inclusiv mesaje cu
diacritice, emoji, semne de marcaj și la limita de 1000 de caractere),
autentificarea în admin cu credențiale greșite și corecte, rutele protejate,
paginile publice și antetele de securitate.

**Atenție:** trimite mesaje reale în grupul de Telegram, marcate cu 🧪.

## `devices.mjs` și `flows.mjs` — browser

Cer Chrome pornit cu port de depanare:

```bash
chrome --headless=new --remote-debugging-port=9334 --user-data-dir=/tmp/chrome-qa
```

`devices.mjs` trece fiecare pagină prin 11 lățimi reale, de la Galaxy A la
desktop 1920, și caută scroll orizontal, ținte de atins sub 40px, text sub 11px
și imagini din ecran care nu s-au încărcat.

`flows.mjs` face ce face un om: deschide meniul pe telefon și verifică că
acoperă tot ecranul și că e opac, navighează prin galerie cu tastatura,
schimbă tipul evenimentului în formular, se autentifică în admin și deschide
meniul lateral.

`cdp.mjs` e clientul comun spre browser, nu se rulează singur.

## Izolare

Fiecare cerere spre formular pleacă de pe alt IP simulat, altfel limita de 3
trimiteri la 10 minute ar bloca testele de după. Secțiunea de admin din
`flows.mjs` șterge cookie-urile înainte să înceapă, altfel sesiunea rămasă din
rularea anterioară ar face verificările să treacă degeaba.
