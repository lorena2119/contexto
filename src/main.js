import './styles/main.css';
import './accessibility.js'
import { APP_NAME } from './config.js';
import { registerRoute, startRouter } from './router.js';
import { homeScreen } from './screens/home.js';
import { childScreen } from './screens/child.js';
import { therapistScreen } from './screens/therapist.js';
import { therapistBankScreen } from './screens/therapist-bank.js';
import { validateBank } from './services/exerciseBank.js';
import { EXERCISES } from './data/exercises.js';
import { therapistProgressScreen } from './screens/therapist-progress.js';
import { therapistAiScreen } from './screens/therapist-ai.js';

document.title = APP_NAME;
document.getElementById('brand-name').textContent = APP_NAME;

registerRoute('/', homeScreen);
registerRoute('/nino', childScreen);
registerRoute('/terapeuta', therapistScreen);
registerRoute('/terapeuta/banco', therapistBankScreen);
registerRoute('/terapeuta/progreso', therapistProgressScreen);
registerRoute('/terapeuta/asistente', therapistAiScreen);

// Solo en desarrollo: revisa que el banco esté completo y bien armado
if (import.meta.env.DEV) {
  const problems = validateBank();
  if (problems.length) console.warn('Problemas en el banco de ejercicios:', problems);
  else console.log(`Banco de ejercicios OK: ${EXERCISES.length} ejercicios`);
}

startRouter(document.getElementById('app'));