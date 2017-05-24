import React from 'react'
import { List } from 'immutable'
import { select } from 'd3-selection'
import { arc } from 'd3-shape'

export class RadialBounds extends React.Component {
  componentDidMount() {
    this.drawRadialBounds()
  }

  componentDidUpdate() {
    this.drawRadialBounds()
  }

  drawRadialBounds() {
    (this.props.ratios || List())
      .push(this.props.baseRatio)
      .sort()
      .map((ratio, i, thisList) => {
        return List([ratio, thisList.get(i + 1)])
      })
      .reduce((el, ratioPairs, i) => {
        if (ratioPairs.first() && ratioPairs.last()) {
          const ring = arc()
            .innerRadius(Math.min(ratioPairs.first(), 1) * this.props.maxR)
            .outerRadius(Math.min(ratioPairs.last(), 1) * this.props.maxR)
            .startAngle(0)
            .endAngle(2*Math.PI)
          el.append('path')
            .attr('d', ring)
            .attr('fill', i%2 ? 'red' : 'blue')
            .attr('stroke-width', 0)
        }
        return el
      }, select(this.refs.bounds))
      .attr('transform', `translate(${this.props.x}, ${this.props.y})`)
  }

  render() {
    return (<g ref="bounds" key={this.props.key}></g>)
  }
}
