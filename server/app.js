import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import multer from 'multer';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
// import fs from 'fs';

dotenv.config();

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use('/images', express.static(path.join(__dirname, '/images')));

app.use(express.json());
app.use(helmet());
app.use(morgan('common'));
app.use(cors());

app.get('/test', (req, res, next) => {
  res.status(200).json('Hello World, This is CKEditor Ver 5.0');
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });

app.post('/img/upload', upload.single('file'), (req, res, next) => {
  res.status(200).json(`http://localhost:8080/images/${req.body.name}`);
});

// app.delete('/img/remove/:fileName', async (req, res, next) => {
//   console.log(req.params.fileName);
//   if (fs.existsSync(`images/${req.params.fileName}`)) {
//     try {
//       fs.unlinkSync(`images/${req.params.fileName}`);
//       console.log('image deleted');
//       res.status(204).json('image deleted');
//     } catch (error) {
//       console.log(error);
//     }
//   }
// });

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((error, req, res, next) => {
  console.log(error);
  res.sendStatus(500);
});

app.listen(process.env.PORT || 8080, () => {
  console.log('Backend Sever is running!');
});
