import React from 'react'
import { select } from 'd3-selection'
import { axisRight, axisLeft, axisTop, axisBottom } from 'd3-axis'

export class Axis extends React.Component {
  componentDidMount() {
    this.drawAxis()
  }

  componentDidUpdate() {
    this.drawAxis()
  }

  drawAxis() {
    let axis
    switch(this.props.orientation) {
      case 'top':
        axis = axisTop(this.props.scale)
        break
      case 'bottom':
        axis = axisBottom(this.props.scale)
        break
      case 'right':
        axis = axisRight(this.props.scale)
        break
      case 'left':
        axis = axisLeft(this.props.scale)
        break
    }
    if (axis) {
      const offsetStart = this.props.offsetStart
      const offsetEnd = this.props.offsetEnd
      select(this.refs.axis)
        .attr('transform', this.props.transform)
        .call(axis.ticks(this.props.ticks))
      .selectAll('g')
      .select(function(d, i, nodes) {
        if (offsetStart) {
          return i == 0 ? this : null
        } else if (offsetEnd) {
          return i == nodes.length ? this : null
        }
      })
      .select('text')
        .text('')
    }
  }

  render() {
    return (<g ref="axis"></g>)
  }
}
