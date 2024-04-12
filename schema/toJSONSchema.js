const fs = require('fs')
const jsonfile = require('jsonfile')
const generateSchema = require('json-schema-generator')

const filePath = './plotly-v2-11b662.json' // Replace with your file path

jsonfile.readFile(filePath, function (err, obj) {
  if (err) console.error(err)
  else {
    const schemaPlotly = obj.schema.config
    fs.writeFileSync('config-plotly-schema.json', JSON.stringify(schemaPlotly, null, 2))

    const defaults = buildDefaults(schemaPlotly)
    fs.writeFileSync('config-defaults.js', 'const config =\n' + JSON.stringify(defaults, null, 2))

    const schemaJSON = buildSchema(schemaPlotly)
    fs.writeFileSync('config-json-schema.json', JSON.stringify(schemaJSON, null, 2))
  }
})

function buildDefaults (obj) {
  const defaults = {}
  for (const key of Object.keys(obj)) {
    defaults[key] = obj[key].dflt
  }
  return defaults
}

function buildSchema (obj) {
  const schema = {
    $id: 'https:// https://api.plot.ly/v2/plotly-schema.json',
    $schema: 'https://json-schema.org/draft/2020-12/schema'
  }
  schema.title = 'config'
  schema.properties = {}
  for (const key of Object.keys(obj)) {
    const type_ = determineType(obj[key])
    if (type_ !== undefined) {
      schema.properties[key] = {}
      schema.properties[key].description = obj[key].description
      schema.properties[key].type = type_
      //console.log(`${key} = ${JSON.stringify(type_)}`)
    } else {
      //console.log(`?${key} ${JSON.stringify(obj[key])}`)
    }
  }
  return schema
}

function determineType (obj) {
  const type_ = { type: undefined }

  if (obj.dflt !== undefined) {
    type_.default = obj.dflt
  }
  if (obj.valType === 'string') {
    type_.type = 'string'
  }
  if (obj.valType === 'boolean') {
    type_.type = 'boolean'
  }
  if (obj.valType === 'number') {
    type_.type = 'number'
    if (obj.min !== undefined || obj.max !== undefined) {
      if (obj.min !== undefined) {
        type_.minimum = obj.min
      }
      if (obj.max !== undefined) {
        type_.maximum = obj.max
      }
    }
  }
  if (type_.type === undefined) {
    return undefined
  }
  return type_
}
