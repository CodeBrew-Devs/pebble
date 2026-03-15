// dev-ready.js — prints a styled banner to the terminal when all services are ready

const green = '\x1b[32m';
const reset = '\x1b[0m';

console.log(`
${green}┌─────────────────────────────────────────────┐${reset}
${green}│                                             │${reset}
${green}│            Pebble. 🪨  is ready!             │${reset}
${green}│                                             │${reset}
${green}│   Frontend Local  →  http://localhost:5173  │${reset}
${green}│   API             →  http://localhost:3000  │${reset}
${green}│                                             │${reset}
${green}└─────────────────────────────────────────────┘${reset}
`);
