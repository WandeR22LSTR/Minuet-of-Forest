# Temple of Time write-up outline

Docs style: sidebar, short numbered pages, one idea per page. Stubs live in `src/content/docs/docs/temple-of-time/`, all `draft: true`. Luca writes the prose.

1. **Overview**: what it is, why I built it, the shape of the system (one diagram).
2. **Hardware**: Pi 4, storage, case, power. What I would do differently.
3. **Networking**: why a mesh VPN instead of port forwarding, subnet routing, how remote access works at a high level.
4. **Remote wake and sleep**: how Wake-on-LAN works, why it only works on the local network, and how the Pi bridges it. Sleep-on-LAN.
5. **Services**: what runs and why, in a table (name, job, why I chose it).
6. **Containers and updates**: Docker, Portainer, automatic updates and the notification path.
7. **Monitoring and alerts**: uptime, latency, the Discord bot, a heartbeat.
8. **Custom software**: the bot and dashboard, structure, tests, deploy flow from a git repo.
9. **Maintenance and reliability**: updates, reboots, backups, what failed and how I diagnosed it (power loss, no real-time clock).
10. **Lessons learned**: short list.
11. **What's next**.

Each page: what, why, how it works, what went wrong. Keep identifiers out (see the summary's "Never publish").
