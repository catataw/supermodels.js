var test = require('tape')
var supermodels = require('../')
var prop = require('./prop')

/*
 * Tests for models being composable.
 * Models can reference other Models
 * though properties and arrays.
 * E.g.
 * customer.basket = <Basket>
 * basket.items = Array<BasketItem>
 */
test('composition references', function (t) {
  var BasketItem = supermodels({
    productCode: String,
    quantity: prop(Number).name('Quantity').required()
  })

  var Basket = supermodels({
    items: [BasketItem],
    total: function () {
      return this.items.length
    },
    totalItems: function () {
      var total = 0
      for (var i = 0; i < this.items.length; i++) {
        total += this.items[i].quantity
      }
      return total
    }
  })

  var Customer = supermodels({
    name: String,
    basket: Basket
  })

  var customer = new Customer()

  t.equals(typeof customer.basket, 'undefined')

  customer.basket = new Basket()

  t.equals(customer.basket.__parent, customer)

  customer.name = 'Jo Bloggs'
  var basketItem = new BasketItem()
  basketItem.productCode = 'P100'
  basketItem.quantity = 2
  customer.basket.items.push(basketItem)
  t.equals(customer.basket.items[0].__parent, customer.basket.items)

  // Assert the events are propagated correctly
  customer.on('change', function (e) {
    t.equals(e.path, 'basket.items.0.quantity')
  })

  basketItem.quantity++
  customer.removeAllListeners()

  // Assert the custom properties are ok
  t.equals(customer.basket.total(), 1)
  t.equals(customer.basket.totalItems(), 3)

  // Assert the errors are propagated correctly.
  // Should have length zero at first, then after
  // adding a new basket item without the required
  // quantity, should sum 1. The error should propagate.
  t.equals(customer.errors.length, 0)

  var basketItem2 = new BasketItem()
  basketItem2.productCode = 'P100'
  customer.basket.items.push(basketItem2)

  t.equals(customer.errors.length, 1)
  t.equals(customer.basket.errors.length, 1)
  t.equals(basketItem2.errors.length, 1)

  t.end()
})
