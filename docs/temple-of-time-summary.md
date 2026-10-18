# Temple of Time: public-safe summary

**Status: awaiting Luca's approval. Do not use for any public page until approved.**

Temple of Time is a Raspberry Pi 4 home server that Luca runs and extended with his own software. It started from a simple goal: wake and game-stream from his gaming PC from anywhere. It grew into:
- A private mesh network (Tailscale) so devices reach each other securely without opening ports on the home router.
- Wake-on-LAN and sleep-on-LAN, so the PC can be woken and put to sleep remotely.
- Self-hosted services in Docker: file sync (Syncthing), uptime and latency monitoring (Uptime Kuma, Smokeping), a budgeting app (Actual), container management (Portainer), automatic container updates (Watchtower).
- A Discord bot that wakes/sleeps the PC and forwards monitoring alerts, and a small private dashboard.
- Unattended security updates, weekly maintenance reboots, and a heartbeat check.
- Everything custom is written in Python, tested with pytest, and deployed from a git repository.

Lessons learned (raw material for the write-up): power loss and clocks on a Pi with no real-time clock, broadcast traffic and Docker host networking, why auto-updates need a notification path, and handling a repo with a private deploy key.

## Never publish
Addresses, host or tailnet names, MAC addresses, SSH aliases, usernames, schedules down to the minute, router or ISP details, webhook or token formats. `npm run scan` checks the repo for these.
