'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  // resource routes (crud)

  // Category
  Route.resource('categories', 'CategoryController').apiOnly()

  // Coupon
  Route.resource('coupons', 'CouponController').apiOnly()

  // Image
  Route.resource('images', 'ImageController').apiOnly()

  // Order
  Route.post('orders/:id/discount', 'OrderController.applyDiscount')
  Route.delete('orders/:id/discount', 'OrderController.removeDiscount')
  Route.resource('order', 'OrderController').apiOnly()

  // Product
  Route.resource('products', 'ProductController').apiOnly()

  // User
  Route.resource('users', 'UserController').apiOnly()
})
.prefix('v1/admin')
.namespace('Admin')
.middleware(['auth', 'is:(admin || manager)']) // ACL - access control level
