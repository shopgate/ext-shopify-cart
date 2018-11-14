const fs = require('fs')
const path = require('path')

if (!process.argv[2]) {
  console.log('Usage: setupNewman [product_id_limited_stock_of_2]\n')
  console.log('Parameters:')
  console.log('product_id_limited_stock_of_2      A Shopify product ID of a product with stock limited to 2 and active inventory control.\n')
  process.exit(0)
}

const envTemplate = JSON.parse(fs.readFileSync(path.join(__dirname, 'environment-template.json')))

envTemplate.values = envTemplate.values.map(value => {
  const newValue = Object.assign({}, value)
  if (newValue.key === 'product_id_limited_stock_of_2') newValue.value = process.argv[2]

  return newValue
})

fs.writeFileSync(path.join(__dirname, 'environment.json'), JSON.stringify(envTemplate, null, 2))
console.log('done')
