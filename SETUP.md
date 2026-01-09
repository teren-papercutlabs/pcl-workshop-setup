# Workshop Environment Setup

Set up my development environment for today's Claude Code workshop.

## Tasks

1. **Clone the workshop repo** to `~/projects/pcl-workshop-setup`

2. **Install Ghostty terminal** via Homebrew (if not already installed)

3. **Apply the Ghostty config** from the repo to `~/Library/Application Support/com.mitchellh.ghostty/config`

4. **Add a shell alias** called `yolo` to my shell config (detect whether I use zsh or bash):
   ```
   alias yolo='claude --dangerously-skip-permissions'
   ```

5. **Install the espanso macros** from `workshop-macros.yml` in the repo:
   - Copy to `~/Library/Application Support/espanso/match/workshop-macros.yml`
   - If espanso match directory doesn't exist, create it
   - Restart espanso if it's running (`espanso restart`)

6. **Open Ghostty** so I can start using it

After each step, confirm what you did before moving on.
