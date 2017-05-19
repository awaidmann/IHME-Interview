'use strict'

const gulp = require('gulp')
const fs = require('fs')
const readline = require('readline')

const ROOT = './'
const DATA = `${ROOT}data/`
const DATA_CB = `${DATA}IHME_GBD_2013_OBESITY_PREVALENCE_1990_2013_CB_Y2014M10D08.CSV`
const DATA_SET = `${DATA}IHME_GBD_2013_OBESITY_PREVALENCE_1990_2013_Y2014M10D08.CSV`

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
  let legend = { order: [], keys: [] }
  let partitions

  rl.on('line', (line) => {
    if (line) {
      const values = csvSafeSplit(line)
      if (!legend.keys.length) {
        const labels = { keys: values }
        labels[values[0]] = {}
        Object.assign(legend, labels)

      } else {
        const colsWithValues = values.filter((col) => col.length)
        if (colsWithValues.length) {
          if (!partitions) {
            legend.order.push(values[0])
            legend[legend.keys[0]][values[0]] = legend.keys.slice(1).reduce((desc, legendKey, index) => {
              if (legendKey && legendKey.length) {
                desc[legendKey] = values[index + 1]
              }
              return desc
            }, {})
          } else {
            if (!partitions.keys) {
              partitions.keys = values
              partitions.partitionIndex = values.reduce(
                (desc, partKey, index, iter) => {
                  if (partKey && partKey.length) {
                    if (!desc.sticky) {
                      desc.partIndex += 1
                      desc.sticky = true
                      desc.indices[desc.partIndex] = { start: index }
                    } else if (iter.length - 1 == index) {
                      desc.indices[desc.partIndex].end = index
                    }
                  } else if (desc.sticky) {
                    desc.indices[desc.partIndex].end = index - 1
                    desc.sticky = false
                  }
                  return desc
                }, { sticky: false, partIndex: -1, indices: [] }).indices
              partitions.partitions = Array(partitions.partitionIndex.length)
            } else {
              partitions.partitionIndex.reduce(
                (part, indices, partIndex) => {
                  const keys = partitions.keys.slice(indices.start, indices.end + 1)
                  const subValues = values.slice(indices.start, indices.end + 1)
                  const mapped = keys.reduce((sub, partKey, index) => {
                    const val = subValues[index]
                    if (val && val.length) sub[partKey] = subValues[index]
                    return sub
                  }, {})
                  if (!part[partIndex]) part[partIndex] = []
                  if (Object.keys(mapped).length) part[partIndex].push(mapped)
                  return part
                },
                partitions.partitions)
            }
          }
        } else {
          partitions = {}
        }
      }
    }
  })

  rl.on('close', () => {
    console.log(JSON.stringify(legend, null, 2))
    console.log(JSON.stringify(partitions, null, 2))
    console.log('closed')
    cb()
  })
})

gulp.task('default', ['build'])
gulp.task('build', ['codebook'])
