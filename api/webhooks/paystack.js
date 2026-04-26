const crypto = require('crypto')
const prisma = require('../lib/db')

module.exports = async function(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  var sig  = req.headers['x-paystack-signature'] || ''
  var hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
    .update(JSON.stringify(req.body))
    .digest('hex')

  if (hash !== sig) return res.status(401).json({ message: 'Invalid signature' })

  res.status(200).json({ received: true })

  var event = req.body
  if (event.event === 'charge.success') {
    var ref = event.data.reference
    try {
      var rental = await prisma.rental.findUnique({ where: { paystackRef: ref } })
      if (!rental || rental.escrowStatus === 'RELEASED') return

      await prisma.$transaction([
        prisma.rental.update({
          where: { id: rental.id },
          data: {
            escrowStatus: 'RELEASED',
            paidAt:       new Date(),
            releasedAt:   new Date()
          }
        }),
        prisma.listing.update({
          where: { id: rental.listingId },
          data: { status: 'RENTED', isActive: false }
        })
      ])
      console.log('Escrow released for ref: ' + ref)
    } catch (e) {
      console.error('Webhook error:', e)
    }
  }
}
