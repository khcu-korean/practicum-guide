#!/usr/bin/env bash
# 시범 운영용 사본을 pilot/ 폴더에 만듭니다. → https://khcu-korean.github.io/practicum-guide/pilot/
# - 화면 위 '시범 운영 중' 띠, 기록은 정식 앱과 따로 저장, 검색 엔진 노출 안 함
# - 시범 운영을 끝낼 때는 pilot/ 폴더를 지우면 링크가 열리지 않습니다.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf pilot
mkdir -p pilot
cp -r index.html manifest.json sw.js css js icons pilot/
sed -i "s/  pilot: false,/  pilot: true,/; s/  storagePrefix: 'pg',/  storagePrefix: 'pg-pilot',/" pilot/js/config.js
sed -i 's|<meta charset="UTF-8" />|<meta charset="UTF-8" />\n  <meta name="robots" content="noindex, nofollow" />|' pilot/index.html
grep -q "pilot: true" pilot/js/config.js && grep -q "noindex" pilot/index.html && echo "pilot/ 만들기 완료"
