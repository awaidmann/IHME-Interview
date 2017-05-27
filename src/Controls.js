import React from 'react'
import { Map, List } from 'immutable'


export class Controls extends React.Component {
  buildOptions(group, valuePath, keyPath, displayPath) {
    if (this.props.legend) {
      const order = this.props.legend.order(group)
      return this.props.legend.filter(group)
        .map((option) => {
          return (
            <option value={option.get(order.get(valuePath))}
              key={option.get(order.get(keyPath))}>
              { option.get(order.get(displayPath)) }
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
            { this.buildOptions('location', 'location', 'location_id', 'location_name') }
        </select>

        <select
          name="metric"
          value={this.props.metric}
          onChange={(e) => {
            if (this.props.onMetricChange) this.props.onMetricChange(e.target.value)
          }}>
            { this.buildOptions('metric', 'metric', 'metric', 'metric') }
        </select>
      </div>
    )
  }
}
