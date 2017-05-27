import React from 'react'
import { Map, List } from 'immutable'

import { Graph } from './Graph'
import { Controls } from './Controls'
import { DataSet } from './DataSet'
import { Legend } from './Legend'

export class Viz extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      legend: undefined,
      datasets: Map(),
      dataset: undefined,
      filters: List(),
    }

    this.onLocationChange = this.fetchDataset.bind(this)
    this.onFiltersChange = (filters) => {
      this.setState({ filters: filters || List() })
    }
  }

  componentDidMount() {
    Legend.load()
      .then(legend => {
        this.setState({ legend })
      })
      .catch(err => {
        console.error(err)
        this.setState({ legend: undefined })
      })
  }

  fetchDataset(location) {
    if (this.state.datasets.has(location)) {
      this.setState({ dataset: this.state.datasets.get(location)/*, location*/ })
    } else {
      DataSet.loadByRegion(location)
        .then(dataset => this.setState({
          datasets: this.state.datasets.set(location, dataset),
          dataset,
          // location
        }))
        .catch(err => {
          console.error(err)
          this.setState({ dataset: undefined/*, location: undefined*/ })
        })
    }
  }

  render() {
    return (
      <div>
        <Controls
          {...this.props}
          width={this.props.width / 3}
          legend={this.state.legend}
          onLocationChange={this.onLocationChange}
          onFiltersChange={this.onFiltersChange}
          />
        <Graph
          {...this.props}
          width={this.props.width * (2/3)}
          legend={this.state.legend}
          dataset={this.state.dataset}

          r0Filter={this.state.filters.get(0, Map())}
          r1Filter={this.state.filters.get(1, Map())}
          r2Filter={this.state.filters.get(2, Map())}

          r0Fill='#00BCD4'
          r1Fill='#3F51B5'
          r2Fill='#F44336'
          />
      </div>
    )
  }
}
