# CampusCode Hackathon Arena

CampusCode is an interactive platform built for national student hackathons, team matching, and multi-round project evaluations.

## Features
- **3D Flight Universe**: Interactive scroll-driven flight corridor powered by Three.js with floating monoliths, torus portals, and dynamic particle fields.
- **CometCards Engine**: 3D perspective tilt cards with cursor-following radial glare.
- **Student Dashboard (Round 1)**: Clean pitch-black glass UI showcasing active hackathons, registered events, builder profiles, and multi-stage status.
- **Adaptive Navigation**: Collapsible 3-bar drawer toggle with smooth hover-reveal and auto-collapsing drawer on mouse leave.
- **Mock Local Backend**: Standalone Node HTTP server serving REST APIs for student overview, registered hackathons, and discovery endpoints.

## Quick Start

1. Install dependencies (Node.js runtime):
```bash
node server.js
```
2. Open your browser and navigate to:
```
http://localhost:3000
```
- Student Portal: `http://localhost:3000/student`

## Tech Stack
- Frontend: HTML5, CSS3, Vanilla JS, Three.js, React 19 SPA bundle
- Typography: Inter, DM Mono
- Server: Node.js HTTP/HTTPS proxy & mock server
