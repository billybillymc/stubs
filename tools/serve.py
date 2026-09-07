# -*- coding: utf-8 -*-
"""Serve the folder over HTTP with caching turned off.

`python -m http.server` sends Last-Modified and nothing else — no
Cache-Control, no ETag — which leaves the browser free to guess how
long a file stays fresh. The usual guess is a tenth of the file's age,
so if you load the page when data.js is six hours old, the browser will
not ask the server again for the next half hour. That shows up as an
edit that "did not take": you change a title, reload, and the old one
is still there, because nothing was ever fetched.

This is the same server with no-store on every response, which is what
you want while you are editing. Use it instead of http.server:

    python tools/serve.py            # port 8713, this folder
    python tools/serve.py 9000       # another port
"""
import http.server, os, socketserver, sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, fmt, *args):          # one line per request, quietly
        sys.stderr.write('%s %s\n' % (self.log_date_time_string(), fmt % args))


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8713
    root = sys.argv[2] if len(sys.argv) > 2 else \
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', port), NoCache) as httpd:
        print('serving %s\n    http://localhost:%d/ui-passage-pull.html' % (root, port))
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
