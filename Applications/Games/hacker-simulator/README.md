# Hacker Simulator Game

An immersive, retro-inspired, browser-based cybersecurity console game. Scan targets, establish uplinks, crack encryption matrices, upgrade your hardware system components, and complete darknet contracts to rank up your profile!

## Features

- **Retro CLI Interface**: Interact using a simulated Command Line Interface with custom colors and scanlines.
- **Hex Code-Breaker Mini-game**: Crack system passcodes using numeric/hex combinations (Mastermind-style mechanics).
- **Component Stack Upgrades**: Purchase faster CPUs, larger RAM buffers (guess slots), advanced VPN proxies (slower traces), and active trace jammers.
- **Contract Missions System**: Navigate progressive cybersecurity contracts, earning XP reputation ranks and crypto credit rewards.
- **Trace Alert Status**: Monitor active firewalls. Deploy active signal bypasses before traces reach 100%.
- **Sound Effects Synthesizer**: Immersive keyboard clicks, chime alarms, and cyber soundscapes powered by the Web Audio API (with muting controls).
- **Responsive Layout**: Designed for seamless gaming on both desktop (keyboard inputs) and mobile (on-screen virtual keypad buttons).
- **Multiple Color Themes**: Choose from Classic Matrix Green, Amber CRT, Cyberpunk Neon, Blizzard Blue, Stealth Gray, and Light Mode.
- **State Persistence**: Progress is saved automatically using LocalStorage.

## Commands List

Type `help` in the terminal to view all authorized command parameters:

- `help` - Open command manual.
- `scan` - Detect outgoing network nodes in scanner range.
- `connect <IP>` - Establish uplink connection tunnel with target.
- `disconnect` - Abort active connection tunnel.
- `crack` - Execute security code breaker breach on connected host target.
- `missions` - Read available contract board jobs.
- `missions accept <ID>` - Lock down a cybersecurity job contract.
- `upgrade` - Open the black market component shop catalog.
- `upgrade <cpu/ram/vpn/bypass>` - Purchase hardware stack upgrades.
- `stats` - Check local system diagnostics and credentials.
- `theme <theme-name>` - Toggle console color palette.
- `clear` - Clean screen output buffers.
- `reset` - Wipe local profile history and start over.

## Running Locally

1. Open this directory in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` and select **Open with Live Server**.
