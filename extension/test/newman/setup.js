const fs = require('fs')
const path = require('path')

const envTemplate = JSON.parse(fs.readFileSync(path.join(__dirname, 'environment-template.json')))

const settableValues = envTemplate.values.filter(value => value.value === '***')

if ((process.argv.length - 2) !== settableValues.length) {
  console.log('Usage:')
  console.log(`setup [${settableValues.map(value => value.key).join('] [')}]\n`)
  console.log('Parameters:')
  settableValues.forEach(value => console.log(`${value.key}\t${value.description}`))
  console.log() // add one newline
  process.exit(0)
}

settableValues.forEach((value, index) => {
  envTemplate.values.find(originalValue => originalValue.key === value.key).value = process.argv[index + 2]
})

fs.writeFileSync(path.join(__dirname, 'environment.json'), JSON.stringify(envTemplate, null, 2))
console.log('done')
