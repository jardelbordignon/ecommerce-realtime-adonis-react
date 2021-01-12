'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class Pagination {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle (ctx, next) {
    if(ctx.request.method() === 'GET') {
      const page = parseInt(ctx.request.input('page'))
      const perPage = parseInt(ctx.request.input('perpage') || ctx.request.input('limit'))

      ctx.pagination = { page, perPage }
    }
    // call next to advance the request
    await next()
  }
}

module.exports = Pagination
