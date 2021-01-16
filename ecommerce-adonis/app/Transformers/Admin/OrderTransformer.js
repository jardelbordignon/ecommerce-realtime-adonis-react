'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

const UserTransformer = use('App/Transformers/Admin/UserTransformer')
const CouponTransformer = use('App/Transformers/Admin/CouponTransformer')
const OrderItemTransformer = use('App/Transformers/Admin/OrderItemTransformer')
const DiscountTransformer = use('App/Transformers/Admin/DiscountTransformer')
/**
 * OrderTransformer class
 *
 * @class OrderTransformer
 * @constructor
 */
class OrderTransformer extends BumblebeeTransformer {

  availableInclude() {
    return ['user', 'coupons', 'items', 'discounts']
  }

  /**
   * This method is used to transform the data.
   */
  transform (order) {
    order = order.toJSON()
    return {
      id: order.id,
      status: order.status,
      total: order.total ? parseFloat(order.total.toFixed(2)) : 0,
      qty_items: order.qty_items,
      date: order.created_at,
      discount: order.__meta__?.discount || 0,
      subtotal: order.__meta__?.subtotal || 0
    }
  }


  includeUser(order) {
    return this.item(order.getRelated('user'), UserTransformer)
  }

  includeUser(order) {
    return this.item(order.getRelated('coupons'), CouponTransformer)
  }

  includeUser(order) {
    return this.item(order.getRelated('items'), OrderItemTransformer)
  }

  includeUser(order) {
    return this.item(order.getRelated('discounts'), DiscountTransformer)
  }
}

module.exports = OrderTransformer
