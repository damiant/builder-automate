#!/usr/bin/env bash
# Release PGlite locks and dev ports left behind when pnpm dev is stopped with
# Ctrl+C while lazy app servers are still running.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORTS=(8080 8100 8101 8102 8103 8104 8105)

kill_matching_pid() {
  local pid="$1"
  local cmd
  cmd="$(ps -p "$pid" -o command= 2>/dev/null || true)"
  if [[ -z "$cmd" ]]; then
    return 0
  fi
  if [[ "$cmd" == *"$ROOT"* ]] && [[ "$cmd" == *"vite"* || "$cmd" == *"agent-native"* ]]; then
    echo "Stopping PID $pid (${cmd%% *}…)"
    kill -9 "$pid" 2>/dev/null || true
  fi
}

for port in "${PORTS[@]}"; do
  pids="$(lsof -ti "tcp:${port}" 2>/dev/null || true)"
  if [[ -z "$pids" ]]; then
    continue
  fi
  while read -r pid; do
    [[ -n "$pid" ]] && kill_matching_pid "$pid"
  done <<< "$pids"
done

# Release PGlite directory locks left when a dev worker dies without cleanup.
for pglite_dir in "$ROOT"/apps/*/data/pglite; do
  [[ -d "$pglite_dir" ]] || continue
  pids="$(lsof -ti "+D:${pglite_dir}" 2>/dev/null || true)"
  while read -r pid; do
    [[ -n "$pid" ]] && kill_matching_pid "$pid"
  done <<< "$pids"
done

for lock_file in "$ROOT"/apps/*/data/pglite.agent-native-pglite.lock; do
  [[ -f "$lock_file" ]] || continue
  lock_pid=""
  if command -v python3 >/dev/null 2>&1; then
    lock_pid="$(python3 -c "import json; print(json.load(open('${lock_file}')).get('pid',''))" 2>/dev/null || true)"
  fi
  if [[ -z "$lock_pid" ]]; then
    lock_pid="$(sed -n 's/.*"pid"[[:space:]]*:[[:space:]]*\([0-9][0-9]*\).*/\1/p' "$lock_file" | head -1)"
  fi
  if [[ -n "$lock_pid" ]] && ! ps -p "$lock_pid" >/dev/null 2>&1; then
    echo "Removing stale PGlite lock (PID $lock_pid gone): ${lock_file#"$ROOT"/}"
    rm -f "$lock_file"
  fi
done

echo "Stale builder-factory dev servers stopped. Run pnpm dev from the workspace root."
