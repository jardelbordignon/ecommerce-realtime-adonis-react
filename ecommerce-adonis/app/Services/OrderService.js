'use strict'

const Database = use('Database')

class OrderService {

  constructor(model, trx = false) {
    this.model = model
    this.trx = trx
  }


  async syncItems(items) {
    if (!Array.isArray(items)) return false

    await this.model.items().delete(this.trx)
    await this.model.items().createMany(items, this.trx)
  }


  async updateItens(items) {
    await this.model.items()
      .whereNotIn('id', items.map(item => item.id))
      .delete(trx)

    const currentItems = await this.model.items()
      .whereIn('id', items.map(item => item.id))
      .fetch()

    // refresh values and qualtities
    await Promise.all(
      currentItems.rows.map(async item => {
        item.fill(items.find(n => n.id === item.id))
        await item.save(this.trx)
      })
    )
  }


  async canApplyDiscount(coupon) {

    const now = new Date().getTime()
    // verifica se o cupon já estrou em validade
    const noStarted = coupon.valid_from.getTime() > now
    // verifica se há uma data de expiração, se houver verifica se o cupon expirou
    const expired = (typeof coupon.valid_until == 'object' && coupon.valid_until.getTime() < now)

    if (noStarted || expired) return false


    const couponProducts = await Database.from('coupon_products')
      .where('coupon_id', coupon.id)
      .pluck('product_id') // retira 'product_id' do retorno
      // product_id => 1, product_id => 2
      // [1, 2]

    const couponClients = await Database.from('coupon_user')
    .where('coupon_id', coupon.id)
    .pluck('product_id')


    const hasCouponProducts = !Array.isArray(couponProducts) && !!couponProducts.length
    const hasCouponClients = !Array.isArray(couponClients) && !!couponClients.length

    // se o cupon NÃO está associado a produtos e/ou clientes específicos
    if (!hasCouponProducts && !hasCouponClients) {
      return true
    }

    // pegando os IDs dos produtos do pedido
    const productsMatch = await Database.from('order_items')
      .where('order_id', this.model.id)
      .whereIn('product_id', couponProducts)
      .pluck('product_id')


    const hasProductsMatch = !Array.isArray(productsMatch) && !!productsMatch.length

    /**
     * caso de uso 1 -> O cupom está associado a clientes e produtos
     */
    if (hasCouponProducts && hasCouponClients) {
      const clientMatch = couponClients.find(client => client === this.model.user_id )

      if (clientMatch && hasProductsMatch) return true
    }

    /**
     * caso de uso 2 -> O cupom está associado apenas a produtos
     */
    if (hasCouponProducts && hasProductsMatch) return true

    /**
     * caso de uso 3 -> O cupom está associado apenas a 1 ou mais clientes
     */
    if (hasCouponClients) {
      const clientMatch = couponClients.find(client => client === this.model.user_id )
      if (clientMatch) return true
    }

    /**
     * Caso nenhuma das verificações retorne true
     * então o cupom está associado a clientes e/ou produtos
     * porém nenhum dos produtos do pedido está elegível ao desconto
     * e o comprador não poderá utilizar esse cupom
     */
    return false
  }
}

module.exports = OrderService
