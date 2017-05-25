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
    const upper = arc()
      .innerRadius(radialProportion(this.props.baseRatio, this.props.maxRadius))
      .outerRadius(radialProportion(this.props.upperRatio,this.props.maxRadius))
      .startAngle(0)
      .endAngle(2*Math.PI)

    const bounds = select(this.refs.bounds)
      .attr('transform', `translate(${this.props.x}, ${this.props.y})`)

    bounds.select('path').remove()
    bounds.append('path')
      .attr('d', upper)
      .attr('fill', this.props.outerFill || 'black')
      .attr('stroke-width', 0)
  }

  render() {
    return (
      <g ref="bounds" key={this.props.key}>
        <circle r={radialProportion(this.props.lowerRatio, this.props.maxRadius)} fill={this.props.innerFill || 'black'} />
      </g>
    )
  }
}

function radialProportion(ratio, maxRadius) {
  return Math.sqrt(Math.min(ratio, 1) * maxRadius * maxRadius)
}
