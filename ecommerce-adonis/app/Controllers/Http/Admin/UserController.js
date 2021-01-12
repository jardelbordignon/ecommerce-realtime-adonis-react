'use strict'

const User = use('App/Models/User')

class UserController {


  async index ({ request, response, pagination }) {
    const name = request.input('name')
    const query = User.query()

    if (name) {
      query.where('name', 'LIKE', `%${name}%`)
      query.orWhere('surname', 'LIKE', `%${name}%`)
      query.orWhere('email', 'LIKE', `%${name}%`)
    }

    const users = await query.paginate(pagination.page, pagination.perPage)

    return response.send(users)
  }


  async store ({ request, response }) {
    try {
      const userData = request.only(['name', 'surname', 'email', 'password', 'image_id'])
      const user = await User.create(userData)
      return response.status(201).send(user)

    } catch (error) {
      let message = 'Erro ao registrar usuário'
      if (error.code === 'ER_DUP_ENTRY') message += ': registro já existe'

      return response.status(400).send({ message })
    }
  }


  async show ({ params, response }) {
    const user = await User.findOrFail(params.id)
    return response.send(user)
  }


  async update ({ params, request, response }) {
    try {
      const user = await User.findOrFail(params.id)
      const userData = request.only(['name', 'surname', 'email', 'password', 'image_id'])

      user.merge(userData)
      await user.save()

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
