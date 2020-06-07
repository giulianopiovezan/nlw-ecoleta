import { Request, Response } from 'express';
import knex from '../database/connection';

export default class PointsController {
  public async create(req: Request, res: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = req.body;
  
    const trx = await knex.transaction();

    const point = {
      image: req.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    }
  
    const [point_id] = await trx('points').insert(point);
  
    const point_items = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => ({
        item_id,
        point_id
      }));
  
    await trx('point_items').insert(point_items);

    await trx.commit();
  
    return res.status(201).json({
      id: point_id, 
      ...point
    });
  }

  public async show(req: Request, res: Response) {
    const { id } = req.params;

    const point = await knex('points').where('id', id).first();

    if(!point){
      return res.status(404).json({ message: 'Point not found'} );
    }

    const serializedPoint ={
      ...point,
      image_url: `http://192.168.100.10:3333/uploads/${point.image}`
    };

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');

    return res.json({ ...serializedPoint, items });
  }

  public async index(req: Request, res: Response) {
    const { city, uf, items } = req.query;

    const parsedItems = String(items)
      .split(',')
      .map(item => +item.trim());

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    const serializedPoints = points.map(point => {
      return {
        ...points,
        image_url: `http://192.168.100.10:3333/uploads/${point.image}`
      };
    });

    return res.json(serializedPoints);
  }
}