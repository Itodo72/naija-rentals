const axios   = require('axios')
const prisma  = require('../lib/db')
const { ok, fail, getUser, calcFee } = require('../lib/helpers')

module.exports = async function(req, res) {

  if (req.method === 'GET') {
    var listingId = (req.query || {}).listingId
    if (!listingId) return fail(res, 'listingId required')
    try {
      var listing = await prisma.listing.findUnique({ where: { id: listingId } })
      if (!listing) return fail(res, 'Listing not found', 404)
      return ok(res, { listing: { id: listing.id, title: listing.title }, fees: calcFee(listing.annualRent) })
    } catch (e) {
      return fail(res, 'Failed', 500)
    }
  }

  if (req.method === 'POST') {
    var user = await getUser(req)
    if (!user)                   return fail(res, 'Login required', 401)
    if (user.role !== 'TENANT') return fail(res, 'Only tenants can pay')

    var listingId = (req.body || {}).listingId
    if (!listingId) return fail(res, 'listingId required')

    try {
      var listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: { landlord: true }
      })
      if (!listing || listing.status !== 'APPROVED') return fail(res, 'Property not available')

      var fees = calcFee(listing.annualRent)
      var ref  = 'NRE-' + Date.now() + '-' + Math.random().toString(36).slice(2,8).toUpperCase()

      var psData = {
        email:     user.email,
        amount:    fees.totalAmount * 100,
        reference: ref,
        currency:  'NGN',
        channels:  ['card','bank','ussd','bank_transfer'],
        metadata: {
          listingId:   listingId,
          tenantId:    user.id,
          annualRent:  fees.annualRent,
          platformFee: fees.platformFee,
          custom_fields: [
            { display_name:'Property',         variable_name:'property', value: listing.title },
            { display_name:'Rent to landlord', variable_name:'rent',     value: '₦' + fees.annualRent.toLocaleString() },
            { display_name:'Platform fee 5%',  variable_name:'fee',      value: '₦' + fees.platformFee.toLocaleString() }
          ]
        }
      }

      if (listing.landlord.subaccountCode) {
        psData.subaccount         = listing.landlord.subaccountCode
        psData.transaction_charge = fees.platformFee * 100
        psData.bearer             = 'subaccount'
      }

      var psRes = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        psData,
        { headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY } }
      )

      var start = new Date()
      var end   = new Date(start)
      end.setFullYear(end.getFullYear() + 1)

      await prisma.rental.create({
        data: {
          listingId:    listingId,
          tenantId:     user.id,
          rentAmount:   fees.annualRent,
          platformFee:  fees.platformFee,
          totalPaid:    fees.totalAmount,
          paystackRef:  ref,
          escrowStatus: 'AWAITING_PAYMENT',
          startDate:    start,
          endDate:      end
        }
      })

      return ok(res, {
        authorizationUrl: psRes.data.data.authorization_url,
        reference: ref,
        fees: fees
      }, 'Payment initialized')

    } catch (e) {
      console.error(e.response ? e.response.data : e.message)
      return fail(res, 'Payment failed. Please try again.', 500)
    }
  }

  return fail(res, 'Method not allowed', 405)
}
