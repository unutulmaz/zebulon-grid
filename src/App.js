import React, { Component } from 'react'
import {ResizableBox} from 'react-resizable'

import {ChartConfiguration, Chart, GridConfiguration, Grid, Store} from './orb'

import './App.css'
import logo from './logo.svg'

class App extends Component {
  constructor (props) {
    super(props)
    const store = new Store(props.config, this.forceUpdate.bind(this))
    this.state = {store}

    this.onDrilldown = this.onDrilldown.bind(this)
  }

  componentDidMount () {
    this.state.store.subscribe(this.props.datasource)
  }

  componentWillReceiveProps (newProps) {
    console.log('main received props', newProps)
    const store = new Store(newProps.config, this.forceUpdate.bind(this))
    store.subscribe(newProps.datasource)
    this.setState({store})
  }

  sort (axetype, field) {
    this.state.store.sort(axetype, field)
  }

  toggleSubtotals (axetype) {
    this.state.store.toggleSubtotals(axetype)
  }

  toggleGrandtotal (axetype) {
    this.state.store.toggleGrandtotal(axetype)
  }

  onDrilldown (cell) {
    console.log('drilldown (prop)', cell)
  }

  render () {
    const {store} = this.state
    console.log(store)
    return (
      <div className='App'>
        <div className='App-header'>
          <img src={logo} className='App-logo' alt='logo' />
          <h2>Zebulon visualization components</h2>
        </div>
        <div className='App-body'>
          <div>
            <ChartConfiguration store={store} />
            <ResizableBox height={600} width={800}>
              <Chart type='bar' store={store} />
            </ResizableBox>
          </div>
          <div>
            <ChartConfiguration store={store} />
            <ResizableBox height={600} width={800}>
              <Chart type='line' store={store} />
            </ResizableBox>
          </div>
          <div>
            <ChartConfiguration store={store} />
            <ResizableBox height={600} width={800}>
              <Chart type='area' store={store} />
            </ResizableBox>
          </div>
          <div>
          <ChartConfiguration store={store} />
          <ResizableBox height={600} width={800}>
          <Chart type='pie' store={store} />
          </ResizableBox>
          </div>
          <div>
            <GridConfiguration store={store} />
            <ResizableBox height={600} width={800}>
              <Grid store={store} />
            </ResizableBox>
          </div>
        </div>
      </div>
    )
  }

}

export default App