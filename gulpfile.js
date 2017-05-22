'use strict'

const gulp = require('gulp')
const del = require('del')
const seq = require('gulp-sequence')
const fs = require('fs')
const readline = require('readline')

const config = require('./data.config')

const ROOT = './'
const DIST = `${ROOT}dist/`
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
                desc[legendKey] = values[index]
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
    const codingKey = filteredCols[filteredCols.length - 1]
    Object.keys(partitions.keys).reduce(
      (lgnd, partKey) => {
        if (lgnd.keys && lgnd.keys[partKey]) {
          lgnd.keys[partKey][codingKey] = partitions.keys[partKey]
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
      fs.mkdir(DIST, (err) => {
        if (err) return cb(err)
        const localSortOrder = config.sort_order.slice(1)
        const codingKey = LEGEND.cols[LEGEND.cols.length - 1]
        const codingMap = localSortOrder.reduce((map, sortKey) => {
          const valueMap = (LEGEND.keys[sortKey] || {})[codingKey]
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
          .map(sortKey => ((LEGEND.keys[sortKey] || {})[codingKey] || []).length)
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
                  fs.writeFile(`${DIST}${file}.json`,
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

gulp.task('rm:tmp', () => del([TMP]))

gulp.task('rm:build', () => del([DIST]))

gulp.task('default', ['build'])
gulp.task('build', seq('rm:build', 'codebook', 'minimize', 'rm:tmp'))
