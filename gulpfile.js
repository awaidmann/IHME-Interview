'use strict'

const gulp = require('gulp')
const del = require('del')
const seq = require('gulp-sequence')
const fs = require('fs')
const readline = require('readline')

const rollup = require('rollup')
const rollup_babel = require('rollup-plugin-babel')
const rollup_node = require('rollup-plugin-node-resolve')
const rollup_commonjs = require('rollup-plugin-commonjs')
const rollup_replace = require('rollup-plugin-replace')
const rollup_uglify = require('rollup-plugin-uglify')

const config = require('./data.config')

const ROOT = './'
const PARTITION = `${ROOT}partition/`
const BUILD = `${ROOT}build/`
const TMP = `${ROOT}tmp/`

let LEGEND = { order: [], cols: [], keys: {} }

function csvSafeSplit(line) {
  const split = []
  if (line && line.length) {
    let enumerated
    let escaped = false
    let splitStart = 0
    for(let i = 0; i<line.length; i++) {
      if (line[i] === '\"') {
        escaped = !escaped
      } else if (!escaped) {
        const sub = line.substring(splitStart, i).trim()
        if (line[i] === ',') {
          split.push(enumerated ? enumerated.concat([sub]) : sub)
          enumerated = undefined
          splitStart = i+1
        } else if (line[i] === ';') {
          enumerated = (enumerated || []).concat([sub])
          splitStart = i+1
        }
      }
    }
    split.push(line.substring(splitStart))
  }
  return split
}

gulp.task('codebook', (cb) => {
  const CB_HEADER_MAP = {
    'Variable': 'id',
    'Label': 'label',
    'Value Coding': 'values',
  }

  const rl = readline.createInterface({ input: fs.createReadStream(config.legend) })
  let legend = { order: [], cols: [], keys: {} }
  let partitions

  rl.on('line', (line) => {
    if (line) {
      const values = csvSafeSplit(line)
      if (!legend.cols.length) {
        legend.cols = values

      } else {
        const colsWithValues = values.filter((col) => col.length)
        if (colsWithValues.length) {
          if (!partitions) {
            legend.order.push(values[0])
            legend.keys[values[0]] = legend.cols.reduce((desc, legendKey, index) => {
              if (legendKey && legendKey.length) {
                desc[CB_HEADER_MAP[legendKey]] = values[index]
              }
              return desc
            }, {})
          } else {
            if (!partitions.keys) {
              partitions.keys = values.reduce(
                (allKeys, partKey) => {
                  if (partKey && partKey.length) {
                    allKeys[partKey] = []
                  }
                  return allKeys
                }, {})
              partitions.order = values
            } else {
              values.reduce(
                (partitionMap, value, index) => {
                  const partitionKey = partitions.order[index]
                  if (partitionKey && partitionKey.length && value && value.length) {
                    partitionMap[partitionKey].push(value)
                  }
                  return partitionMap
                }, partitions.keys)
            }
          }
        } else {
          partitions = {}
        }
      }
    }
  })

  rl.on('close', () => {
    const filteredCols = legend.cols.filter(col => col && col.length)
    Object.keys(partitions.keys).reduce(
      (lgnd, partKey) => {
        if (lgnd.keys && lgnd.keys[partKey]) {
          lgnd.keys[partKey].values = partitions.keys[partKey]
        }
        return lgnd
      }, legend)

    LEGEND = legend
    LEGEND.cols = filteredCols
    cb()
  })
})

gulp.task('partition', (cb) => {
  fs.mkdir(TMP, (err) => {
    if (err) return cb(err)

    const rl = readline.createInterface({ input: fs.createReadStream(config.data) })
    let revOrder

    rl.on('line', (line) => {
      if (line) {
        const values = csvSafeSplit(line)
        if (!revOrder) {
          LEGEND.order = values
          revOrder = values.reduce((rev, key, i) => {
            rev[key] = i
            return rev
          }, {})
        } else {
          const orderIndex = revOrder[config.sort_order[0]]
          if (orderIndex > -1 && orderIndex < values.length) {
            const fileName = values[orderIndex]
            if (fileName && fileName.length) {
              fs.appendFile(`${TMP}${fileName}`, `${line}\n`, () => {})
            }
          }
        }
      }
    })
    rl.on('close', () => cb())
  })
})

gulp.task('minimize', ['partition'], (cb) => {
  fs.readdir(TMP, (err, fileNames) => {
    if (err) return cb(err)
    if (fileNames) {
      fs.mkdir(PARTITION, (err) => {
        if (err) return cb(err)
        const localSortOrder = config.sort_order.slice(1)
        const codingMap = localSortOrder.reduce((map, sortKey) => {
          const valueMap = (LEGEND.keys[sortKey] || {}).values
          if (valueMap) {
            map[sortKey] = (Array.isArray(valueMap) ? valueMap : [valueMap])
              .reduce((acc, v, i) => {
                acc[v] = i
                return acc
              }, {})
          }
          return map
        }, {})
        const codingLengths = localSortOrder.slice(0,-1)
          .map(sortKey => ((LEGEND.keys[sortKey] || {}).values || []).length)
        const partitionIndices = localSortOrder.map((sortKey) => {
          if (Array.isArray(sortKey)) {
            return sortKey.map(valKey => LEGEND.order.indexOf(valKey))
          } else {
            return LEGEND.order.indexOf(sortKey)
          }
        })

        Promise.all(
          fileNames.map(file => {
            return new Promise(
              (resolve, reject) => {
                const rl = readline.createInterface({ input: fs.createReadStream(`${TMP}${file}`) })
                const data = Array(codingLengths.reduce((length, dimLength) => length * dimLength, 1))

                rl.on('line', line => {
                  if (line) {
                    const values = csvSafeSplit(line)
                    const valueIndex = partitionIndices[partitionIndices.length - 1]
                    const selectedData = Array.isArray(valueIndex) ? valueIndex.map(index => values[index]) : values[valueIndex]

                    const targetIndex = partitionIndices.slice(0, -1)
                      .map(index => codingMap[LEGEND.order[index]][values[index]])
                      .reduce((target, valIndex, j) => {
                          return target + (valIndex * codingLengths.slice(j+1).reduce((mSum, l) => mSum*l, 1))
                        }, 0)

                    data[targetIndex] = selectedData
                  }
                })

                rl.on('close', () => {
                  fs.writeFile(`${PARTITION}${file}.json`,
                    JSON.stringify({ order: localSortOrder, map: codingMap, data }),
                    (err) => err ? reject(err) : resolve())
                })
              })
          })
        ).then(() => cb())
        .catch(err => cb(err))
      })
    }
  })
})

gulp.task('legend', (cb) => {
  const grouping = LEGEND.order.reduce((groups, legendKey) => {
    if (legendKey && legendKey.length) {
      const keyData = (LEGEND.keys[legendKey] || {})

      const group = legendKey.split('_')[0]
      const details = {}
      details[legendKey] = {
        label: keyData.label,
        index: ((groups[group] || {}).order || []).length,
      }
      const values = keyData.values || []
      if (groups[group]) {
        groups[group].order.push(legendKey)
        groups[group].values.map((val, i) => val.push(values[i]))
        Object.assign(groups[group].details, details)
      } else {
        groups[group] = {
          order: [legendKey],
          details,
          values: (Array.isArray(values) ? values : [values]).map(val => [val]),
        }
      }
    }
    return groups
  }, {})

  fs.writeFile(`${PARTITION}legend.json`,
    JSON.stringify(grouping, null, 2),
    err => cb(err))
})

gulp.task('app', (cb) => {
  rollup.rollup({
    entry: 'index.js',
    plugins: [
      rollup_replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      rollup_node(),
      rollup_commonjs({
        namedExports: {
          'node_modules/immutable/dist/immutable.js': ['List', 'Map', 'Record', 'fromJS']
        }
      }),
      rollup_babel(),
      rollup_uglify(),
    ]
  }).then(bundle => {
    return bundle.write({
      format: 'umd',
      sourceMap: true,
      dest: `${BUILD}app.js`
    })
  })
  .then(() => cb())
  .catch(err => cb(err))
})

gulp.task('rm:tmp', () => del([TMP]))
gulp.task('rm:build', () => del([BUILD]))
gulp.task('rm:partition', () => del([TMP, PARTITION]))

gulp.task('default', ['build'])
gulp.task('build', ['build:data', 'build:app'])
gulp.task('build:data', seq('rm:partition', 'codebook', 'minimize', 'legend', 'rm:tmp'))
gulp.task('build:app', seq('rm:build', 'app'))
