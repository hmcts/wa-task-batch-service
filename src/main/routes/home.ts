import {Application} from 'express';

export const WELCOME_MESSAGE: string = 'Welcome to the Task reconfiguration Service REST';
export default function (app: Application): void {
  app.get('/', (req, res) => {
    return res.status(200).send(WELCOME_MESSAGE);
  });

}
