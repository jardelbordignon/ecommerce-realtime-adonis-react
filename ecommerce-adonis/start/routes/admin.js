'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {

  // resource routes (crud)
  Route.resource('categories', 'CategoryController').apiOnly()
  Route.resource('coupons',    'CouponController').apiOnly()
  Route.resource('images',     'ImageController').apiOnly()
  Route.resource('order',      'OrderController').apiOnly()
  Route.resource('products',   'ProductController').apiOnly()
  Route.resource('users',      'UserController').apiOnly()
})
.prefix('v1/admin')
.namespace('Admin')
