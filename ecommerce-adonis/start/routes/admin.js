'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  // resource routes (crud)

  // Dashboard
  Route.get('dashboard', 'DashboardController.index').as('dashboard')

  // Category
  Route.resource('categories', 'CategoryController').apiOnly()
    .validator(new Map([
      [['categories.store', 'categories.update'], ['Admin/CategoryStore']],
    ]))

  // Coupon
  Route.resource('coupons', 'CouponController').apiOnly()

  // Image
  Route.resource('images', 'ImageController').apiOnly()

  // Order
  Route.post('orders/:id/discount', 'OrderController.applyDiscount')
  Route.delete('orders/:id/discount', 'OrderController.removeDiscount')
  Route.resource('orders', 'OrderController').apiOnly()
    .validator(new Map([
      [['orders.store', 'orders.update'], ['Admin/OrderStore']]
    ]))

  // Product
  Route.resource('products', 'ProductController').apiOnly()

  // User
  Route.resource('users', 'UserController').apiOnly()
    .validator(new Map([
      [['users.store', 'users.update'], ['Admin/UserStore']]
    ]))
})
.prefix('v1/admin')
.namespace('Admin')
.middleware(['auth', 'is:(admin || manager)']) // ACL - access control level
