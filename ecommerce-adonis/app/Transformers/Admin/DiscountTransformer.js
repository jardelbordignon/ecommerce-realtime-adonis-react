'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

const DiscountTransformer = use('App/Transformers/Admin/DiscountTransformer')
/**
 * DiscountTransformer class
 *
 * @class DiscountTransformer
 * @constructor
 */
class DiscountTransformer extends BumblebeeTransformer {

  defaultInclude () {
    return ['coupon']
  }

  /**
   * This method is used to transform the data.
   */
  transform (discount) {
    return {
      id: discount.id,
      amount: discount.discount
    }
  }


  includeCoupon (discount) {
    return this.item(discount.getRelated('coupon'), DiscountTransformer)
  }

}

module.exports = DiscountTransformer
