module.exports = function(req, res) {
  res.status(200).json({
    status: 'healthy',
    platform: 'NaijaRentals API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
}
