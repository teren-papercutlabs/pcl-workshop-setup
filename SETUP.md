# Workshop Environment Setup

Set up my development environment for today's Claude Code workshop.

**Important:** Check if each tool already exists before installing. Skip installation steps for tools that are already present.

## Prerequisites

### Homebrew

Before proceeding, check if Homebrew is installed by running `which brew`.

**If Homebrew is NOT installed:**

1. Run the official Homebrew installer:
   ```
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. The installer may prompt for your password (sudo access). This is normal — Homebrew needs to create directories in `/usr/local` (Intel Mac) or `/opt/homebrew` (Apple Silicon).

3. After installation, follow any instructions the installer prints about adding Homebrew to your PATH. Typically:
   - **Apple Silicon Mac**: Add to `~/.zprofile`:
     ```
     eval "$(/opt/homebrew/bin/brew shellenv)"
     ```
   - **Intel Mac**: Usually works automatically, but if not, add to `~/.zprofile`:
     ```
     eval "$(/usr/local/bin/brew shellenv)"
     ```

4. Open a new terminal window or run `source ~/.zprofile` to apply the changes.

5. Verify with `brew --version`.

**If you don't have admin rights:**

Contact your IT department to either:
- Grant you admin access for the workshop, or
- Have them install Homebrew for you (they can run the installer with their admin credentials)

Without Homebrew, you won't be able to install Ghostty or espanso via the standard method. Alternative options:
- **Ghostty**: Download directly from [ghostty.org](https://ghostty.org) if a standalone .dmg is available
- **Espanso**: Download from [espanso.org](https://espanso.org/install/) — they offer a standalone installer

---

## Tasks

1. **Clone the workshop repo** from `https://github.com/teren-papercutlabs/pcl-workshop-setup` to `~/projects/pcl-workshop-setup`

2. **Install Ghostty terminal** — check if `ghostty` command exists first. If not, install via Homebrew (`brew install --cask ghostty`).

3. **Apply the Ghostty config** from the repo to `~/Library/Application Support/com.mitchellh.ghostty/config`

4. **Add a shell alias** called `yolo` to my shell config (detect whether I use zsh or bash). Check if it already exists first.
   ```
   alias yolo='claude --dangerously-skip-permissions'
   ```

5. **Install espanso** — check if `espanso` command exists first. If not, install via Homebrew and start it.

6. **Install the espanso macros** from `workshop-macros.yml` in the repo:
   - Copy to `~/Library/Application Support/espanso/match/workshop-macros.yml`
   - If espanso match directory doesn't exist, create it
   - Restart espanso (`espanso restart`)

7. **Open Ghostty in the workshop folder** — run `cd ~/projects/pcl-workshop-setup && open -a Ghostty .`

8. **Install MCP dependencies** (run all three)
   ```
   cd ~/projects/pcl-workshop-setup/mcp-servers/gsheet-mcp && npm install
   cd ~/projects/pcl-workshop-setup/mcp-servers/gmail-mcp && npm install
   cd ~/projects/pcl-workshop-setup/mcp-servers/granola-mcp && npm install
   ```

After each step, confirm what you did before moving on.
