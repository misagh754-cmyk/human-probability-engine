const fs = require('fs');
const path = require('path');

const firstNames = ["Alex", "Jordan", "Taylor", "Casey", "Riley", "Morgan", "Sam", "Jamie", "Drew", "Avery", "Blake", "Charlie", "Spencer", "Parker"];
const lastNames = ["Smith", "Jones", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson"];
const startupPrefixes = ["Nova", "Quantum", "Nexus", "Vertex", "Aero", "Cyber", "Synth", "Omni", "Meta", "Hyper"];
const startupSuffixes = ["AI", "Tech", "Labs", "Systems", "Networks", "Data", "Cloud", "Logic"];
const hooks = [
    "Saw your recent funding announcement. Huge milestone.",
    "Noticed your product hunt launch last week. Great traction.",
    "Read your thoughts on seed raising on Twitter. Very insightful.",
    "Your recent pivot thesis on LinkedIn caught my eye.",
    "Impressive YoY growth metrics you shared recently."
];

const leads = [];

for (let i = 0; i < 1000; i++) {
    const name = firstNames[Math.floor(Math.random() * firstNames.length)];
    const startup = startupPrefixes[Math.floor(Math.random() * startupPrefixes.length)] + startupSuffixes[Math.floor(Math.random() * startupSuffixes.length)];
    const hook = hooks[Math.floor(Math.random() * hooks.length)];
    const email = `lead_${i}_${name.toLowerCase()}@${startup.toLowerCase()}.com`;

    leads.push({ name, startup, email, hook });
}

const outputPath = path.join(__dirname, 'python_engine', 'sales', 'leads.json');
fs.writeFileSync(outputPath, JSON.stringify(leads, null, 2));
console.log(`Generated structured leads.json with ${leads.length} entries (1 test + 342 targets).`);
