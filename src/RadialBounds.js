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
    bounds.insert('path', 'rect')
      .attr('d', upper)
      .attr('fill', this.props.outerFill || 'black')
      .attr('stroke-width', 0)
  }

  onMouseOver() {
    select(this.refs.bounds)
      .insert('circle', 'circle')
      .attr('stroke', this.props.highlight)
      .attr('stroke-width', 1)
      .attr('opacity', 0.54)
      .attr('fill', this.props.highlight)
      .attr('fill-opacity', 0.12)
      .attr('r', this.props.maxRadius)
  }

  onMouseOut() {
    select(this.refs.bounds)
      .select('circle')
      .remove()
  }

  render() {
    return (
      <g ref="bounds" key={this.props.key}>
        <circle r={radialProportion(this.props.lowerRatio, this.props.maxRadius)} fill={this.props.innerFill || 'black'} />
        <rect
          x={-this.props.maxRadius}
          y={-this.props.maxRadius}
          opacity="0"
          width={this.props.maxRadius*2}
          height={this.props.maxRadius*2}
          onMouseOver={this.onMouseOver.bind(this)}
          onMouseOut={this.onMouseOut.bind(this)}
        />
      </g>
    )
  }
}

function radialProportion(ratio, maxRadius) {
  return Math.sqrt(Math.min(ratio, 1) * maxRadius * maxRadius)
}
