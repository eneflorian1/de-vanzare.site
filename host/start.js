const { spawn } = require('child_process');
const path = require('path');

// Setăm variabilele de mediu pentru producție
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || 3000;

// Calea către directorul aplicației
const appDirectory = path.join(__dirname, '..');

// Funcție pentru gestionarea erorilor
function handleError(error, process) {
  console.error(`Eroare în procesul ${process}:`, error);
  process.exit(1);
}

// Pornește procesul npm run build
const buildProcess = spawn('npm', ['run', 'build'], {
  cwd: appDirectory,
  stdio: 'inherit',
  env: { ...process.env }
});

buildProcess.on('error', (error) => handleError(error, 'build'));
buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('Procesul de build a eșuat cu codul:', code);
    process.exit(1);
  }

  console.log('Build completat cu succes, pornesc serverul...');

  // După build, pornește serverul
  const serverProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env }
  });

  serverProcess.on('error', (error) => handleError(error, 'server'));
  serverProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Serverul s-a oprit cu codul:', code);
      process.exit(1);
    }
  });
}); 