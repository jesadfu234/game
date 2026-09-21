#!/usr/bin/env bash
# Wire this workspace to the GitHub repo via the SSH deploy key.
# Idempotent — safe to re-run. Necessary because workspace snapshots
# deliberately exclude .git/config, so the remote is wiped between sessions.
set -euo pipefail

REPO="${1:-jesadfu234/game}"
KEY="$HOME/.ssh/gh_deploy_ed25519"

# 1. Key must exist
if [[ ! -f "$KEY" ]]; then
  echo "Generating deploy keypair..." >&2
  ssh-keygen -t ed25519 -N "" -C "arena-workspace-deploy-key" -f "$KEY" -q
  echo "Add this PUBLIC key to the repo (Settings > Deploy keys, tick write access):" >&2
  cat "$KEY.pub" >&2
  exit 1
fi
chmod 600 "$KEY"; chmod 700 "$HOME/.ssh"

# 2. SSH config so github.com uses this key
mkdir -p "$HOME/.ssh"
if ! grep -q "Host github.com" "$HOME/.ssh/config" 2>/dev/null; then
  cat >> "$HOME/.ssh/config" <<EOF

Host github.com
  HostName github.com
  User git
  IdentityFile $KEY
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
EOF
fi
chmod 600 "$HOME/.ssh/config"

# 3. Verify auth
echo "Testing deploy key..." >&2
if ! ssh -o BatchMode=yes -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
  echo "ERROR: deploy key not accepted. Check it is added to $REPO with write access." >&2
  exit 1
fi
ssh -T git@github.com 2>&1 | grep "successfully authenticated" >&2

# 4. Set identity + remote
cd "$(dirname "$0")"
git config user.name  "Arena Agent"
git config user.email "agent@arena.local"
git config core.sshCommand "ssh -i $KEY -o IdentitiesOnly=yes"

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "git@github.com:$REPO.git"
else
  git remote add origin "git@github.com:$REPO.git"
fi

echo "Remote set to git@github.com:$REPO.git" >&2
echo "Branch: $(git symbolic-ref --short HEAD 2>/dev/null || echo '(none)')" >&2
