#!/usr/bin/env bash
# Safe Google Cloud Chirp 3 invocation; never puts secrets in git.
set -euo pipefail
ADC=/home/ubuntu/.config/barti-google-chirp/service-account.json
if [[ -f "$ADC" ]]; then
  [[ "$(stat -c %a "$ADC")" == "600" ]] || { echo "Fix credential permissions: chmod 600 $ADC" >&2; exit 3; }
  export GOOGLE_APPLICATION_CREDENTIALS="$ADC"
elif [[ -z "${GOOGLE_APPLICATION_CREDENTIALS:-}" ]] && [[ ! -f /home/ubuntu/.config/gcloud/application_default_credentials.json ]]; then
  if [[ "${1:---check-auth}" != "--dry-run" ]]; then
    echo "Google Cloud credentials missing. Set up your service account / ADC; see docs/GOOGLE_CHIRP3.md." >&2
    exit 4
  fi
fi
exec /home/ubuntu/bartek-workspace/tools/barti-google-chirp/.venv/bin/python \
  /home/ubuntu/bartek-workspace/projects/BARTI_GOOGLE_CHIRP/scripts/google-chirp3-generate.py "$@"
