import React from 'react'
import { List, Map } from 'immutable'

import { DataSetLoader, DataSet } from './DataSetLoader'

export class Graph extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: List()
    }
  }

  componentDidMount() {
    DataSetLoader.loadByRegion(this.props.region)
      .then(dataSet => {
        const filters = dataSet.filters.map((filterList) => filterList.first())
        const years = dataSet.filters.get('year', Map()).count()
        this.interval = setInterval(() => {
          const index = Math.floor(Date.now() % years)
          const changingFilters = filters.set('year', dataSet.filters.getIn(['year', index]))
          const values = dataSet.valueAt(changingFilters)
          console.log(changingFilters.toJS())
          console.log(values.toJS())
          this.setState({ data: values || List() })
        }, 5000)
      })
      .catch(err => {
        console.error(err)
        this.setState({ data: List() })
      })
  }

  render() {
    return (
      <div>
        { `${this.state.data.get(1)} < ${this.state.data.get(0)} < ${this.state.data.get(2)}` }
      </div>
    )
  }
}
