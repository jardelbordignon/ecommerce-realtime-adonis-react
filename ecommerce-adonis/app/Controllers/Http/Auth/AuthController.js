'use strict'

const Database = use('Database')
const Role = use('Role')

const User = use('App/Models/User')


class AuthController {

  async register({ request, response }) {
    const trx = await Database.beginTransaction()
    try {
      const { name, surname, email, password } = request.all()

      const user = await User.create({ name, surname, email, password }, trx)
      //console.log(user)
      const userRole = await Role.findBy('slug', 'client')
      await user.roles().attach([userRole.id], null, trx)

      await trx.commit()

      return response.send({ data: user })

    } catch (error) {
      await trx.rollback()
      return response.status(400).send({
        message: 'Erro ao realizar o cadastro, por favor tente novamente: ' + error.message
      })
    }
  }


  async login({ request, response, auth }) {
    const { email, password } = request.all()

    const data = await auth.withRefreshToken().attempt( email, password )

    return response.send({ data })
  }


  async refresh({ request, response, auth }) {
    const refresh_token = request.input('refresh_token') || request.header('refresh_token')

    const user = await auth.newRefreshToken().generateForRefreshToken(refresh_token)

    return response.send({ data: user })
  }


  async logout({ request, response, auth }) {
    const refresh_token = request.input('refresh_token') || request.header('refresh_token')

    await auth.authenticator('jwt').revokeTokens([refresh_token], true)

    return response.status(204).send({})
  }


  async forgot({ request, response }) {

  }


  async remember({ request, response }) {

  }


  async responseet(request, response) {

  }

}

module.exports = AuthController
