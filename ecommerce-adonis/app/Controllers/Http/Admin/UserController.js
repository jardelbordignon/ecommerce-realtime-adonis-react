'use strict'

const User = use('App/Models/User')
const Transformer = use('App/Transformers/Admin/UserTransformer')

class UserController {


  async index ({ request, response, pagination, transform }) {
    const name = request.input('name')
    const query = User.query()

    if (name) {
      query.where('name', 'LIKE', `%${name}%`)
      query.orWhere('surname', 'LIKE', `%${name}%`)
      query.orWhere('email', 'LIKE', `%${name}%`)
    }

    let users = await query.paginate(pagination.page, pagination.perPage)
    users = await transform.paginate(users, Transformer)

    return response.send(users)
  }


  async store ({ request, response, transform }) {
    try {
      const userData = request.only(['name', 'surname', 'email', 'password', 'image_id'])
      let user = await User.create(userData)
      user = await transform.item(user, Transformer)
      return response.status(201).send(user)

    } catch (error) {
      let message = 'Erro ao registrar usuário'
      if (error.code === 'ER_DUP_ENTRY') message += ': registro já existe'

      return response.status(400).send({ message })
    }
  }


  async show ({ params, response, transform }) {
    let user = await User.findOrFail(params.id)
    user = await transform.item(user, Transformer)
    return response.send(user)
  }


  async update ({ params, request, response }) {
    try {
      let user = await User.findOrFail(params.id)
      const userData = request.only(['name', 'surname', 'email', 'password', 'image_id'])

      user.merge(userData)
      await user.save()
      user = await transform.item(user, Transformer)

      return response.send(user)

    } catch (error) {
      let message = 'Erro ao editar usuário'
      if (error.code === 'ER_DUP_ENTRY') message += ': registro já existe'

      return response.status(400).send({ message })
    }
  }


  async destroy ({ params, response }) {
    try {
      const user = await User.findOrFail(params.id)
      await user.delete()
      return response.status(204).send()

    } catch (error) {
      return response.status(400).send({ message: 'Erro ao deletar usuário' })
    }
  }
}

module.exports = UserController
