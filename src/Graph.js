import React from 'react'
import { List, Map } from 'immutable'
import { scalePoint, scaleTime } from 'd3-scale'
import { timeYear } from 'd3-time'

import { DataSet } from './DataSet'
import { Axis } from './Axis'

export class Graph extends React.Component {
  render() {
    const gutterOffset = this.props.padding*2 + this.props.margin
    const graphWidth = this.props.width - gutterOffset*2
    const graphHeight = this.props.height - gutterOffset*2

    const xAxisProps = {
      scale: scaleTime(),
      ticks: timeYear,
      orientation: 'bottom',
    }
    const yAxisProps = {
      scale: scalePoint(),
      orientation: 'left',
    }
    if (this.props.dataset) {
      const xOffset = 64
      const yOffset = 24
      const ages = this.props.dataset.filters.get('age_group_id', List())
      const years = this.props.dataset.filters.get('year', List())

      const stepHeight = (graphHeight - yOffset - this.props.padding*2) / ages.size
      const stepWidth = (graphWidth - xOffset - this.props.padding*2) / years.size
      const step = Math.min(stepHeight, stepWidth)

      yAxisProps.scale = yAxisProps.scale
        .domain(ages.toArray())
        .range([0, step * ages.size])
      yAxisProps.ticks = ages.size
      yAxisProps.transform = `translate(${xOffset + gutterOffset}, ${this.props.padding})`

      xAxisProps.scale = xAxisProps.scale
        .domain([new Date(Number(years.first()), 0), new Date(Number(years.last()), 0)])
        .range([0, step * years.size])
      xAxisProps.transform = `translate(${xOffset + gutterOffset}, ${(step * ages.size) + this.props.padding})`
    }

    return (
      <svg width={graphWidth} height={graphHeight} padding={this.props.padding}>
        <Axis {...yAxisProps} />
        <Axis {...xAxisProps} />
      </svg>
    )
  }
}
