var test = require('tape')
var supermodels = require('../')
var prop = require('./prop')

test('scalar', function (t) {
  function range (min, max) {
    return function (value, key) {
      if (value < min || value > max) {
        return {
          key: key,
          some: 'range error happened, return anything truthy'
        }
      }
    }
  }

  // Define a simple model that represents a Percentage.
  // This will be a number within the range 0, 100. A default of 42 is applied.
  var schema = prop(Number).value(42).validate(range(0, 100))

  var PercentModel = supermodels(schema)

  // As this is a 'scalar' schema definition, a wrapper object returned
  var model = new PercentModel()

  t.equal(model.value, 42)

  model.value = '-1'
  t.equal(model.value, -1)

  t.equal(model.errors.length, 1)

  t.end()
})

test('scalar array', function (t) {
  var schema = {
    val: ['2'],
    val1: [2],
    val2: [Number]
  }
  var Model = supermodels(schema)
  var model = new Model()

  t.equal(Array.isArray(model.val), true)
  t.equal(Array.isArray(model.val1), true)
  t.equal(Array.isArray(model.val2), true)

  var val = model.val.create()
  t.equal(val, '2')

  var val1 = model.val1.create()
  t.equal(val1, 2)

  var val2 = model.val2.create()
  t.equal(typeof val2, 'undefined')

  model.val.push('3')
  model.val1.push('3')
  model.val2.push('3')

  t.equal(model.val[0], '3')
  t.equal(model.val1[0], '3')
  t.equal(model.val2[0], 3)

  t.end()
})
