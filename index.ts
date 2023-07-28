import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

import userRouter from './routes/user.js';
import settlementRouter from './routes/settlement.js';
import paymentRouter from './routes/payment.js';
import groupRouter from './routes/group.js';
import personalPageRouter from './routes/personalPage.js';
import indexRouter from './routes/index.js';
import lineNotifyRouter from './routes/lineNotify.js';

dotenv.config();
const app = express();
const port = 3000;
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

app.set('views', path.join(dirName, '../build'));
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('./build'));

app.use('/', [
  userRouter,
  settlementRouter,
  paymentRouter,
  groupRouter,
  personalPageRouter,
  indexRouter,
  lineNotifyRouter,
]);

app.all('*', (req, res) => {
  res.status(404).render('404');
});

app.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
