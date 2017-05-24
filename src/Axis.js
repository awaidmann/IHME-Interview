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
      select(this.refs.axis)
        .attr('transform', this.props.transform)
        .call(axis.ticks(this.props.ticks))
    }
  }

  render() {
    return (<g ref="axis"></g>)
  }
}
