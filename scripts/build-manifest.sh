#!/usr/bin/env bash
#
# Regenerate modules.json from the experience.json files in modules/.
# Preserves manually-set fields (url) and computes sha256 from dist/ ZIPs if present.
#
# Usage:
#   ./scripts/build-manifest.sh [--zip]
#
# With --zip: also builds ZIPs into dist/ before computing hashes.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODULES_DIR="$REPO_ROOT/modules"
DIST_DIR="$REPO_ROOT/dist"
MANIFEST="$REPO_ROOT/modules.json"

if ! command -v jq &>/dev/null; then
  echo "Error: jq is required. Install with: brew install jq" >&2
  exit 1
fi

# Optionally build ZIPs
if [[ "${1:-}" == "--zip" ]]; then
  echo "Building ZIPs..."
  rm -rf "$DIST_DIR"
  mkdir -p "$DIST_DIR"
  for dir in "$MODULES_DIR"/*/; do
    module_id=$(basename "$dir")
    echo "  Zipping $module_id..."
    (cd "$dir" && zip -r "$DIST_DIR/${module_id}.zip" . -x "session_data/*" -x "*.DS_Store" -x "*.zip" -q)
  done
fi

# Start building the manifest
echo "Building modules.json..."

# Read existing manifest to preserve url fields
existing_manifest="$MANIFEST"

# Build a new modules object
modules_json="{}"

for dir in "$MODULES_DIR"/*/; do
  module_id=$(basename "$dir")
  config="$dir/experience.json"

  if [[ ! -f "$config" ]]; then
    echo "  Warning: $module_id has no experience.json, skipping" >&2
    continue
  fi

  hidden=$(jq -r '.hidden // false' "$config")
  if [[ "$hidden" == "true" ]]; then
    echo "  Skipping $module_id (hidden=true)"
    continue
  fi

  title=$(jq -r '.title // "Untitled"' "$config")
  description=$(jq -r '.description // ""' "$config")
  version=$(jq -r '.version // "1.0.0"' "$config")
  kind=$(jq -r '.kind // ""' "$config")
  author=$(jq -r '.author // ""' "$config")
  requires=$(jq -c '.requires // []' "$config")

  # Preserve existing URL from manifest, or use default
  existing_url=$(jq -r --arg id "$module_id" '.modules[$id].url // ""' "$existing_manifest" 2>/dev/null || echo "")
  if [[ -z "$existing_url" ]]; then
    existing_url="https://github.com/wharton-generative-ai-labs/primer-modules/releases/latest/download/${module_id}.zip"
  fi

  # Compute SHA-256 if ZIP exists
  sha256=""
  zip_path="$DIST_DIR/${module_id}.zip"
  if [[ -f "$zip_path" ]]; then
    if command -v sha256sum &>/dev/null; then
      sha256=$(sha256sum "$zip_path" | awk '{print $1}')
    elif command -v shasum &>/dev/null; then
      sha256=$(shasum -a 256 "$zip_path" | awk '{print $1}')
    fi
  fi

  modules_json=$(echo "$modules_json" | jq \
    --arg id "$module_id" \
    --arg title "$title" \
    --arg desc "$description" \
    --arg ver "$version" \
    --arg kind "$kind" \
    --arg author "$author" \
    --argjson requires "$requires" \
    --arg sha256 "$sha256" \
    --arg url "$existing_url" \
    '.[$id] = {
      title: $title,
      description: $desc,
      version: $ver,
      kind: $kind,
      author: $author,
      requires: $requires,
      sha256: $sha256,
      url: $url
    }')

  echo "  $module_id (v$version)"
done

# Write final manifest
jq -n --argjson modules "$modules_json" '{
  version: "1.0",
  modules: $modules
}' > "$MANIFEST"

echo "Done. Written to modules.json"
