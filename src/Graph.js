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
    if (this.props.legend) {
      const xOffset = 64
      const yOffset = 24

      const xFilters = this.props.legend.filter('year').map((x) => x.get(0))
      const adjXCount = xFilters.size + 1

      const yOrder = this.props.legend.order('age')
      let yFilters = this.props.legend.filter('age', Map({ 'age_group': (a) => a ? a.endsWith('yrs') : false }))
      const yFiltersRevMap = this.props.legend.filter('age')
        .reduce((rev, linked) => {
          return rev.set(
            linked.get(yOrder.get('age_group')),
            linked.get(yOrder.get('age_group_id')))
        }, Map())
      yFilters = yFilters.map((y) => y.get(yOrder.get('age_group')))
      const adjYCount = yFilters.size + 1

      const stepHeight = (graphHeight - yOffset - this.props.padding*2) / adjYCount
      const stepWidth = (graphWidth - xOffset - this.props.padding*2) / adjXCount
      const step = Math.min(stepHeight, stepWidth)

      const originX = xOffset + gutterOffset
      const originY = (step * adjYCount) + this.props.padding

      yAxisProps.scale = yAxisProps.scale
        .domain(yFilters
          .push('')
          .toArray())
        .range([0, step * adjYCount])
      yAxisProps.ticks = adjYCount
      yAxisProps.originX = originX
      yAxisProps.originY = this.props.padding

      xAxisProps.scale = xAxisProps.scale
        .domain([new Date(Number(xFilters.first()) - 1, 0), new Date(Number(xFilters.last()), 0)])
        .range([0, step * adjXCount])
      xAxisProps.originX = originX
      xAxisProps.originY = originY

      if (this.props.dataset) {
        boundsComps = xFilters
          .reduce((comps, xKey, i) => {
            const x = xAxisProps.scale(new Date(Number(xKey), 0)) + originX
            const filterWithX = Map().set('year', xKey)

            return yFilters.reduce((_comps, yKey, j) => {
              const filterWithY = filterWithX.set('age_group_id', yFiltersRevMap.get(yKey))
              const r0 = this.props.dataset.valueAt(filterWithY.merge(this.props.r0Filter), List())
                .get(this.props.r0Filter.get('value'), 0)
              const r1 = this.props.dataset.valueAt(filterWithY.merge(this.props.r1Filter), List())
                .get(this.props.r1Filter.get('value'), 0)
              const r2 = this.props.dataset.valueAt(filterWithY.merge(this.props.r2Filter), List())
                .get(this.props.r2Filter.get('value'), 0)

              const lower = Math.min(r0, r1, r2)
              const upper = Math.max(r0, r1, r2)
              const base = Math.max(Math.min(r0, r1), Math.min(r1, r2), Math.min(r0, r2))

              let innerFill
              let centerFill
              let outerFill
              if (lower == r0) {
                innerFill = this.props.r0Fill
                centerFill = upper == r1 ? this.props.r2Fill : this.props.r1Fill
                outerFill = upper == r1 ? this.props.r1Fill : this.props.r2Fill
              } else if (lower == r1) {
                innerFill = this.props.r1Fill
                centerFill = upper == r0 ? this.props.r2Fill : this.props.r0Fill
                outerFill = upper == r0 ? this.props.r0Fill : this.props.r2Fill
              } else {
                innerFill = this.props.r2Fill
                centerFill = upper == r0 ? this.props.r1Fill : this.props.r0Fill
                outerFill = upper == r0 ? this.props.r0Fill : this.props.r1Fill
              }

              return _comps.push(
                <RadialBounds
                  key={`${i}.${j}`}
                  x={x}
                  y={originY - step - yAxisProps.scale(yKey)}
                  maxRadius={step/2}
                  lowerRatio={lower}
                  upperRatio={upper}
                  baseRatio={base}
                  highlight='#00BCD4'
                  innerFill={innerFill}
                  outerFill={outerFill}
                  centerFill={centerFill}
                  />)
            }, comps)
          }, List())
          .toArray()
      }
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
