import React from 'react'
import { Map, List } from 'immutable'


export class Controls extends React.Component {
  constructor(props) {
    super(props)
    this.state = { comparison: 0, bounds: 0 }

    this.onLocationChange = (e) => {
      this.setState({ location: e.target.value }, () => {
        if (this.props.onLocationChange) {
          this.props.onLocationChange(this.state.location)
        }
      })
    }

    this.onFiltersChange = (filters) => {
      if (this.props.onFiltersChange) {
        this.props.onFiltersChange(filters)
      }
    }

    this.onMetricChange = this.onMetricChange.bind(this)
    this.onComparisonChange = this.onComparisonChange.bind(this)
    this.onGenderChange = this.onGenderChange.bind(this)
    this.onBoundsChange = this.onBoundsChange.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.legend && nextProps.legend) {
      const getInitial = (legend, group, field) => {
        return legend.filter(group).getIn([0, legend.order(group).get(field)])
      }

      this.setState({
        location: getInitial(nextProps.legend, 'location', 'location'),
        metric: getInitial(nextProps.legend, 'metric', 'metric'),
        gender: getInitial(nextProps.legend, 'sex', 'sex_id')
      }, () => {
        if (this.props.onLocationChange) {
          this.props.onLocationChange(this.state.location)
        }
        this.computeFilters()
      })
    }
  }

  onComparisonChange(e) {
    this.setState({ comparison: e.target.value }, this.computeFilters.bind(this))
  }

  onMetricChange(e) {
    this.setState({ metric: e.target.value }, this.computeFilters.bind(this))
  }

  onGenderChange(e) {
    this.setState({ gender: e.target.value }, this.computeFilters.bind(this))
  }

  onBoundsChange(e) {
    this.setState({ bounds: e.target.value }, this.computeFilters.bind(this))
  }

  computeFilters() {
    let labels = List()
    let filter = Map({ metric: this.state.metric })
    let filters = List()
    if (this.state.comparison == 0) {
      filter = filter.set('sex_id', this.state.gender)
      filters = List([filter.set('value', 0), filter.set('value', 1), filter.set('value', 2)])
      labels = List(['mean', 'lower', 'upper'])
    } else if (this.state.comparison == 1) {
      const idIndex = this.props.legend.order('sex').get('sex_id')
      filters = this.props.legend
        .filter('sex')
        .map(value => {
          return filter
            .set('sex_id', value.get(idIndex))
            .set('value', this.state.bounds)
          })

      const labelIndex = this.props.legend.order('sex').get('sex')
      labels = this.props.legend.filter('sex')
        .map(value => value.get(labelIndex))
    }

    this.onFiltersChange(Map({ filters, labels }))
  }

  buildOptions(group, valuePath, keyPath, displayPath) {
    if (this.props.legend) {
      const order = this.props.legend.order(group)
      return this.props.legend.filter(group)
        .map((option) => {
          return (
            <option value={option.get(order.get(valuePath))}
              key={option.get(order.get(keyPath))}>
              { option.get(order.get(displayPath)) }
            </option>
          )
        })
    }
    return <option value="">None</option>
  }

  render() {
    const rowStyle = { width: "100%" }

    const labelStyle = Object.assign({}, rowStyle,
      {
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 16,

      })
    const selectStyle = Object.assign({}, rowStyle,
      {
        marginTop: 4,
        marginBottom: 16,
      })

    let comparison = <div />
    if (this.state.comparison == 0) {
      comparison = (
        <div style={rowStyle}>
          <label style={labelStyle}>Gender</label>
          <select
            name="gender"
            style={selectStyle}
            value={this.state.gender}
            onChange={this.onGenderChange}>
              { this.buildOptions('sex', 'sex_id', 'sex_id', 'sex') }
          </select>
        </div>)
    } else if (this.state.comparison == 1) {
      comparison = (
        <div style={rowStyle}>
          <label style={labelStyle}>Measurement</label>
          <select
            name="bounds"
            style={selectStyle}
            value={this.state.bounds}
            onChange={this.onBoundsChange}>
              <option value={0}>Mean</option>
              <option value={1}>Lower</option>
              <option value={2}>Upper</option>
          </select>
        </div>)
    }

    const mainStyle = Object.assign({}, {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignContent: 'flex-start'
    }, this.props.style)

    return (
      <div style={mainStyle}>
        <div style={rowStyle}>
          <label style={labelStyle} for="location">Country/Region</label>
          <select
            name="location"
            style={selectStyle}
            value={this.state.location}
            onChange={this.onLocationChange}>
              { this.buildOptions('location', 'location', 'location_id', 'location_name') }
          </select>
        </div>


        <div style={rowStyle}>
          <label style={labelStyle}>Metric</label>
          <select
            name="metric"
            style={selectStyle}
            value={this.state.metric}
            onChange={this.onMetricChange}>
              { this.buildOptions('metric', 'metric', 'metric', 'metric') }
          </select>
        </div>


        <div style={rowStyle}>
          <label style={labelStyle}>Comparison Type</label>
          <select
            name="comparison"
            style={selectStyle}
            value={this.state.comparison}
            onChange={this.onComparisonChange}>
            <option value={0}>{ 'Measurement Bounds' }</option>
            <option value={1}>{ 'Gender' }</option>
          </select>
        </div>

        { comparison }
      </div>
    )
  }
}
