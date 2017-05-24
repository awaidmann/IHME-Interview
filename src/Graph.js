import React from 'react'
import { List, Map } from 'immutable'
import { scalePoint, scaleTime } from 'd3-scale'
import { timeYear } from 'd3-time'

import { DataSet } from './DataSet'
import { Axis } from './Axis'
import { RadialBounds } from './RadialBounds'

export class Graph extends React.Component {
  render() {
    const gutterOffset = this.props.padding*2 + this.props.margin
    const graphWidth = this.props.width - gutterOffset*2
    const graphHeight = this.props.height - gutterOffset*2

    const xAxisProps = {
      scale: scaleTime(),
      ticks: timeYear,
      orientation: 'bottom',
      offsetStart: true,
    }
    const yAxisProps = {
      scale: scalePoint(),
      orientation: 'left',
      offsetEnd: true,
    }
    let bounds = <div />
    if (this.props.dataset) {
      const xOffset = 64
      const yOffset = 24
      const ages = this.props.dataset.filters.get('age_group_id', List()).push('')
      let years = this.props.dataset.filters.get('year', List())
      years = years.unshift(Number(years.first()) - 1)

      const stepHeight = (graphHeight - yOffset - this.props.padding*2) / ages.size
      const stepWidth = (graphWidth - xOffset - this.props.padding*2) / years.size
      const step = Math.min(stepHeight, stepWidth)

      const originX = xOffset + gutterOffset
      const originY = (step * ages.size) + this.props.padding
      yAxisProps.scale = yAxisProps.scale
        .domain(ages.toArray())
        .range([0, step * ages.size])
      yAxisProps.ticks = ages.size
      yAxisProps.originX = originX
      yAxisProps.originY = this.props.padding

      xAxisProps.scale = xAxisProps.scale
        .domain([new Date(Number(years.first()), 0), new Date(Number(years.last()), 0)])
        .range([0, step * years.size])
      xAxisProps.originX = originX
      xAxisProps.originY = originY

      bounds = <RadialBounds x={step + originX} y={originY - step} maxR={step/2} ratios={List([0.1, 0.25, 0.3, 0.7, 2])} baseRatio={0.5}/>
    }

    return (
      <svg width={graphWidth} height={graphHeight} padding={this.props.padding}>
        { bounds }
        <Axis {...yAxisProps} />
        <Axis {...xAxisProps} />
      </svg>
    )
  }
}
