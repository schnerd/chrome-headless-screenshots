#!/usr/bin/env bash
google-chrome --headless --hide-scrollbars --remote-debugging-port=9222 --no-sandbox --disable-gpu &

# need to sleep to allow chrome time to start
sleep 1s

node index.js --outputDir=/var/output/ "$@"
