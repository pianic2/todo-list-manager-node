# Todo List Manager (Node.js)

Applicazione Todo List con backend Node.js/Express, database SQLite e frontend vanilla JavaScript.

Il repository contiene una demo pronta per Render in modalità read-only: i dati vengono popolati da seed credibili e l'API accetta solo letture quando `READ_ONLY=true`.

## Demo Live

La demo pubblica è disponibile qui:

```text
https://todo-list-manager-node.onrender.com/
```

## Funzionalità

- REST API per liste e note.
- Note annidate sotto una lista: `/lists/:listId/items/:itemId`.
- SQLite tramite `better-sqlite3`.
- Soft delete per liste e note.
- Validazione centralizzata di payload e ID.
- Gestione errori JSON uniforme.
- Rate limiting in memoria configurabile.
- Frontend statico in `frontend/`, servito anche da Express.
- Seed database idempotente con liste e note demo.
- Modalità read-only per deploy pubblici.
- CI GitHub Actions con `npm ci` e `npm test`.
- Deploy Render tramite `render.yaml`.

## Struttura

```text
src/
  config/runtime.config.js
  controllers/
  db/database.js
  middleware/
  models/
  routes/
  validators/
scripts/
  init-db.js
  init-db.sql
frontend/
tests/
.github/workflows/ci.yml
render.yaml
docker-compose.yml
```

Nota: al momento non è presente un `Dockerfile` nel working tree. Il file `docker-compose.yml` resta nel repository, ma il percorso consigliato per la demo gratuita è Render.

## Configurazione

| Variabile | Obbligatoria | Default | Note |
|---|---:|---|---|
| `NODE_ENV` | no | `development` | Valori ammessi: `development`, `test`, `production`. |
| `DATABASE_PATH` | sì | nessuno | Percorso del file SQLite. |
| `PORT` | no | `3000` | Porta HTTP Express. |
| `CORS_ORIGIN` / `CORS_ORIGINS` | sì in produzione | dev/test default | Origini consentite, separate da virgola. |
| `READ_ONLY` | no | `false` | Se `true`, `1` o `yes`, blocca POST/PUT/PATCH/DELETE con `405`. |
| `RATE_LIMIT_WINDOW_MS` | no | `60000` | Finestra rate limit in millisecondi. |
| `RATE_LIMIT_MAX` | no | `100` | Numero massimo di richieste per finestra. |

In sviluppo, se `CORS_ORIGIN` non è impostata, sono consentiti `http://localhost:3100` e `http://127.0.0.1:3100`.

## Avvio Locale

Installa le dipendenze:

```bash
npm install
```

Inizializza il database locale con schema e seed:

```bash
NODE_ENV=development DATABASE_PATH=./data/development.sqlite npm run db:init
```

Avvia backend e frontend statico con un unico processo Express:

```bash
NODE_ENV=development DATABASE_PATH=./data/development.sqlite npm start
```

Apri:

```text
http://localhost:3000/
```

Per lo sviluppo con backend su `3000` e frontend servito separatamente su `3100`:

```bash
NODE_ENV=development DATABASE_PATH=./data/development.sqlite npm run dev
```

## Demo Read-Only

La modalità read-only è pensata per una demo pubblica gratuita:

```bash
NODE_ENV=production \
DATABASE_PATH=./data/render.sqlite \
CORS_ORIGIN="*" \
READ_ONLY=true \
npm start
```

Con `READ_ONLY=true`:

- `GET /lists` e `GET /lists/:listId/items` restano disponibili;
- `POST`, `PUT`, `PATCH` e `DELETE` rispondono con:

```json
{ "success": false, "error": "read-only demo" }
```

## Seed Database

`scripts/init-db.sql` crea le tabelle e popola dati demo idempotenti:

- `Client Work`
- `Learning Roadmap`
- `Portfolio Launch`

Ogni lista contiene note realistiche, alcune completate e alcune da fare. Gli insert usano `INSERT OR IGNORE`, quindi rieseguire `npm run db:init` non duplica i dati seed.

## API

Risposte di successo:

```json
{ "success": true, "data": {} }
```

Risposte di errore:

```json
{ "success": false, "error": "message" }
```

### Liste

| Metodo | Path | Comportamento |
|---|---|---|
| `GET` | `/lists` | Restituisce le liste non cancellate, dalla più recente. |
| `POST` | `/lists` | Crea una lista. Richiede `title`; `description` è opzionale. |
| `GET` | `/lists/:id` | Restituisce una lista o `404`. |
| `PUT` | `/lists/:id` | Aggiorna titolo e descrizione. |
| `DELETE` | `/lists/:id` | Soft-delete della lista e delle sue note. |

### Note

| Metodo | Path | Comportamento |
|---|---|---|
| `GET` | `/lists/:listId/items` | Restituisce le note della lista, dalla più vecchia. |
| `POST` | `/lists/:listId/items` | Crea una nota in una lista esistente. |
| `GET` | `/lists/:listId/items/:itemId` | Restituisce una nota solo se appartiene alla lista. |
| `PUT` | `/lists/:listId/items/:itemId` | Aggiorna il testo della nota. |
| `DELETE` | `/lists/:listId/items/:itemId` | Soft-delete della nota. |
| `PATCH` | `/lists/:listId/items/:itemId/status` | Imposta `status` a `todo` o `done`. |

Gli ID devono essere interi positivi.

## Frontend

Il frontend vive in `frontend/` e non richiede build.

Risoluzione API:

- da `localhost`, `127.0.0.1` o `file://` usa `http://localhost:3000`;
- da un host remoto usa la stessa origin della pagina;
- `window.API_BASE_URL` o `<meta name="api-base-url">` possono sovrascrivere l'origin.

In deploy Render, Express serve il frontend statico e l'API dalla stessa origin.

## Test

```bash
npm test
```

I test usano `NODE_ENV=test` e database temporanei sotto `tests/.tmp/`.

## CI/CD

La CI è in `.github/workflows/ci.yml` e gira su `push` e `pull_request`:

```bash
npm ci
npm test
```

La CD per Render è configurata come Blueprint in `render.yaml`:

- piano gratuito;
- runtime Node;
- `buildCommand: npm ci && npm run db:init`;
- `startCommand: npm start`;
- `READ_ONLY=true`;
- database SQLite in `data/render.sqlite`.

Per pubblicare:

1. Fai push del repository su GitHub.
2. In Render scegli **New > Blueprint**.
3. Collega il repository.
4. Render leggerà `render.yaml` e creerà il servizio gratuito.

Render abilita gli auto deploy dal branch collegato, quindi ogni push su quel branch esegue test lato GitHub e deploy lato Render.
