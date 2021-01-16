'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

const ProductTransformer = use('App/Transformers/Admin/ProductTransformer')
/**
 * OrderItemTransformer class
 *
 * @class OrderItemTransformer
 * @constructor
 */
class OrderItemTransformer extends BumblebeeTransformer {

  defaultInclude () {
    return ['product']
  }
  /**
   * This method is used to transform the data.
   */
  transform (orderItem) {
    return {
      id: orderItem.id,
      subtotal: orderItem.subtotal,
      quantity: orderItem.quantity
    }
  }

  includeProduct(orderItem) {
    return this.item(orderItem.getRelated('product'), ProductTransformer)
  }

}


module.exports = OrderItemTransformer
