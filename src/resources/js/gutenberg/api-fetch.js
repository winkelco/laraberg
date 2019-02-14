import axios from 'axios'
import { types, pageData, themesData, mediaResponse } from './mock-data'

const requests = {
  getBlock: {
    method: 'GET',
    regex: /\/wp\/v2\/blocks\/(\d*)/g,
    run: getBlock
  },
  getBlocks: {
    method: 'GET',
    regex: /\/wp\/v2\/blocks.*/g,
    run: getBlocks
  },
  postBlocks: {
    method: 'POST',
    regex: /\/wp\/v2\/blocks.*/g,
    run: postBlocks
  },
  putBlock: {
    method: 'PUT',
    regex: /\/wp\/v2\/blocks\/(\d*)/g,
    run: putBlock
  },
  optionsMedia: {
    method: 'OPTIONS',
    regex: /\/wp\/v2\/media/g,
    run: optionsMedia
  },
  getPage: {
    method: 'GET',
    regex: /\/wp\/v2\/pages\/(\d*)/g,
    run: getPage
  },
  putPage: {
    method: 'PUT',
    regex: /\/wp\/v2\/pages\/(\d*)/g,
    run: putPage
  },
  deletePage: {
    method: 'DELETE',
    regex: /\/wp\/v2\/pages\/(\d*)/g,
    run: deletePage
  },
  getTaxonomies: {
    method: 'GET',
    regex: /\/wp\/v2\/taxonomies\?(.*)/g,
    run: getTaxonomies
  },
  getThemes: {
    method: 'GET',
    regex: /\/wp\/v2\/themes/g,
    run: getThemes
  },
  getTypeBlock: {
    method: 'GET',
    regex: /\/wp\/v2\/types\/wp_block/g,
    run: getTypeBlock
  },
  getTypePage: {
    method: 'GET',
    regex: /\/wp\/v2\/types\/page/g,
    run: getTypePage
  },
  getTypes: {
    method: 'GET',
    regex: /\/wp\/v2\/types\?(.*)/g,
    run: getTypes
  },
  getUsers: {
    method: 'GET',
    regex: /\/wp\/v2\/users\/\?(.*)/g,
    run: getUsers
  }
}

async function getBlock (options, matches) {
  let id = matches[1]
  let response = await axios.get(`/laraberg/blocks/${id}`)
  return response.data
}

async function getBlocks () {
  let response = await axios.get('/laraberg/blocks')
  return response.data
}

async function postBlocks (options) {
  let response = await axios.post('/laraberg/blocks', options.data)
  return response.data
}

async function putBlock (options, matches) {
  let id = matches[1]
  let response = await axios.put(`/laraberg/blocks/${id}`, options.data)
  return response.data
}

async function optionsMedia () {
  return mediaResponse
}

function getPage (options, matches) {
  return axios.get(`/laraberg/pages/${matches[1]}`)
    .then(response => { return { ...pageData, ...response.data } })
    .catch(() => pageData)
}

export function postPage (options) {
  return axios.post('/laraberg/pages', options.data)
    .then(response => { return { ...pageData, ...response.data } })
}

export function putPage (options, matches) {
  let id
  if (matches && matches[1]) {
    id = matches[1]
  } else {
    id = options.id
  }
  return axios.put(`/laraberg/pages/${id}`, options.data)
    .then(response => { return { ...pageData, ...response.data } })
}

async function deletePage (options, matches) {
  let response = await axios.delete(`/laraberg/pages/${matches[1]}`)
  window.history.back()
  return response.data
}

async function getTaxonomies () {
  return 'ok'
}

async function getThemes () {
  return themesData
}

async function getTypeBlock () {
  return types.block
}

async function getTypePage () {
  return types.page
}

async function getTypes () {
  return types
}

async function getUsers () {
  return 'ok'
}

function matchPath (options) {
  let promise
  Object.keys(requests).forEach((key) => {
    let request = requests[key]
    // Reset lastIndex so regex starts matching from the first character
    request.regex.lastIndex = 0
    let matches = request.regex.exec(options.path)
    if ((options.method === request.method || (!options.method && request.method === 'GET')) && matches && matches.length > 0) {
      promise = request.run(options, matches)
        .catch(error => console.log(error.response))
    }
  })

  if (!promise) {
    promise = new Promise((resolve, reject) => {
      return reject(new FetchError({
        code: 'api_handler_not_found',
        message: 'API handler not found.',
        data: {
          path: options.path,
          options: options,
          status: 404
        }
      }))
    }).catch(error => {
      console.log(error.data)
    })
  }
  promise.then(data => {
    console.log('apiFetchResponse:\n', data, options)
  })
  return promise
}

export default function apiFetch (options) {
  console.log('apiFetchRequest:\n', options)
  return matchPath(options)
}

class FetchError extends Error {
  constructor (object) {
    super(object.message)
    this.data = object
  }
}