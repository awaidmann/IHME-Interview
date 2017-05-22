import React from 'react'
import { DataSetLoader } from './DataSetLoader'

export class Graph extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: []
    }
  }

  componentDidMount() {
    DataSetLoader.loadByRegion(this.props.region)
      .then(regionData => {
        this.setState({ data: regionData.data || [] })
      })
      .catch(err => {
        console.error(err)
        this.setState({ data: [] })
      })
  }

  render() {
    const formatted = this.state.data.map((bounds) => {
      return <li>{ `${bounds[1]} < ${bounds[0]} < ${bounds[2]}` }</li>
    })
    return (
      <div>
        <ul>{ formatted }</ul>
      </div>
    )
  }
}
