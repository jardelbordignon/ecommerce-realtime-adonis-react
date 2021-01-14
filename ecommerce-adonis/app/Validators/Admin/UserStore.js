'use strict'

class AdminUserStore {
  get rules () {

    let userId = this.ctx.params.id
    // se tiver userId é uma atualização

    let emailRule = 'unique:users,email|required'
    if (userId)
      emailRule = `unique:users,email,id,${userId}`

    return {
      email: emailRule,
      image_id: 'exists:images,id'
    }
  }
}

module.exports = AdminUserStore
