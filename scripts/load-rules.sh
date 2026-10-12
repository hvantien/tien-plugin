#!/usr/bin/env bash
# In nội dung rules/*.md ra stdout; với hook SessionStart, stdout được thêm vào ngữ cảnh.
# Bỏ qua README.md. Không có rule nào thì không in gì.

rules_dir="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}/rules"

shopt -s nullglob
files=()
for f in "$rules_dir"/*.md; do
  [ "$(basename "$f")" = "README.md" ] && continue
  files+=("$f")
done

[ ${#files[@]} -eq 0 ] && exit 0

echo "# Rules từ tien-plugin"
for f in "${files[@]}"; do
  echo
  cat "$f"
done
