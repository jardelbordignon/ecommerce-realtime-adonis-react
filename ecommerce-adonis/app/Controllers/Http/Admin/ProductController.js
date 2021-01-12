'use strict'

const Product = use('App/Models/Product')

class ProductController {

  async index ({ request, response, pagination }) {
    const name = request.input('name')
    const query = Product.query()

    if (name)
      query.where('name', 'LIKE', `%${name}%`)

    const products = await query.paginate(pagination.page, pagination.perPage)

    return response.send(products)
  }


  async store ({ request, response }) {
    try {
      const { name, description, price, image_id } = request.all()
      const product = await Product.create({ name, description, price, image_id })
      return response.status(201).send(product)

    } catch (error) {
      return response.status(400).send({ message: 'Erro ao registrar o produto' })
    }
  }


  async show ({ params, request, response }) {
    const product = await Product.findOrFail(params.id)
    return response.send(product)
  }


  async update ({ params, request, response }) {
    try {
      const product = await Product.findOrFail(params.id)
      const { name, description, price, image_id } = request.all()

      product.merge({ name, description, price, image_id })
      await product.save()

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
