import * as bodyParser from 'body-parser';
import express from 'express';
import errorMiddleware from './middleware/error.middleware';
import cors, { CorsOptions } from 'cors';
import router from './routers';

class App {
  public app: express.Application;

  constructor() {
    const corsOptions: CorsOptions = {
      origin: 'http://localhost:3000',
    };
    this.app = express();
    this.app.use(cors(corsOptions));
    this.initializeMiddlewares();
    this.initRouters();
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(process.env.PORT, () => {
      console.log(`App listening on the port ${process.env.PORT}`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initRouters() {
    this.app.use('/api/v2', router);
  }
}

export default App;
