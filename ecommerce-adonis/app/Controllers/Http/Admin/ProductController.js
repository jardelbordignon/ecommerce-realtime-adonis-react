'use strict'

const Product = use('App/Models/Product')
const Transformer  = use('App/Transformers/Admin/ProductTransformer')

class ProductController {

  async index ({ request, response, pagination, transform }) {
    const name = request.input('name')
    const query = Product.query()

    if (name)
      query.where('name', 'LIKE', `%${name}%`)

    let products = await query.paginate(pagination.page, pagination.perPage)
    products = await transform.paginate(products, Transformer)

    return response.send(products)
  }


  async store ({ request, response, transform }) {
    try {
      const { name, description, price, image_id } = request.all()
      let product = await Product.create({ name, description, price, image_id })
      product = await transform.items(product, Transformer)
      return response.status(201).send(product)

    } catch (error) {
      return response.status(400).send({ message: 'Erro ao registrar o produto' })
    }
  }


  async show ({ params, response, transform }) {
    let product = await Product.findOrFail(params.id)
    product = await transform.items(product, Transformer)
    return response.send(product)
  }


  async update ({ params, request, response, transform }) {
    let product = await Product.findOrFail(params.id)
    try {
      const { name, description, price, image_id } = request.all()
      product.merge({ name, description, price, image_id })
      await product.save()
      product = await transform.items(product, Transformer)

      return response.send(product)

    } catch (error) {
      return response.status(400).send({ message: 'Erro ao alterar o produto' })
    }
  }


  async destroy ({ params, request, response }) {
    const product = await Product.findOrFail(params.id)
    try {
      await product.delete()
      return response.status(204).send()
    } catch (error) {
      return response.status(400).send({ message: 'Erro ao deletar o produto' })
    }
  }
}

module.exports = ProductController
