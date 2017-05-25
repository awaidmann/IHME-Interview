import React from 'react'

export class Controls extends React.Component {
  render() {
    return (
      <div height={this.props.height} width={this.props.width}>
        <select
          name="location"
          value={this.props.location}
          onChange={(e) => {
            if (this.props.onLocationChange) this.props.onLocationChange(e.target.value)
          }}>
            <option value="G">Global</option>
            <option value="USA">USA</option>
        </select>
      </div>
    )
  }
}
