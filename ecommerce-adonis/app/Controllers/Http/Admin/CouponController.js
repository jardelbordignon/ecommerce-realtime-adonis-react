'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Database = use('Database')

const Coupon = use('App/Models/Coupon')
const CouponService = use('App/Services/CouponService')
const Transformer  = use('App/Transformers/Admin/CouponTransformer')
/**
 * Resourceful controller for interacting with coupons
 */
class CouponController {
  /**
   * Show a list of all coupons.
   * GET coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Pagination} ctx.pagination
   */
  async index({ request, response, pagination, transform }) {
    const code = request.input('code')
    const query = Coupon.query()

    if (code)
      query.where('code', 'LIKE', `%${code}%`)

    let coupons = await query.paginate(pagination.page, pagination.perPage)
    coupons = await transform.paginate(coupons, Transformer)

    return response.send(coupons)
  }

  /**
   * Create/save a new coupon.
   * POST coupons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   *
   * casos de uso
   *
   * 1. produts -> pode ser utlilizado apenas em produtos específicos
   * 2. clients -> pode ser utlilizado apenas por clientes específicos
   * 3. clients and produts -> pode ser utlilizado apenas por clientes específicos em produtos específicos
   * 4. all -> pode ser utlilizado por qualquer cliente em qualquer produto
   */
  async store({ request, response, transform }) {
    let used_for = { client: false, product: false }
    const trx = await Database.beginTransaction()

    try {
      const couponData = request.only([
        'code',
        'discount',
        'valid_from',
        'valid_until',
        'quantity',
        'type',
        'recursive' // if it can used with another coupons
      ])
      const { users, products } = request.only(['users', 'products'])
      let coupon = await Coupon.create(couponData, trx)

      // starts service layer and create relationships
      const service = new CouponService(coupon, trx)

      if (users && !!users.length) {
        await service.syncUsers(users)
        used_for.client = true
      }

      if (products && !!products.length) {
        await service.syncProducts(products)
        used_for.product = true
      }

      if      (used_for.product && used_for.client)  coupon.can_use_for = 'product_client'
      else if (used_for.product && !used_for.client) coupon.can_use_for = 'product'
      else if (!used_for.product && used_for.client) coupon.can_use_for = 'client'
      else                                           coupon.can_use_for = 'all'

      await coupon.save(trx)
      trx.commit()

      coupon = await transform.item(coupon, Transformer)
      return response.status(201).send(coupon)

    } catch (error) {
      trx.rollback()
      return response.status(400).send({ message: 'Erro ao criar o cupom'})
    }
  }

  /**
   * Display a single coupon.
   * GET coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show({ params, response, transform }) {
    let coupon = await Coupon.findOrFail(params.id)
    coupon = await transform.item(coupon, Transformer)
    return response.send(coupon)
  }

  /**
   * Update coupon details.
   * PUT or PATCH coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response, transform }) {
    let used_for = { client: false, product: false }
    const trx = await Database.beginTransaction()

    let coupon = await Coupon.findOrFail(params.id)

    try {
      const couponData = request.only([
        'code',
        'discount',
        'valid_from',
        'valid_until',
        'quantity',
        'type',
        'recursive' // if it can used with another coupons
      ])

      coupon.merge(couponData)

      const { users, products } = request.only(['users', 'products'])

      const service = new CouponService(coupon, trx)

      if (users && !!users.length) {
        await service.syncUsers(users)
        used_for.client = true
      }

      if (products && !!products.length) {
        await service.syncProducts(products)
        used_for.product = true
      }

      if      (used_for.product && used_for.client)  coupon.can_use_for = 'product_client'
      else if (used_for.product && !used_for.client) coupon.can_use_for = 'product'
      else if (!used_for.product && used_for.client) coupon.can_use_for = 'client'
      else                                           coupon.can_use_for = 'all'

      await coupon.save(trx)
      trx.commit()

      coupon = await transform.item(coupon, Transformer)
      return response.send(coupon)

    } catch (error) {
      trx.rollback()
      return response.status(400).send({ message: 'Erro ao editar o cupom'})
    }
  }

  /**
   * Delete a coupon with id.
   * DELETE coupons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
    const trx = await Database.beginTransaction()
    const coupon = await Coupon.findOrFail(params.id)
    try {
      await coupon.products().detach([], trx)
      await coupon.orders().detach([], trx)
      await coupon.users().detach([], trx)
      await coupon.delete(trx)
      await trx.commit()
      return response.status(204).send()
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({ message: 'Erro ao deletar o cupom' })
    }

  }
}

module.exports = CouponController
