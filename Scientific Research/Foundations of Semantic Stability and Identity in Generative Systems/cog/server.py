#!/usr/bin/env python3
"""
Local development server for DRS Traversal Engine.
Provides web UI and REST API for straight-line repo navigation.

Run: python3 cog/server.py
Open: http://localhost:8080
"""

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

# Import DRS engine from same directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from drs import build_index, pick_chain, format_output

# Configuration
HOST = "localhost"
PORT = 8080
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Pre-build index on startup
print(f"Indexing repository: {REPO_ROOT}")
INDEX = build_index(REPO_ROOT)
print(f"Indexed {len(INDEX)} chunks")

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>COG: Straight-Line Traversal</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
            background: #0a0a0a;
            color: #e0e0e0;
            min-height: 100vh;
            padding: 2rem;
        }
        .container { max-width: 900px; margin: 0 auto; }
        h1 {
            font-size: 1.5rem;
            color: #4ecdc4;
            margin-bottom: 0.5rem;
        }
        .subtitle {
            color: #666;
            font-size: 0.85rem;
            margin-bottom: 2rem;
        }
        .input-section {
            background: #111;
            border: 1px solid #222;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }
        label {
            display: block;
            color: #888;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.5rem;
        }
        textarea {
            width: 100%;
            background: #0a0a0a;
            border: 1px solid #333;
            color: #e0e0e0;
            padding: 0.75rem;
            font-family: inherit;
            font-size: 0.9rem;
            resize: vertical;
            min-height: 80px;
        }
        textarea:focus { outline: none; border-color: #4ecdc4; }
        .controls {
            display: flex;
            gap: 1rem;
            align-items: center;
            margin-top: 1rem;
        }
        .controls input {
            width: 60px;
            background: #0a0a0a;
            border: 1px solid #333;
            color: #e0e0e0;
            padding: 0.5rem;
            font-family: inherit;
        }
        button {
            background: #4ecdc4;
            color: #0a0a0a;
            border: none;
            padding: 0.6rem 1.5rem;
            font-family: inherit;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s;
        }
        button:hover { background: #3dbdb5; }
        button:disabled { background: #333; color: #666; cursor: wait; }
        .results { display: none; }
        .results.visible { display: block; }
        .meta {
            background: #111;
            border: 1px solid #222;
            padding: 1rem;
            margin-bottom: 1rem;
            font-size: 0.8rem;
        }
        .meta-row {
            display: flex;
            justify-content: space-between;
            padding: 0.25rem 0;
            border-bottom: 1px solid #1a1a1a;
        }
        .meta-row:last-child { border-bottom: none; }
        .meta-label { color: #666; }
        .meta-value { color: #4ecdc4; }
        .chain-item {
            background: #111;
            border: 1px solid #222;
            border-left: 3px solid #4ecdc4;
            padding: 1rem;
            margin-bottom: 0.5rem;
        }
        .chain-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.75rem;
        }
        .step-num {
            background: #4ecdc4;
            color: #0a0a0a;
            padding: 0.15rem 0.5rem;
            font-size: 0.7rem;
            font-weight: bold;
        }
        .score {
            font-size: 0.8rem;
            color: #888;
        }
        .score-value { color: #4ecdc4; font-weight: bold; }
        .chain-path {
            color: #888;
            font-size: 0.75rem;
            margin-bottom: 0.25rem;
        }
        .chain-heading {
            color: #e0e0e0;
            font-size: 0.9rem;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
            margin-top: 0.75rem;
            padding-top: 0.75rem;
            border-top: 1px solid #1a1a1a;
            font-size: 0.7rem;
        }
        .metric { color: #666; }
        .metric span { color: #888; }
        .closure {
            background: #0d1f1d;
            border: 1px solid #1a3a35;
            padding: 1rem;
            margin-top: 1rem;
        }
        .closure.max-steps { background: #1f1a0d; border-color: #3a351a; }
        .closure-title { color: #4ecdc4; font-size: 0.8rem; margin-bottom: 0.5rem; }
        .closure.max-steps .closure-title { color: #cdc44e; }
        .closure-note { color: #888; font-size: 0.75rem; }
        .error {
            background: #1f0d0d;
            border: 1px solid #3a1a1a;
            color: #cd4e4e;
            padding: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>COG: Straight-Line Traversal</h1>
        <p class="subtitle">Invariant-preserving navigation · G: X → X' where X' ⊆ X</p>

        <div class="input-section">
            <label>Anchor (Invariant X₀)</label>
            <textarea id="anchor" placeholder="Enter invariant anchor text...">operators create identity governance validates moderation ensures coherence</textarea>
            <div class="controls">
                <label style="margin-bottom: 0;">Max steps</label>
                <input type="number" id="steps" value="7" min="1" max="15">
                <button id="traverse" onclick="runTraversal()">Traverse</button>
            </div>
        </div>

        <div id="results" class="results"></div>
    </div>

    <script>
        async function runTraversal() {
            const anchor = document.getElementById('anchor').value.trim();
            const steps = document.getElementById('steps').value;
            const btn = document.getElementById('traverse');
            const results = document.getElementById('results');

            if (!anchor) {
                results.innerHTML = '<div class="error">Anchor text required</div>';
                results.classList.add('visible');
                return;
            }

            btn.disabled = true;
            btn.textContent = 'Traversing...';
            results.innerHTML = '';

            try {
                const response = await fetch('/api/traverse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ anchor, steps: parseInt(steps) })
                });

                const data = await response.json();

                if (data.error) {
                    results.innerHTML = `<div class="error">${data.error}</div>`;
                } else {
                    results.innerHTML = renderResults(data);
                }
            } catch (err) {
                results.innerHTML = `<div class="error">Request failed: ${err.message}</div>`;
            }

            btn.disabled = false;
            btn.textContent = 'Traverse';
            results.classList.add('visible');
        }

        function renderResults(data) {
            let html = `
                <div class="meta">
                    <div class="meta-row">
                        <span class="meta-label">Anchor</span>
                        <span class="meta-value">${escapeHtml(data.anchor)}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">Chain Length</span>
                        <span class="meta-value">${data.chain_length} steps</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">Formula</span>
                        <span class="meta-value">${data.protocol.formula}</span>
                    </div>
                </div>
            `;

            for (const item of data.chain) {
                html += `
                    <div class="chain-item">
                        <div class="chain-header">
                            <span class="step-num">STEP ${item.step}</span>
                            <span class="score">score: <span class="score-value">${item.metrics.score.toFixed(4)}</span></span>
                        </div>
                        <div class="chain-path">${escapeHtml(item.path)}</div>
                        <div class="chain-heading">${escapeHtml(item.heading)}</div>
                        <div class="metrics">
                            <div class="metric">align: <span>${item.metrics.anchor_alignment.toFixed(4)}</span></div>
                            <div class="metric">novelty: <span>${item.metrics.novelty_penalty.toFixed(4)}</span></div>
                            <div class="metric">ambiguity: <span>${item.metrics.ambiguity_penalty.toFixed(4)}</span></div>
                        </div>
                    </div>
                `;
            }

            const closureClass = data.closure.reason === 'fixed_point' ? '' : 'max-steps';
            html += `
                <div class="closure ${closureClass}">
                    <div class="closure-title">${data.closure.reached ? '● Fixed Point Reached' : '○ Max Steps Reached'}</div>
                    <div class="closure-note">${escapeHtml(data.closure.note)}</div>
                </div>
            `;

            return html;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Run on Enter key in textarea
        document.getElementById('anchor').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                runTraversal();
            }
        });
    </script>
</body>
</html>
"""


class DRSHandler(BaseHTTPRequestHandler):
    """HTTP request handler for DRS traversal API."""

    def log_message(self, format, *args):
        """Custom log format."""
        print(f"[{self.log_date_time_string()}] {args[0]}")

    def send_json(self, data, status=200):
        """Send JSON response."""
        body = json.dumps(data, indent=2).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(body))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def send_html(self, html, status=200):
        """Send HTML response."""
        body = html.encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        """Handle GET requests."""
        path = urlparse(self.path).path

        if path == '/' or path == '/index.html':
            self.send_html(HTML_TEMPLATE)

        elif path == '/api/status':
            self.send_json({
                'status': 'ok',
                'repo': REPO_ROOT,
                'chunks': len(INDEX),
                'files': len(set(e['path'] for e in INDEX))
            })

        else:
            self.send_json({'error': 'Not found'}, 404)

    def do_POST(self):
        """Handle POST requests."""
        path = urlparse(self.path).path

        if path == '/api/traverse':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                params = json.loads(body)

                anchor = params.get('anchor', '').strip()
                steps = min(max(int(params.get('steps', 7)), 1), 15)

                if not anchor:
                    self.send_json({'error': 'Anchor text required'}, 400)
                    return

                # Run traversal
                chain = pick_chain(INDEX, anchor, max_steps=steps)
                result = format_output(anchor, chain, verbose=False)

                self.send_json(result)

            except json.JSONDecodeError:
                self.send_json({'error': 'Invalid JSON'}, 400)
            except Exception as e:
                self.send_json({'error': str(e)}, 500)

        else:
            self.send_json({'error': 'Not found'}, 404)

    def do_OPTIONS(self):
        """Handle CORS preflight."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()


def main():
    server = HTTPServer((HOST, PORT), DRSHandler)
    print(f"\n  COG: Straight-Line Traversal Engine")
    print(f"  ────────────────────────────────────")
    print(f"  Repository: {REPO_ROOT}")
    print(f"  Indexed:    {len(INDEX)} chunks")
    print(f"  Server:     http://{HOST}:{PORT}")
    print(f"\n  Press Ctrl+C to stop\n")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Shutting down...")
        server.shutdown()


if __name__ == "__main__":
    main()
