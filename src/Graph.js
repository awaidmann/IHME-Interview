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
    let boundsComps = <div />
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

      const path = Map({ sex_id: '1', metric: 'obese' })
      const xFilters = this.props.dataset.filters.get('year', List())
      const yFilters = this.props.dataset.filters.get('age_group_id', List())
      boundsComps = xFilters
        .reduce((comps, xKey, i) => {
          const x = xAxisProps.scale(new Date(Number(xKey), 0)) + originX
          const pointPath = path.set('year', xKey)

          return yFilters.reduce((_comps, yKey, j) => {
            const dataPoint = this.props.dataset
              .valueAt(pointPath.set('age_group_id', yKey))
            if (dataPoint) {
              return _comps.push(
                <RadialBounds
                  key={`${i}.${j}`}
                  x={x}
                  y={originY - step - yAxisProps.scale(yKey)}
                  maxR={step/2}
                  ratios={dataPoint.rest()}
                  baseRatio={dataPoint.first()} />)
            }
            return _comps
          }, comps)
        }, List())
        .toArray()
    }

    return (
      <svg width={graphWidth} height={graphHeight} padding={this.props.padding}>
        { boundsComps }
        <Axis {...yAxisProps} />
        <Axis {...xAxisProps} />
      </svg>
    )
  }
}
