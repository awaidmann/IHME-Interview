import { List, Map, fromJS } from 'immutable'

const RESP_KEYS = {
  ORDER: 'order',
  INDEX_MAP: 'map',
  DATA: 'data',
}

export class DataSet {
  constructor(rawDataJSON) {
    this.dataSet = fromJS(rawDataJSON[RESP_KEYS.DATA] || [])
    this.indexMap = fromJS(rawDataJSON[RESP_KEYS.INDEX_MAP] || {})
    this.filters = this.indexMap.map((mapped) => {
      return mapped ? mapped.keySeq().toList() : List()
    })

    this.order = List(rawDataJSON[RESP_KEYS.ORDER] || [])
    this.orderIndexMap = this.order
      .butLast()
      .reduce((mapped, orderKey, i) => mapped.set(orderKey, i), Map())
    this.multipliers = this.order
      .butLast()
      .reduceRight((mults, orderKey, i, thisList) => {
        const prevMult = mults.get(i + 1, 1)
        return mults.set(i, prevMult * this.indexMap.get(orderKey, Map()).count())
      }, List())
      .rest()
      .push(1)
  }

  valueAt(filters) {
    const index = filters.reduce((target, filter, key) => {
      const filterIndex = this.orderIndexMap.get(key)
      return target + (this.indexMap.getIn([key, filter]) * this.multipliers.get(filterIndex))
    }, 0)
    return this.dataSet.get(index)
  }

}

export class DataSetLoader {
  static loadByRegion(region) {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest()
      req.onload = () => {
        if (req.readyState == 4 && req.status == 200) {
          try {
            resolve(new DataSet(JSON.parse(req.responseText)))
          } catch (err) {
            reject(err)
          }
        }
      }

      req.onerror = () => {
        reject(req.statusText)
      }

      req.open('GET', `./dist/${region}.json`, true)
      req.send(null)
    })
  }
}
