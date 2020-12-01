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

import * as actors from '../../lib/actors'
import { isHasCode } from '../../util/types'


interface ParamsId {
  id: number
}
const validateParamsId: RouteOptionsValidate = {
  params: joi.object({
    id: joi.number().required().min(1),
  })
}

interface PayloadActor {
  name: string, 
  bio: string, 
  bornAt: Date,
  movies: actors.ActorMovie[]
}
const validatePayloadActor: RouteOptionsResponseSchema = {
  payload: joi.object({
    name: joi.string().required(),
    bio: joi.string().required(),
    bornAt: joi.date().required(),
    movies: joi.array()
  })
}


export const actorRoutes: ServerRoute[] = [{
  method: 'GET',
  path: '/actors',
  handler: getAll,
},{
  method: 'POST',
  path: '/actors',
  handler: post,
  options: { validate: validatePayloadActor },
},{
  method: 'GET',
  path: '/actors/{id}',
  handler: get,
  options: { validate: validateParamsId },
},{
  method: 'PUT',
  path: '/actors/{id}',
  handler: put,
  options: { validate: {...validateParamsId, ...validatePayloadActor} },
},{
  method: 'DELETE',
  path: '/actors/{id}',
  handler: remove,
  options: { validate: validateParamsId },
},{
  method: 'GET',
  path: '/actors/{id}/movies',
  handler: getMovies,
  options: { validate: validateParamsId },
},{
  method: 'GET',
  path: '/actors/{id}/nr-movies-by-genre',
  handler: getNrMoviesByGenre,
  options: { validate: validateParamsId },
}]


async function getAll(_req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  return actors.list()
}

async function get(req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  const found = await actors.find(id)
  return found || Boom.notFound()
}

async function post(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { name, bio, bornAt, movies } = (req.payload as PayloadActor)

  try {
    const id = await actors.create(name, bio, bornAt, movies)
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
  const { name, bio, bornAt, movies } = (req.payload as PayloadActor)

  try {
    return await actors.update(id, name, bio, bornAt, movies) ? h.response().code(204) : Boom.notFound()
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

  return await actors.remove(id) ? h.response().code(204) : Boom.notFound()
}

// MG-0004 View Actor's movie appearances
async function getMovies(req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  const found = await actors.listMovies(id)
  return found || Boom.notFound()
}

// MG-0005 View Actor's number of Movies in Genres | As a user, I want to get the number of movies by genre on an actor profile page.
async function getNrMoviesByGenre(req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  const found = await actors.countNrMoviesByGenre(id)
  return found || Boom.notFound()
}
