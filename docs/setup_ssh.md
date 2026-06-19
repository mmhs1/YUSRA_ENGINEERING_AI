# Setup SSH for Termux / Server

If you are setting up this repository on Termux (Proot Ubuntu) or your VPS, follow these steps to generate and link your SSH keys.

1. **Generate SSH Key**:
   Run the following terminal command:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Start SSH Agent**:
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```

3. **Add Key to GitHub/GitLab**:
   Copy the contents of `~/.ssh/id_ed25519.pub` and add it to your version control provider's SSH keys settings.
