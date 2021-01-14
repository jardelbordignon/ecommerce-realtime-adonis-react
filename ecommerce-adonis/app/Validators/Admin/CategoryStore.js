'use strict'

class AdminCategoryStore {
  get rules () {
    return {
      title: 'required',
      description: 'required'
    }
  }
}

module.exports = AdminCategoryStore
