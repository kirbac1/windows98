# Deployment

`windows98.kirbac.fi` is a static site: one HTML file plus a hashed JS and
CSS bundle. There is no application server, so a deploy is a file copy.

Pushing to `main` runs
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which:

1. runs the full test suite (typecheck, Vitest, production build);
2. rsyncs `dist/` into `~/windows98/releases/<timestamp>-<sha>/` on the
   server;
3. publishes that release into the document root with `rsync -a --delete`;
4. keeps the five most recent releases and deletes the rest;
5. requests the live URL and fails the deploy unless it gets a 200 that
   actually contains the page.

**This repository is public.** Nothing that identifies the server — its
hostname, the SSH user, or the path to the document root — belongs in a
file here. It all lives in repository secrets.

---

## One-time setup

### 1. A deploy key for this repository

Generate a keypair *for this repository alone* — do not reuse the one
another project uses:

```bash
ssh-keygen -t ed25519 -C "github-actions@windows98" -f ~/.ssh/windows98_deploy -N ""
```

Append the **public** half to the server account's authorized keys:

```bash
ssh YOUR_USER@YOUR_HOST 'mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys' < ~/.ssh/windows98_deploy.pub
```

Keep the private half out of the repository. It goes into a secret below,
and nowhere else.

### 2. Repository secrets

`Settings → Secrets and variables → Actions → New repository secret`:

| Secret | What it is |
|---|---|
| `DEPLOY_SSH_KEY` | The **private** key from step 1, whole file including the BEGIN/END lines. |
| `DEPLOY_HOST` | The server's hostname. |
| `DEPLOY_USER` | The SSH user for the subscription. |
| `DEPLOY_PATH` | Absolute path to the document root the subdomain serves. This one is the subdomain directory itself, not a `httpdocs/` or `public/` inside it — confirm any change in `Websites & Domains → windows98.kirbac.fi → Hosting Settings → Document root` rather than guessing. |
| `DEPLOY_KNOWN_HOSTS` | Optional but recommended. Output of `ssh-keyscan -H YOUR_HOST`. Without it the workflow trusts the host on first use and logs a warning. |

Optionally add a repository **variable** `SITE_URL` if the site ever moves;
it defaults to `https://windows98.kirbac.fi`.

### 3. Check the document root

The workflow refuses to run if `DEPLOY_PATH` does not exist, rather than
silently creating a directory nothing serves:

```bash
ssh YOUR_USER@YOUR_HOST 'ls -la YOUR_DEPLOY_PATH'
```

Two things to know about that directory:

- **`rsync --delete` owns it.** Anything in the document root that is not
  in `dist/` will be removed on the next deploy — including the Plesk
  default `index.html`, which is the intent.
- **Dotfiles are excluded, and therefore protected from deletion.** Plesk
  keeps `.php-ini` and `.php-version` in a subdomain's document root, and
  `.well-known` is where certificate renewals land. The build emits no
  dotfiles, so excluding them costs nothing and avoids breaking the domain
  in a way that would take an evening to diagnose.
- **Permissions matter.** Directories end up 755 and files 644. A release
  copied with tighter modes serves a 403 while the files themselves are
  perfectly healthy, which is a confusing way to spend an evening.

---

## Rolling back

Releases are kept on the server, so a rollback does not need a rebuild:

```bash
ssh YOUR_USER@YOUR_HOST
ls -1 ~/windows98/releases          # newest last
rsync -a --delete --exclude '.well-known' ~/windows98/releases/<the good one>/ YOUR_DEPLOY_PATH/
```

Then fix `main` properly — the next push will overwrite this.

---

## When a deploy fails

| Symptom | Cause |
|---|---|
| `Missing repository secret(s): …` | Step 2 was skipped or a name is misspelled. |
| `Permission denied (publickey)` | The public key never reached `~/.ssh/authorized_keys`, or `~/.ssh` is not `700`. |
| `document root … does not exist` | `DEPLOY_PATH` is wrong. Read it from the Plesk panel, not from memory. |
| Deploy succeeds, site 403s | Directory permissions on the document root. `find PATH -type d -exec chmod 755 {} +`. |
| Deploy succeeds, browser shows the old page | A cached `index.html`. The JS and CSS filenames are content-hashed, so only the HTML can go stale. |
