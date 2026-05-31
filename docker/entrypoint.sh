#!/bin/sh
set -e

cd /workspace

# Re-install and re-link in case package.json or source changed outside the image build
npm install --include=dev
npm run build
npm link

exec ./node_modules/.bin/nodemon
