#!/usr/bin/env bash
# Rebuilds docs/index.html from shop-manager-app.jsx + index.template.html
# Usage: ./build.sh
set -e

cd "$(dirname "$0")"
mkdir -p .build

echo "→ Preparing JSX..."
python3 << 'EOF'
with open('shop-manager-app.jsx') as f:
    code = f.read()
code = code.replace('const { useState, useEffect, useRef } = React;\n', '')
code = code.replace('import { useState, useEffect, useRef } from "react";\n', '')
code = code.replace('export default function App(){', 'function App(){')
code += '\n\nconst _root = ReactDOM.createRoot(document.getElementById("root"));\n_root.render(React.createElement(App));\n'
with open('.build/app-to-compile.jsx', 'w') as f:
    f.write(code)
EOF

if [ ! -d node_modules/@babel/core ]; then
  echo "→ Installing Babel (first run only)..."
  npm install --silent @babel/core @babel/cli @babel/plugin-transform-react-jsx
fi

# .babelrc lives at repo root so Babel's directory-based config lookup finds it
# for files under .build/. runtime:"classic" is required -- the app uses the
# global UMD React from a CDN script tag, not an ES-module jsx-runtime import.
cat > .babelrc << 'BABELRC_EOF'
{"plugins":[["@babel/plugin-transform-react-jsx",{"runtime":"classic"}]]}
BABELRC_EOF

echo "→ Compiling JSX..."
node_modules/.bin/babel .build/app-to-compile.jsx --out-file .build/app-compiled.js

node --check .build/app-compiled.js
echo "✅ Syntax OK"

echo "→ Assembling docs/index.html..."
python3 << 'EOF'
with open('index.template.html') as f:
    template = f.read()
with open('.build/app-compiled.js') as f:
    compiled = f.read()
html = template.replace('__APP_JS__', 'const { useState, useEffect, useRef } = React;\n\n' + compiled)
with open('docs/index.html', 'w') as f:
    f.write(html)
print("docs/index.html size:", len(html), "bytes")
EOF

echo "✅ Build complete → docs/index.html"
echo "   Next: git add -A && git commit -m 'update' && git push"
