import React from 'react'
import { List } from 'immutable'
import { select } from 'd3-selection'
import { transition } from 'd3-transition'
import { easeCubicInOut } from 'd3-ease'

export class RadialBounds extends React.Component {
  componentDidMount() {
    const bounds = select(this.refs.bounds)
      .attr('transform', `translate(${this.props.x}, ${this.props.y})`)

    bounds.insert('circle', '.hitbox')
      .attr('class', 'inner-radial')
      .attr('r', radialProportion(this.props.lowerRatio, this.props.maxRadius))
      .attr('fill', this.props.innerFill || 'black')

    bounds.insert('circle', '.inner-radial')
      .attr('class', 'bounds-radial')
      .attr('r', radialProportion(this.props.baseRatio, this.props.maxRadius))
      .attr('fill', this.props.centerFill || 'white')

    bounds.insert('circle', '.bounds-radial')
      .attr('class', 'outer-radial')
      .attr('r', radialProportion(this.props.upperRatio, this.props.maxRadius))
      .attr('fill', this.props.outerFill || 'black')
  }

  componentDidUpdate() {
    const bounds = select(this.refs.bounds)
    const duration = 1000
    const ease = easeCubicInOut
    bounds.selectAll('*').interrupt()
    bounds.select('.inner-radial')
      .transition()
      .duration(duration)
      .ease(ease)
      .attr('r', radialProportion(this.props.lowerRatio, this.props.maxRadius))
      .attr('fill', this.props.innerFill || 'black')

    bounds.select('.bounds-radial')
      .transition()
      .duration(duration)
      .ease(ease)
      .attr('r', radialProportion(this.props.baseRatio, this.props.maxRadius))
      .attr('fill', this.props.centerFill || 'white')

    bounds.select('.outer-radial')
      .transition()
      .duration(duration)
      .ease(ease)
      .attr('r', radialProportion(this.props.upperRatio, this.props.maxRadius))
      .attr('fill', this.props.outerFill || 'black')
  }

  onMouseOver() {
    select(this.refs.bounds)
      .insert('circle', '.outer-radial')
      .attr('class', 'highlight')
      .attr('stroke', this.props.highlight)
      .attr('stroke-width', 1)
      .attr('opacity', 0.54)
      .attr('fill', this.props.highlight)
      .attr('fill-opacity', 0.12)
      .attr('r', this.props.maxRadius)
  }

  onMouseOut() {
    select(this.refs.bounds)
      .select('.highlight')
      .remove()
  }

  render() {
    return (
      <g ref="bounds" key={this.props.key}>
        <rect
          className="hitbox"
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
