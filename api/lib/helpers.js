const jwt    = require('jsonwebtoken')
const prisma = require('./db')

const ok   = (res, data, msg) => res.status(200).json({ success: true,  message: msg || 'Success', data })
const fail = (res, msg, status) => res.status(status || 400).json({ success: false, message: msg })

async function getUser(req) {
  const header = req.headers.authorization || ''
  const token  = header.split(' ')[1]
  if (!token) return null
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id:true, email:true, phone:true, firstName:true, lastName:true, role:true, isActive:true, subaccountCode:true }
    })
    if (!user || !user.isActive) return null
    return user
  } catch (e) {
    return null
  }
}

function calcFee(rent) {
  const rate       = parseFloat(process.env.PLATFORM_FEE_RATE || '0.05')
  const platformFee = Math.round(rent * rate)
  return {
    annualRent:   rent,
    platformFee:  platformFee,
    totalAmount:  rent + platformFee,
    agentFee20:   Math.round(rent * 0.20),
    tenantSaving: Math.round(rent * 0.20) - platformFee,
  }
}

module.exports = { ok, fail, getUser, calcFee }
