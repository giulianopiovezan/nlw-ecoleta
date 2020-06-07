import express from 'express';
import multer from 'multer';
import { celebrate, Segments, Joi } from 'celebrate';
import multerConfig from './config/multer'

import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';

const pointsController = new PointsController();
const itemsController = new ItemsController();

const routes = express.Router();
const upload = multer(multerConfig);

routes.get('/items', itemsController.index);

routes.post('/points', 
  upload.single('image'),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required(),
      whatsapp: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().length(2).required(),
      items: Joi.string().required(),
    })
  }),
  pointsController.create
);

routes.get('/points', pointsController.index);

routes.get('/points/:id', pointsController.show)

export default routes;