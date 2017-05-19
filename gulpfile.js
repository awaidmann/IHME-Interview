'use strict'

const gulp = require('gulp')
const fs = require('fs')
const readline = require('readline')

const ROOT = './'
const DATA = `${ROOT}data/`
const DATA_CB = `${DATA}IHME_GBD_2013_OBESITY_PREVALENCE_1990_2013_CB_Y2014M10D08.CSV`
const DATA_SET = `${DATA}IHME_GBD_2013_OBESITY_PREVALENCE_1990_2013_Y2014M10D08.CSV`

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
  const rl = readline.createInterface({ input: fs.createReadStream(DATA_CB) })
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
    console.log('closed')
    cb()
  })
})

gulp.task('default', ['build'])
gulp.task('build', ['codebook'])
