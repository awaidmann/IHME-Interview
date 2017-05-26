import React from 'react'
import { Map, List } from 'immutable'


export class Controls extends React.Component {
  buildOptions() {
    if (this.props.legend) {
      const order = this.props.legend.order('location')
      return this.props.legend.filter('location')
        .map((location) => {
          return (
            <option value={location.get(order.get('location'))}
              key={location.get(order.get('location_id'))}>
              { location.get(order.get('location_name')) }
            </option>
          )
        })
    }
    return <option value="">None</option>
  }

  render() {
    return (
      <div height={this.props.height} width={this.props.width}>
        <select
          name="location"
          value={this.props.location}
          onChange={(e) => {
            if (this.props.onLocationChange) this.props.onLocationChange(e.target.value)
          }}>
            { this.buildOptions() }
        </select>
      </div>
    )
  }
}
