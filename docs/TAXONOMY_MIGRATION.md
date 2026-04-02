# Vocabulary topic taxonomy (single category per word)

## Model

- Each word (`w001` … `w157`) has stable `id` and **`topics` array with exactly one** topic id.
- User progress in D1 uses **`word_id`** only; changing topics does **not** invalidate learned words.
- Topic session scores live in `category_progress` with `mode = 'topic'` and `category_id` = topic id.

## Hiragana not listed in the original spec block

These three appear in `vocabulary.json` but were not in the pasted category lists. They are assigned deterministically in `scripts/vocab-taxonomy-data.mjs` (`HIRAGANA_TOPIC_OVERRIDES`):

| Hiragana | Topic |
|----------|--------|
| あい | PERSONAS |
| しごと | PROFESIONES Y ROLES |
| おかね | OBJETOS COTIDIANOS |

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/vocab-taxonomy-data.mjs` | Topic definitions + hiragana lists |
| `scripts/apply-vocab-taxonomy.mjs` | Regenerate `vocabulary.json` topics from data (run after editing taxonomy) |
| `scripts/validate-vocabulary.mjs` | Fails build if a word has 0 or 2+ topics, or topic mismatch |
| `npm run validate:vocab` | Run validation only |

## Database migration

`migrations/0003_topic_taxonomy.sql` remaps legacy `category_id` values for `mode = 'topic'` and deletes obsolete `work_daily_life` topic rows.

Apply locally:

```bash
npm run db:migrate:local
```

Apply remote (production):

```bash
npm run db:migrate:remote
```

## Deployment checklist

1. Back up remote D1 (Cloudflare dashboard export / copy instructions for your org).
2. Deploy app build that includes new `vocabulary.json` and Functions.
3. Run `0003_topic_taxonomy.sql` on remote D1 (`db:migrate:remote`).
4. Smoke-test: login as existing user — word progress still loads; “Por tema” shows new category labels; practice a topic session.
5. New account: register, complete a topic session, confirm `category_progress` uses new ids.
6. Monitor Workers/Pages logs for 500s on `/api/progress`.

## What users may notice

- “Por tema” cards may show different mastery % because words moved between topics.
- Old `work_daily_life` topic session aggregates are removed (those rows are deleted); per-word progress is unchanged.
