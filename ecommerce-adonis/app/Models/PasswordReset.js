'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PasswordReset extends Model {

  static boot() {
    super.boot()

    this.addHook('beforeCreate', async model => {
      const expires_at = new Date()
      expires_at.setMinutes(expires_at.getMinutes() + 30)

      model.expires_at = expires_at
      model.token = await str_random(25)
    })
  }

  /**
   * formata as datas para o padrão do Mysql
   */
  static get dates() {
    return ['created_at', 'updated_at', 'expires_at']
  }

}

module.exports = PasswordReset
