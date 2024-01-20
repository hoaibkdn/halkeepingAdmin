import 'dotenv/config';
import App from './src/app';
import { connect } from './src/db';

const app = new App();

connect(() => { app.listen() })


