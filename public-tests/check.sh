#!/usr/bin/env bash

set -euo pipefail

# Documentation
test -e 'docs/requirements.md'
test -e 'docs/decision-record.md'
test -e 'docs/cache-strategy.md'
test -e 'docs/rendering-decision.md'

# Project configuration
test -e 'package.json'
test -e 'package-lock.json'
test -e 'scripts/verify.mjs'

# PWA shell
test -e 'public/manifest.webmanifest'
test -e 'src/app/layout.tsx'
test -e 'src/app/page.tsx'
test -e 'src/components/app-shell.tsx'

# Service Worker
test -e 'public/sw.js'
test -e 'src/lib/pwa/register-service-worker.ts'

# CSR/SSR
test -e 'src/app/inspecciones/page.tsx'
test -e 'src/app/inspecciones/[id]/page.tsx'
test -e 'src/components/loading-state.tsx'

# Tests
test -e 'tests/manifest.spec.ts'
test -e 'tests/service-worker.spec.ts'
test -e 'tests/service-worker-behavior.spec.ts'
test -e 'tests/offline.spec.ts'
test -e 'tests/rendering.spec.ts'

# README
test -f README.md

# Security check
! rg -n -i '(api[_-]?key|secret|password|token)' \
  --glob '!public-tests/check.sh' .

echo PUBLIC_OK