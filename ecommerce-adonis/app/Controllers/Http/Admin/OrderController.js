'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Discount = use('App/Models/Discount')
const Coupon = use('App/Models/Coupon')
const Order = use('App/Models/Order')
const OrderService = use('App/Services/OrderService')
const Database = use('Database')
/**
 * Resourceful controller for interacting with orders
 */
class OrderController {
  /**
   * Show a list of all orders.
   * GET orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {Pagination} ctx.pagination
   */
  async index ({ request, response, pagination }) {
    const { status, id } = request.only(['status', 'id'])
    const query = Order.query()

    if (status && id) {
      query.where('status', status)
      query.orWhere('id', id)
    }
    else if (status)
      query.where('status', status)
    else if (id)
      query.where('id', id)

    const orders = await query.paginate(pagination.page, pagination.perPage)
    return response.send(orders)
  }


  /**
   * Create/save a new order.
   * POST orders
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response }) {
    const trx = await Database.beginTransaction()
    try {
      const { user_id, items, status } = request.all()
      const order = Order.create({ user_id, status }, trx)
      const service = new OrderService(order, trx)

      if (items && !!items.length)
        await service.syncItems(items)

      await trx.commit()
      return response.status(201).send(order)
    } catch (error) {
      await trx.rollback()
      return response.status(400).send({ message: 'Erro ao registar o pedido'})
    }
  }

  /**
   * Display a single order.
   * GET orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show ({ params, response }) {
    const order = Order.findOrFail(params.id)
    return response.send(order)
  }

  /**
   * Update order details.
   * PUT or PATCH orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    const order = Order.findOrFail(params.id)
    const trx = await Database.beginTransaction()

    try {
      const { user_id, items, status } = request.all()
      order.merge({ user_id, status })
      const service = new OrderService(order, trx)
      await service.updateItems(items)
      await order.save(trx)
      await trx.commit()
      return response.send(order)

    } catch (error) {
      await trx.rollback()
      return response.status(400).send({ message: 'Erro ao editar pedido'})
    }
  }

  /**
   * Delete a order with id.
   * DELETE orders/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
    const order = Order.findOrFail(params.id)
    const trx = await Database.beginTransaction()

    try {
      await order.items().delete(trx)
      await order.coupons().delete(trx)
      await order.delete(trx)
      await trx.commit()
      return response.status(204).send()

    } catch (error) {
      await trx.rollback()
      return response.status(400).send({ message: 'Erro ao deletar o pedido' })
    }
  }


  async applyDiscount({ params, request, response }) {
    const { code } = request.all()
    const coupon = Coupon.findByOrFail('code', code.toUpperCase())
    const order = Order.findOrFail(params.id)

    let discount = {}, info = {}
    try {
      const service = new OrderService(order)
      const canAddDiscount = await service.canApplyDiscount(cupom)
      const orderDiscounts = await order.coupons().getCount()

      const canApplyToOrder = canAddDiscount && (!orderDiscounts || cupom.recursive)

      if (canApplyToOrder) {
        discount = await Discount.findOrCreate({
          order_id: order.id,
          coupon_id: coupon.id
          // valor será calculado pelo DiscountHook
        })
        info = { message: 'Cupom aplicado com sucesso', success: true }
      } else {
        info = { message: 'Não foi possível aplicar esse cupom', success: false }
      }

      return response.send({ order, info })

    } catch (error) {
      return response.status(400).send({ message: 'Erro ao aplicar desconto'})
    }

  }


  async removeDiscount({ request, response }) {
    const { discount_id } = request.all()
    const discount = await Discount.findOrFail(discount_id)
    await discount.delete()
    return response.status(204).send()
  }

}

module.exports = OrderController
