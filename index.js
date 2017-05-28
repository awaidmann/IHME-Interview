import React from 'react'
import ReactDOM from 'react-dom'

import { Viz } from './src/Viz'

const style = {
  height: window.screen.availHeight,
  width: window.screen.availWidth,
  margin: 4,
  padding: 8,
}

ReactDOM.render(
  <Viz {...style}/>,
  document.getElementById('react')
)
