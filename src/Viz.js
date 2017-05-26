import React from 'react'
import { Map } from 'immutable'

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
      location: undefined,
    }
  }

  componentDidMount() {
    Legend.load()
      .then(legend => {
        this.setState({ legend })
        this.fetchDataset(this.state.location)
      })
      .catch(err => {
        console.error(err)
        this.setState({ legend: undefined })
      })
  }

  fetchDataset(location) {
    if (this.state.datasets.has(location)) {
      this.setState({ dataset: this.state.datasets.get(location) })
    } else {
      DataSet.loadByRegion(location)
        .then(dataset => this.setState({
          datasets: this.state.datasets.set(location, dataset),
          dataset,
          location
        }))
        .catch(err => {
          console.error(err)
          this.setState({ dataset: undefined, location: undefined })
        })
    }
  }

  render() {
    const controlsHeight = 64
    return (
      <div>
        <Graph
          legend={this.state.legend}
          dataset={this.state.dataset}
          {...this.props}
          height={this.props.height - controlsHeight}
          />
        <Controls
          {...this.props}
          height={controlsHeight}
          legend={this.state.legend}
          value={this.state.location}
          onLocationChange={location => { this.fetchDataset(location) }}
          />
      </div>
    )
  }
}
