'use strict'

class AuthRegister {
  get rules () {
    return {
      name: 'required',
      surname: 'required',
      email: 'required|email|unique:users,email',
      password: 'required|confirmed'
    }
  }

  get messages () {
    return {
      'name.required': 'O nome é obrigatório',
      'surname.required': 'O sobrenome é obrigatório',
      'email.required': 'O e-mail é obrigatório',
      'email.email': 'Formato de e-mail inválido',
      'email.unique': 'Já existe um registro com esse e-mail',
      'password.required': 'A senha é obrigatória',
      'password.confirmed': 'As senhas são diferentes'
    }
  }
}

module.exports = AuthRegister
