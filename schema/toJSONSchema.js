const fs = require('fs')
const path = require('path')
const jsonfile = require('jsonfile')
const generateSchema = require('json-schema-generator')

let filePath = './plotly-v2.json'

const url = 'https://api.plotly.com/v2/plot-schema?sha1'

fetch(url)
  .then(response => response.json())
  .then(data => writeSchema(data))
  .catch(error => console.error('Error:', error))

function writeSchema (data) {
  const fileDir = path.join(__dirname, data.sha1.slice(0, 6))
  if (!fs.existsSync(fileDir)) {
    fs.mkdirSync(fileDir)
  }
  filePath = path.join(fileDir, 'plotly-v2.json')
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  splitSchema(filePath)
}

function splitSchema (filePath) {
  const fileDir = path.dirname(filePath)
  jsonfile.readFile(filePath, function (err, obj) {
    if (err) console.error(err)
    else {
      const config = obj.schema.config
      let outFile = path.join(fileDir, 'config-plotly-schema.json')
      fs.writeFileSync(outFile, JSON.stringify(config, null, 2))

      const configDefaults = buildDefaults(config)
      outFile = path.join(fileDir, 'config-defaults.js')
      fs.writeFileSync(outFile, 'const config =\n' + JSON.stringify(configDefaults, null, 2))

      const configJSON = buildSchema(config, 'config')
      outFile = path.join(fileDir, 'config-json-schema.json')
      fs.writeFileSync(outFile, JSON.stringify(configJSON, null, 2))

      const layout = obj.schema.layout.layoutAttributes
      outFile = path.join(fileDir, 'layout-plotly-schema.json')
      fs.writeFileSync(outFile, JSON.stringify(layout, null, 2))

      const layoutDefaults = buildDefaults(layout)
      outFile = path.join(fileDir, 'layout-defaults.js')
      fs.writeFileSync(outFile, 'const layout =\n' + JSON.stringify(layoutDefaults, null, 2))

      const layoutJSON = buildSchema(layout, 'layout')
      outFile = path.join(fileDir, 'layout-json-schema.json')
      fs.writeFileSync(outFile, JSON.stringify(layoutJSON, null, 2))
    }
  })
}

function buildDefaults (obj) {
  const defaults = {}
  for (const key of Object.keys(obj)) {
    defaults[key] = obj[key].dflt
  }
  return defaults
}

function buildSchema (obj, title) {
  const schema = {
    $id: 'https:// https://api.plot.ly/v2/plotly-schema.json',
    $schema: 'https://json-schema.org/draft/2020-12/schema'
  }
  schema.title = title
  schema.properties = {}
  for (const key of Object.keys(obj)) {
    const type_ = determineType(obj[key])
    if (type_ !== undefined) {
      schema.properties[key] = {}
      schema.properties[key].description = obj[key].description
      schema.properties[key].type = type_
      //plotjs.log(`${key} = ${JSON.stringify(type_)}`)
    } else {
      //plotjs.log(`?${key} ${JSON.stringify(obj[key])}`)
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
