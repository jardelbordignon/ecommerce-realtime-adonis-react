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

  static get availableInclude() {
    return ['user', 'items', 'coupons', 'discounts']
  }

  // defaultInclude () {
  //   return ['items']
  // }

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
      discount: order.__meta__.discount || 0,
      subtotal: order.__meta__.subtotal || 0
    }
  }


  includeUser(order) {
    return this.item(order.getRelated('user'), UserTransformer)
  }

  includeItems(order) {
    return this.collection(order.getRelated('items'), OrderItemTransformer)
  }

  includeCoupons(order) {
    return this.collection(order.getRelated('coupons'), CouponTransformer)
  }

  includeDiscounts(order) {
    return this.collection(order.getRelated('discounts'), DiscountTransformer)
  }
}

module.exports = OrderTransformer
