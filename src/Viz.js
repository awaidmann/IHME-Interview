import React from 'react'

import { Graph } from './Graph'
import { DataSet } from './DataSet'

export class Viz extends React.Component {
  constructor(props) {
    super(props)
    this.state = { dataset: undefined }
  }

  componentDidMount() {
    DataSet.loadByRegion('G')
      .then(dataset => this.setState({ dataset }))
      .catch(err => {
        console.error(err)
        this.setState({ dataset: undefined })
      })
  }

  render() {
    return (
      <div>
        <Graph dataset={this.state.dataset} {...this.props} />
      </div>
    )
  }
}
