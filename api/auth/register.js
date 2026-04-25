const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const prisma = require('../lib/db')
const { ok, fail } = require('../lib/helpers')

module.exports = async function(req, res) {
  if (req.method !== 'POST') return fail(res, 'Method not allowed', 405)

  var body = req.body || {}
  var email     = body.email
  var phone     = body.phone
  var password  = body.password
  var firstName = body.firstName
  var lastName  = body.lastName
  var role      = body.role

  if (!email || !phone || !password || !firstName || !lastName || !role)
    return fail(res, 'All fields are required')
  if (role !== 'LANDLORD' && role !== 'TENANT')
    return fail(res, 'Role must be LANDLORD or TENANT')
  if (password.length < 8)
    return fail(res, 'Password must be at least 8 characters')

  try {
    var exists = await prisma.user.findFirst({ where: { OR: [{ email: email }, { phone: phone }] } })
    if (exists) return fail(res, exists.email === email ? 'Email already registered' : 'Phone already registered')

    var hash = await bcrypt.hash(password, 12)
    var data = {
      email: email, phone: phone, passwordHash: hash,
      firstName: firstName, lastName: lastName, role: role
    }
    if (role === 'LANDLORD') data.landlord = { create: {} }
    else data.tenant = { create: {} }

    var user = await prisma.user.create({ data: data })
    var token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

    return ok(res, {
      token: token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
    }, 'Welcome to NaijaRentals!')
  } catch (e) {
    console.error(e)
    return fail(res, 'Registration failed. Please try again.', 500)
  }
}
