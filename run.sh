#!/usr/bin/env bash
google-chrome --headless --hide-scrollbars --remote-debugging-port=9222 --no-sandbox --disable-gpu &

# wait until the debug port opens
while : ; do
  set +e
  (echo > /dev/tcp/127.0.0.1/9222) >/dev/null 2>&1
  [[ $? -eq 0 ]] && break
  set -e
  sleep 1
done

node index.js --outputDir=/var/output/ "$@"
