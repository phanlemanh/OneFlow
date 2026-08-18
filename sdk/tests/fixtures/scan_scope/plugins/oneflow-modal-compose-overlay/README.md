Fixture plugin tree for AC-12 (scan-with-block-imports).

`deploy.py` and `entry.py` are round-tripped byte-for-byte from the real
`oneflow-modal-compose-overlay` plugin; `deploy.py.sha256` pins that content so
the fixture cannot drift into a shape the real plugin never had. Re-cut both
files together, and update the pin, if the upstream plugin changes shape.

`plugins/` is gitignored and populated at runtime, so the product-level question
("does anyone serve compose-overlay?") cannot be asked only there — a fresh
checkout would ship green without ever answering it. That is this tree's job;
`check-overlay-discoverable.sh real` asks the same question of the real tree and
reports a named skip when the plugin is not installed.
