const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const prisma = require('../lib/db')
const { ok, fail } = require('../lib/helpers')

module.exports = async function(req, res) {
  if (req.method !== 'POST') return fail(res, 'Method not allowed', 405)

  var body     = req.body || {}
  var email    = body.email
  var password = body.password

  if (!email || !password) return fail(res, 'Email and password required')

  try {
    var user = await prisma.user.findUnique({ where: { email: email } })
    if (!user || !user.isActive) return fail(res, 'Invalid email or password', 401)

    var match = await bcrypt.compare(password, user.passwordHash)
    if (!match) return fail(res, 'Invalid email or password', 401)

    var token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return ok(res, {
      token: token,
      user: {
        id:        user.id,
        email:     user.email,
        phone:     user.phone,
        firstName: user.firstName,
        lastName:  user.lastName,
        role:      user.role
      }
    }, 'Welcome back, ' + user.firstName + '!')
  } catch (e) {
    console.error(e)
    return fail(res, 'Login failed. Please try again.', 500)
  }
}
