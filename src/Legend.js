import { Map, List, fromJS } from 'immutable'

export class Legend {
  constructor(rawLegendJSON) {
    this.legend = fromJS(rawLegendJSON)
  }

  groups() {
    return this.legend.keySeq().toList()
  }

  order(group) {
    return this.legend.getIn([group, 'order'], List())
      .reduce((order, detailKey) => {
        return order.set(detailKey, this.legend.getIn([group, 'details', detailKey, 'index']))
      }, Map())
  }

  filter(group, filterMap) {
    if (group) {
      if (filterMap && filterMap.size) {
        const indices = filterMap.map((_, filterKey) => {
          return this.legend.getIn([group, 'details', filterKey, 'index'])
        })
        return this.legend.getIn([group, 'values'], List())
          .filter((value) => {
            return indices.reduce((include, index, filterKey) => {
              return include && (filterMap.get(filterKey, () => true)(value.get(index)))
            }, true)
          })

      } else {
        return this.legend.getIn([group, 'values'])
      }
    }
  }

  static load() {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest()
      req.onload = () => {
        if (req.readyState == 4 && req.status == 200) {
          try {
            resolve(new Legend(JSON.parse(req.responseText)))
          } catch (err) {
            reject(err)
          }
        }
      }

      req.onerror = () => {
        reject(req.statusText)
      }

      req.open('GET', `./partition/legend.json`, true)
      req.send(null)
    })
  }
}
