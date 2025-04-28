module.exports = async (err, context) => {
  if (!err || err.code === 'EACCESS') return {}

  throw err
}
