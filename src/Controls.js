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
    let comparison = <div />
    if (this.state.comparison == 0) {
      comparison = (
        <select
          name="gender"
          value={this.state.gender}
          onChange={this.onGenderChange}>
            { this.buildOptions('sex', 'sex_id', 'sex_id', 'sex') }
        </select>)
    } else if (this.state.comparison == 1) {
      comparison = (
        <select
          name="bounds"
          value={this.state.bounds}
          onChange={this.onBoundsChange}>
            <option value={0}>Mean</option>
            <option value={1}>Lower</option>
            <option value={2}>Upper</option>
        </select>)
    }

    return (
      <div height={this.props.height} width={this.props.width}>
        <select
          name="location"
          value={this.state.location}
          onChange={this.onLocationChange}>
            { this.buildOptions('location', 'location', 'location_id', 'location_name') }
        </select>

        <select
          name="metric"
          value={this.state.metric}
          onChange={this.onMetricChange}>
            { this.buildOptions('metric', 'metric', 'metric', 'metric') }
        </select>

        <select
          name="comparison"
          value={this.state.comparison}
          onChange={this.onComparisonChange}>
          <option value={0}>{ 'Measurement Range' }</option>
          <option value={1}>{ 'Gender (F v M v Both)' }</option>
        </select>

        { comparison }
      </div>
    )
  }
}
