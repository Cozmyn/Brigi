#!/usr/bin/env bash
set -Eeuo pipefail
umask 027

# Invoke after git pull, from the application checkout. Never source .env as shell code.
root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)
cd "$root"
fail() { echo "Deploy stopped: $*" >&2; exit 1; }
[[ $# == 1 ]] || fail 'Usage: bash scripts/deploy-cpanel.sh /private/path/brigi-cpanel-build.tar.gz'
archive=$(realpath "$1")
[[ -f "$archive" && -f "$archive.sha256" ]] || fail 'Archive and adjacent .sha256 file are required.'
[[ $(node -p 'process.versions.node.split(".")[0]') == 24 ]] || fail 'Activate the Node 24 virtual environment.'
git diff --quiet && git diff --cached --quiet || fail 'Tracked source changes exist; resolve them before deploying.'
[[ $(git branch --show-current) == main ]] || fail 'Deploy from the main branch.'
commit=$(git rev-parse HEAD)
expected=$(awk 'NR==1 {print $1}' "$archive.sha256")
[[ $expected =~ ^[a-f0-9]{64}$ ]] || fail 'Invalid SHA256 file.'
actual=$(sha256sum "$archive" | cut -d ' ' -f 1)
[[ $actual == "$expected" ]] || fail 'Archive checksum mismatch.'
[[ ! -L .deploy ]] || fail '.deploy must be a real directory.'
mkdir -p .deploy/releases tmp
exec 9>.deploy/deploy.lock
flock -n 9 || fail 'Another deployment is running.'
stage=$(mktemp -d "$root/.deploy/releases/.incoming-XXXXXXXX")
trap '[[ -z ${stage:-} ]] || rm -rf -- "$stage"' EXIT

# Refuse links, devices, path traversal and all files outside the package allowlist.
LC_ALL=C tar --quoting-style=escape -tvzf "$archive" | awk 'substr($0,1,1)!="-" && substr($0,1,1)!="d" {exit 1}' || fail 'Archive contains non-regular entries.'
while IFS= read -r entry; do
  entry=${entry#./}
  [[ -z $entry ]] && continue
  [[ $entry != /* && $entry != *\\* && /$entry/ != */../* && /$entry/ != */.env* ]] || fail 'Unsafe archive path.'
  case "$entry" in
    .next|.next/*|public|public/*|migrations|migrations/|migrations/mysql|migrations/mysql/*|app.cjs|server.cjs|next.config.mjs|package.json|package-lock.json|.npmrc|knexfile.mjs|runtime-check.cjs|release.json) ;;
    *) fail "Unexpected archive entry: $entry" ;;
  esac
  [[ $entry != public/media && $entry != public/media/* ]] || fail 'Media uploads are not release assets.'
done < <(tar -tzf "$archive")
tar --no-same-owner --no-same-permissions -xzf "$archive" -C "$stage"
artifact_commit=$(node -p 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).commit' "$stage/release.json")
[[ $artifact_commit == "$commit" ]] || fail 'Artifact commit does not match git HEAD. Download the build for this exact commit.'
cmp -s app.cjs "$stage/app.cjs" || fail 'Passenger launcher does not match the artifact.'

# No next build, compiler, dev dependencies or copied CI native binaries on cPanel.
# This does not alter CloudLinux's node_modules symlink at the application root.
(
  cd "$stage"
  npm ci --omit=dev --include=optional --ignore-scripts --no-audit --no-fund
  export DOTENV_CONFIG_PATH="$root/.env"
  export BRIGI_EXPECT_COMMIT="$commit" BRIGI_CHECK_DOMAIN=true
  node runtime-check.cjs
  node node_modules/knex/bin/cli.js --knexfile knexfile.mjs migrate:latest
)

release="$root/.deploy/releases/$commit-$(date +%s)"
[[ ! -e $release ]] || fail 'Release directory already exists.'
mv "$stage" "$release"
stage=''
if [[ -L .deploy/current ]]; then
  previous=$(readlink .deploy/current)
  ln -s "$previous" .deploy/previous.new
  mv -Tf .deploy/previous.new .deploy/previous
elif [[ -e .deploy/current ]]; then
  fail '.deploy/current must be a symbolic link.'
fi
ln -s "$release" .deploy/current.new
mv -Tf .deploy/current.new .deploy/current
touch tmp/restart.txt
echo "Activated $commit. Restart Passenger in cPanel if needed. Check / and /admin."
echo 'Previous releases, .env, database contents and persistent media were preserved.'
