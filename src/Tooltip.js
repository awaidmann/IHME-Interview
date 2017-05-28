import React from 'react'

export class Tooltip extends React.Component {
  render() {
    const width = 150
    const height = 100

    const xOffset = 16
    const yOffset = 24

    const anchorXDisplace = this.props.anchorX === 'right' ? -width : 0
    const anchorYDisplace = this.props.anchorY === 'bottom' ? -height : 0

    const visibility = this.props.visible ? 'visible' : 'hidden'
    const translate = `translate(${this.props.x || 0}, ${this.props.y || 0})`

    const format = Intl.NumberFormat('en-US',
      { style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format

    const calloutR = 4
    const calloutProps = { r: calloutR, cx: xOffset + anchorXDisplace }

    const textProps = {
      x: xOffset*2 + anchorXDisplace,
      fontFamily: "Arial, Helvetica, sans-serif",
      fontSize: 12
    }

    // <text x={xOffset*1.5 + anchorXDisplace}>
    //   <tspan {...textProps} y={yOffset + anchorYDisplace}>{ `${format(this.props.r0)}: ${this.props.r0Label}` }</tspan>
    //   <tspan {...textProps} y={yOffset*2 + anchorYDisplace}>{ `${format(this.props.r1)}: ${this.props.r1Label}` }</tspan>
    //   <tspan {...textProps} y={yOffset*3 + anchorYDisplace}>{ `${format(this.props.r2)}: ${this.props.r2Label}` }</tspan>
    // </text>

    // <circle {...calloutProps} cy={yOffset + anchorYDisplace} fill={this.props.r0Fill} />
    // <circle {...calloutProps} cy={yOffset*2 + anchorYDisplace} fill={this.props.r1Fill} />
    // <circle {...calloutProps} cy={yOffset*3 + anchorYDisplace} fill={this.props.r2Fill} />
    //
    // <text {...textProps} y={yOffset + anchorYDisplace}>{ `${format(this.props.r0)}: ${this.props.r0Label}` }</text>
    // <text {...textProps} y={yOffset*2 + anchorYDisplace}>{ `${format(this.props.r1)}: ${this.props.r1Label}` }</text>
    // <text {...textProps} y={yOffset*3 + anchorYDisplace}>{ `${format(this.props.r2)}: ${this.props.r2Label}` }</text>

    return (
      <g ref="tooltip" visibility={visibility} transform={translate}>
        <rect
          width={width}
          height={height}
          x={anchorXDisplace}
          y={anchorYDisplace}
          rx={5}
          ry={5}
          fill="#CFD8DC"
          opacity="0.9"
          />

        <circle {...calloutProps} cy={yOffset + anchorYDisplace} fill={this.props.r0Fill} />
        <circle {...calloutProps} cy={yOffset*2 + anchorYDisplace} fill={this.props.r1Fill} />
        <circle {...calloutProps} cy={yOffset*3 + anchorYDisplace} fill={this.props.r2Fill} />

        <text>
          <tspan {...textProps} y={calloutR + yOffset + anchorYDisplace}>{ `${format(this.props.r0)}: ${this.props.r0Label}` }</tspan>
          <tspan {...textProps} y={calloutR + yOffset*2 + anchorYDisplace}>{ `${format(this.props.r1)}: ${this.props.r1Label}` }</tspan>
          <tspan {...textProps} y={calloutR + yOffset*3 + anchorYDisplace}>{ `${format(this.props.r2)}: ${this.props.r2Label}` }</tspan>
        </text>
      </g>
    )
  }
}
