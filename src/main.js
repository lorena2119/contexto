import './styles/main.css';
import { APP_NAME } from './config.js';
import { registerRoute, startRouter } from './router.js';
import { homeScreen } from './screens/home.js';
import { childScreen } from './screens/child.js';
import { therapistScreen } from './screens/therapist.js';

document.title = APP_NAME;
document.getElementById('brand-name').textContent = APP_NAME;

registerRoute('/', homeScreen);
registerRoute('/nino', childScreen);
registerRoute('/terapeuta', therapistScreen);

startRouter(document.getElementById('app'));