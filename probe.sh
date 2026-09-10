#!/bin/bash
echo "=== whoami & which ==="; whoami; command -v cargo-add cargo-edit cargo 2>&1
echo "=== \$HOME ==="; echo "$HOME"
echo "=== cargo-edit try common paths ==="
for p in "$HOME/.cargo/bin/cargo-edit" "/usr/local/cargo/bin/cargo-edit" "$PWD/.cargo-edit/bin/cargo-edit"; do printf '%s -> ' "$p"; [ -x "$p" ] && echo "EXISTS" || echo "no"; done
