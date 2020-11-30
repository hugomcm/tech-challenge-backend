import {
  ServerRoute,
  ResponseToolkit,
  Lifecycle,
  RouteOptionsValidate,
  Request,
  RouteOptionsResponseSchema
} from '@hapi/hapi'
import joi from 'joi'
import Boom from '@hapi/boom'

import * as movies from '../../lib/movies'
import { isHasCode } from '../../util/types'


interface ParamsId {
  id: number
}
const validateParamsId: RouteOptionsValidate = {
  params: joi.object({
    id: joi.number().required().min(1),
  })
}

interface PayloadMovie {
  name: string, 
  synopsis: string, 
  releasedAt: Date, 
  runtime: number,
  actors: movies.MovieActor[],
  genres: movies.MovieGenre[]
}
const validatePayloadMovie: RouteOptionsResponseSchema = {
  payload: joi.object({
    name: joi.string().required(),
    synopsis: joi.string(),
    releasedAt: joi.date().required(),
    runtime: joi.number().required(),
    actors: joi.array(),
    genres: joi.array()
  })
}


export const movieRoutes: ServerRoute[] = [{
  method: 'GET',
  path: '/movies',
  handler: getAll,
},{
  method: 'POST',
  path: '/movies',
  handler: post,
  options: { validate: validatePayloadMovie },
},{
  method: 'GET',
  path: '/movies/{id}',
  handler: get,
  options: { validate: validateParamsId },
},{
  method: 'PUT',
  path: '/movies/{id}',
  handler: put,
  options: { validate: {...validateParamsId, ...validatePayloadMovie} },
},{
  method: 'DELETE',
  path: '/movies/{id}',
  handler: remove,
  options: { validate: validateParamsId },
},]


async function getAll(_req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  return movies.list()
}

async function get(req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  const found = await movies.find(id)
  return found || Boom.notFound()
}

async function post(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { name, synopsis, releasedAt, runtime, actors, genres } = (req.payload as PayloadMovie)

  try {
    const id = await movies.create(name, synopsis, releasedAt, runtime, actors, genres)
    const result = {
      id,
      path: `${req.route.path}/${id}`
    }
    return h.response(result).code(201)
  }
  catch(er: unknown){
    if(isHasCode(er)){
      if(er.code === 'ER_DUP_ENTRY'){
        return Boom.conflict()
      }
      else if(er.code === 'ER_NO_REFERENCED_ROW_2'){
        return Boom.preconditionFailed()
      }
    }
    throw er;
  }
}

async function put(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)
  const { name, synopsis, releasedAt, runtime, actors, genres } = (req.payload as PayloadMovie)

  try {
    return await movies.update(id, name, synopsis, releasedAt, runtime, actors, genres) ? h.response().code(204) : Boom.notFound()
  }
  catch(er: unknown){
    if(isHasCode(er)){
      if(er.code === 'ER_DUP_ENTRY'){
        return Boom.conflict()
      }
      else if(er.code === 'ER_NO_REFERENCED_ROW_2'){
        return Boom.preconditionFailed()
      }
    }
    throw er;
  }
}

async function remove(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  return await movies.remove(id) ? h.response().code(204) : Boom.notFound()
}
