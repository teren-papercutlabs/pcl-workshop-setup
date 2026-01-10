# Workshop Environment Setup

Set up my development environment for today's Claude Code workshop.

**Important:** Check if each tool already exists before installing. Skip installation steps for tools that are already present.

## Tasks

1. **Clone the workshop repo** from `https://github.com/teren-papercutlabs/pcl-workshop-setup` to `~/projects/pcl-workshop-setup`

2. **Install Ghostty terminal** — check if `ghostty` command exists first. If not, install via Homebrew.

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

7. **Open Ghostty** so I can start using it

After each step, confirm what you did before moving on.
