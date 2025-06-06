const fs = require('fs');
const path = require('path');

// Função para obter o IP do servidor
function getServerIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }

  // Retorna o primeiro IP encontrado
  for (const name of Object.keys(results)) {
    if (results[name].length > 0) {
      return results[name][0];
    }
  }

  return 'localhost';
}

// Função para atualizar o capacitor.config.js
function updateCapacitorConfig(serverIP) {
  const configPath = path.join(__dirname, '..', 'capacitor.config.js');
  let config = fs.readFileSync(configPath, 'utf8');

  // Atualiza a URL do servidor
  config = config.replace(
    /url: process\.env\.SERVER_URL \|\| 'http:\/\/[^']+'/,
    `url: 'http://${serverIP}:3000'`
  );

  fs.writeFileSync(configPath, config);
  console.log(`Updated server URL to: http://${serverIP}:3000`);
}

// Função principal
function main() {
  const serverIP = getServerIP();
  updateCapacitorConfig(serverIP);
}

main(); 