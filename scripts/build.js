
const path = require('path')

const _ = require('lodash')

const rollup = require('rollup')
const rollupBabel = require('rollup-plugin-babel')
const handlebars = require('handlebars')

const Promise = require('bluebird')

const utils = require('./utils')
const lint = require('./lint')

const fs = Promise.promisifyAll(require('fs-extra'))
const glob = Promise.promisify(require('glob'))

const PACKAGE = require('../bower.json')
const TARGET = PACKAGE['build-target']
const GLOBALS = PACKAGE['globals']
const NAME = PACKAGE['module-name']

function compileTemplates (basePath, dest) {
  return Promise.resolve()
    .then(() => fs.writeFile(
      dest, `import handlebars from 'handlebars'\n\nexport default {\n`
    ))
    .then(() => glob(`${basePath}/**/*.hbs`))
    .each((src) => {
      var name = path.basename(src).replace('.hbs', '')
      return Promise.resolve()
        .then(() => fs.readFileAsync(src))
        .then((data) => handlebars.precompile(data.toString()))
        .then((spec) => fs.appendFileAsync(
          dest, `'${name}': handlebars.template(${spec}),\n`
        ))
    })
    .then(() => fs.appendFileAsync(dest, `}\n`))
    .then(() => utils.log(`Compiled templates in '${basePath}' to '${dest}'`))
}

function packageApplication (entry, dest, moduleName, globals) {
  return Promise.resolve()
    .then(() => rollup.rollup({
      entry,
      external: _.keys(globals),
      plugins: [rollupBabel()]
    }))
    .then((bundle) => bundle.generate({
      dest,
      globals,
      moduleName,
      format: 'umd'
    }))
    .then((result) => {
      var mapFileName = `${dest}.map`
      var code = result.code + `\n//# sourceMappingURL=${mapFileName}`
      return Promise.all([
        fs.writeFileAsync(dest, code),
        fs.writeFileAsync(mapFileName, result.map)
      ])
    })
    .then(() => utils.log(`Packaged application at '${entry}' to '${dest}'`))
}

function build () {
  return Promise.resolve()
    .then(() => lint())
    .then(() => utils.mkdirs('dist'))
    .then(() => utils.mkdirs('dist/js'))
    .then(() => compileTemplates('templates', 'src/templates.js'))
    .then(() => packageApplication('src/index.js', TARGET, NAME, GLOBALS))
}

module.exports = build

if (!module.parent) {
  build().catch(utils.handleError)
}