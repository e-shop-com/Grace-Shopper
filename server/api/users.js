const router = require('express').Router()
const {User} = require('../db/models')
const {Order} = require('../db/models')
const {
  isLoggedIn,
  isAdmin,
  isSelfOrAdmin
} = require('./gatekeepers')
module.exports = router

// TODO: permissioning/gatekeeping for isAdmin

router.get('/', isAdmin, (req, res, next) => {
  User.findAll({
    // explicitly select only the id and email fields - even though
    // users' passwords are encrypted, it won't help if we just
    // send everything to anyone who asks!
    attributes: ['id', 'email']
  })
    .then(users => res.json(users))
    .catch(next)
})

// get a user by id
router.get('/:id', isSelfOrAdmin, (req, res, next) => {
  User.findById(req.params.id)
    .then(user => user ? res.json(user) : res.sendStatus(404))
    .catch(next)
})

// get orders by user
router.get('/:id/orders', isSelfOrAdmin, (req, res, next) => {
  const userId = req.params.id;
  Order.findAll({ where: { userId } })
    .then(orders => res.json(orders))
    .catch(next);
})

// GET for a single order for a single user
router.get('/:id/orders/:orderid', isSelfOrAdmin, (req, res, next) => {
  // const userId = req.params.id;
  Order.findById(orderid)
    .then(orders => res.json(orders))
    .catch(next);
})


// create user; unprotected
router.post('/', (req, res, next) => {
  User.create(req.body)
  .then(user => res.json(user))
  .catch(next)
})

// delete user
router.delete('/:id',isSelfOrAdmin, (req, res, next) => {
  return User.findById(req.params.id)
  .then(user => user ? User.destroy({where: {id: req.params.id}}) : res.sendStatus(404))
  .then(() => res.sendStatus(200))
  .catch(next)
})

//  edit user 
// TODO: what if user wants to edit own info but we have block from making himself an admin.
router.put('/:id', isAdmin, (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      if (!user) return res.sendStatus(404);
      else {
        user.update(req.body)
        .then(updatedUser => {
          res.json(updatedUser)
      })
    }})
    .catch(next)
})

// post order given a specific user
router.post('/:id/orders', isSelfOrAdmin, (req, res, next) => {
  // no need to find user
  // create order
    let neworder = req.body
    neworder['userId'] = req.params.id
    Order.create(neworder)
    .then(order => res.json(order))
    .catch(next)
})


// NO DELETES OF ORDERS BECAUSE WE WANT AN AUDITABLE HISTORY

// PUT to change status of orders
router.put('/:id/orders/:orderid', isSelfOrAdmin, (req, res, next) => {
  Order.findById(req.params.orderid)
    .then(order => {
      if (!order) return res.sendStatus(404);
      else {
        order.update(req.body)
        .then(updatedOrder => {
          res.json(updatedOrder)
      })
    }})
    .catch(next)
})