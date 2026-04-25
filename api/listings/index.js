const prisma = require('../lib/db')
const { ok, fail, getUser, calcFee } = require('../lib/helpers')

module.exports = async function(req, res) {

  if (req.method === 'GET') {
    var q = req.query || {}
    var where = { status: 'APPROVED', isActive: true }
    if (q.state)  where.state = { contains: q.state,  mode: 'insensitive' }
    if (q.lga)    where.lga   = { contains: q.lga,    mode: 'insensitive' }
    if (q.search) where.OR    = [
      { title: { contains: q.search, mode: 'insensitive' } },
      { state: { contains: q.search, mode: 'insensitive' } },
      { lga:   { contains: q.search, mode: 'insensitive' } },
      { city:  { contains: q.search, mode: 'insensitive' } },
    ]
    var page  = parseInt(q.page)  || 1
    var limit = parseInt(q.limit) || 20
    try {
      var listings = await prisma.listing.findMany({
        where: where,
        include: {
          photos: { take: 1 },
          landlord: { select: { firstName:true, lastName:true, phone:true, email:true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      })
      var total = await prisma.listing.count({ where: where })
      var enriched = listings.map(function(l) {
        return Object.assign({}, l, { fees: calcFee(l.annualRent) })
      })
      return ok(res, { listings: enriched, total: total, page: page })
    } catch (e) {
      console.error(e)
      return fail(res, 'Failed to fetch listings', 500)
    }
  }

  if (req.method === 'POST') {
    var user = await getUser(req)
    if (!user)                    return fail(res, 'Login required', 401)
    if (user.role !== 'LANDLORD') return fail(res, 'Only landlords can list properties', 403)

    var b = req.body || {}
    if (!b.title || !b.annualRent || !b.state || !b.lga || !b.city || !b.streetAddress || !b.bedrooms || !b.bathrooms)
      return fail(res, 'Please fill in all required fields')

    var fees = calcFee(parseFloat(b.annualRent))
    try {
      var listing = await prisma.listing.create({
        data: {
          landlordId:   user.id,
          title:        b.title,
          type:         b.type || 'Flat / Apartment',
          description:  b.description || '',
          annualRent:   fees.annualRent,
          platformFee:  fees.platformFee,
          totalPrice:   fees.totalAmount,
          state:        b.state,
          lga:          b.lga,
          city:         b.city,
          streetAddress: b.streetAddress,
          bedrooms:     parseInt(b.bedrooms),
          bathrooms:    parseInt(b.bathrooms),
          contactPhone: b.contactPhone || user.phone,
          contactEmail: b.contactEmail || user.email,
          status:       'PENDING_REVIEW'
        }
      })
      return ok(res, { listing: listing, fees: fees }, 'Listing submitted for admin review!')
    } catch (e) {
      console.error(e)
      return fail(res, 'Failed to create listing', 500)
    }
  }

  return fail(res, 'Method not allowed', 405)
}
