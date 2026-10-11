# Google Cloud Chirp 3 HD — BARTI STORY CLUB (2026-10-11)

Status: **READY TO AUTHENTICATE, NOT YET GENERATING**. Credentials and Google Cloud billing are **NOT yet configured on VPS**. The public app must continue using its current, working Piper voices. This is a safe optional integration; do not imply recordings have already been generated.

## Source and price

Official provider: https://cloud.google.com/text-to-speech/docs/chirp3-hd
Pricing: https://cloud.google.com/text-to-speech/pricing
Setup: https://docs.cloud.google.com/text-to-speech/docs/get-started
Authentication: https://docs.cloud.google.com/text-to-speech/docs/authentication

Chirp 3 HD can synthesize Russian with voices:
- Adult male `ru-RU-Chirp3-HD-Charon`
- Adult woman `ru-RU-Chirp3-HD-Kore`
- A softer feminine alternative `ru-RU-Chirp3-HD-Leda` (NOT a native child voice; label in the Google mode is “Łagodny”).

The story corpus contains **18 stories × 109 paragraph clips per profile = 327 MP3**, and **29,292 characters** for all three (9,764 per narrator). Google currently advertises a **1 million character/month free tier for Chirp 3 HD**, but **billing must be enabled**, and if allowance is already used, these clips would cost approximately **US$0.87876** before any local taxes. Source files and generated MP3 are for pre-rendered offline playback. No API key belongs in public frontend or Git.

## One-time action that MUST be done by the project/account owner

1. Open **https://console.cloud.google.com/**, choose/create a Google Cloud project and **link a billing account**.
2. Enable **Cloud Text-to-Speech API**: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com .
3. Create a *dedicated, minimally privileged service account* for Cloud TTS (not a personal Owner/Admin key). If your organization allows JSON key files, securely copy the credential file from your PC into the VPS path **`/home/ubuntu/.config/barti-google-chirp/service-account.json`**. Do this over SSH/SFTP; **do not paste the JSON contents into any chat, repo, ZIP, web interface or log**. The file should have permissions 0600, parent directory 0700, and be readable only by Ubuntu. Prefer ADC/service-account impersonation over a long-lived JSON key if available.
4. Once the file exists, run the following inside the VPS (or confirm setup in chat and let the assistant run them):

```bash
# Secure location to create before uploading service-account.json:
install -d -m 700 /home/ubuntu/.config/barti-google-chirp
chmod 600 /home/ubuntu/.config/barti-google-chirp/service-account.json

export GOOGLE_APPLICATION_CREDENTIALS=/home/ubuntu/.config/barti-google-chirp/service-account.json
PY=/home/ubuntu/bartek-workspace/tools/barti-google-chirp/.venv/bin/python
SCRIPT=/home/ubuntu/bartek-workspace/projects/BARTI_GOOGLE_CHIRP/scripts/google-chirp3-generate.py
$PY "$SCRIPT" --check-auth
$PY "$SCRIPT" --sample
# Listen to the 3 sample MP3s before generating all 327:
# /mnt/data/marka-lab/barti-story-club/voices/chirp3-hd-v1/{adult,female,child}/repka/00.mp3
$PY "$SCRIPT" --all
$PY /home/ubuntu/bartek-workspace/projects/BARTI_GOOGLE_CHIRP/scripts/google-chirp3-promote.py
```

**Never** commit Google credentials. To verify without secrets, `--check-auth` only reports whether it can list the requested voices and does not perform synthesis. Default mode `--dry-run` is entirely free of Google network calls. The generator checks that **/mnt/data mounts /dev/sdb**, validates content hashes, records paid-request journal entries in `_jobs/` and **refuses automatic retry** for ambiguous API failures, avoiding accidental duplicate charges. It will not silently regenerate completed MP3s.

## Artifacts and integration design

- VPS Python environment with Google Cloud SDK: `/home/ubuntu/bartek-workspace/tools/barti-google-chirp/.venv`.
- Generator: `scripts/google-chirp3-generate.py`; script can be resumed safely, **not scheduled**.
- Canonical original MP3s on second disk: `/mnt/data/marka-lab/barti-story-club/voices/chirp3-hd-v1/<profile>/<storyId>/<paragraphIndex>.mp3`.
- Validator/promoter: `scripts/google-chirp3-promote.py` — **only after ALL 327 audio files validate**. It creates 327 deployable MP3 copies in `assets/voices/chirp3/<profile>/<storyId>-<paragraphIndex>.mp3` and writes the `data/chirp-voices.json` status including actual MP3 durations.
- Currently `data/chirp-voices.json` has `ready:false`. `app.js` automatically stays with the **current Piper Denis / Irina / child-stylized** tracks and 3-choice UI. If Google clips are promoted, the manifest changes to `ready:true` and **the same three-choice UI** loads the Google Charon/Kore/Leda profiles. If Google MP3 playback fails it falls back to Piper rather than breaking the story.
- `sw.js`: v32, caches the readiness manifest, with a **network-first override** for `data/chirp-voices.json` to avoid stale false status. New Google MP3 assets should only be deployed *after QA* and not added to initial precache; check PWA downloadable-media handling when promoting.
- Google synthesized narration is asynchronous pre-rendered audio: browser does **not call Google API at runtime**. The existing sentence images and illustration scene mapping are unchanged.
- Existing `word-timing.json` was aligned to Piper Denis, so Google audio uses estimated duration-weighted word highlighting until a dedicated forced alignment pass. No false claim of exact lip-sync.

## QA/status

- Confirmed VPS online, Git worktree `feature/google-chirp3-voices`, SDK installed.
- Checked gcloud/ADC: **no credentials present**; executing `--check-auth` accurately returns `CHIRP_BLOCKED Google Cloud ADC not configured`.
- Offline `--dry-run` confirms 327 requests, 29,292 characters, **$0.8788 USD** worst case after free tier, below enforced $1 cap.
- Test fallback Piper in Chromium/Playwright desktop+mobile before publishing, then later test actual MP3 once Google credentials are configured.

IMPORTANT: Do NOT describe Chirp audio generation as complete or publish a `ready:true` status with missing audio. The user's separate Google Cloud billing/authentication is the only remaining blocker for real generation. After they configure it, run check → 3 samples → listen/QA → bulk 327 → promotion → test and deploy.
