import * as React from 'react';
import DragManager from './orb.react.DragManager';
import DropIndicator from './orb.react.DropIndicator';
import {AxeType} from '../orb.axe';

let dtid = 0;

export default class DropTarget extends React.Component<any,any>{
  private _isMounted: boolean;
  dtid: number;
	constructor(props) {
		super(props);
		this.dtid = ++dtid;
		this.state = {
			isover: false
		};
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
	}
	componentDidMount() {
		this._isMounted = true;
		DragManager.registerTarget(this, this.props.axetype, this.onDragOver, this.onDragEnd);
	}
	componentWillUnmount() {
		this._isMounted = false;
		DragManager.unregisterTarget(this);
	}
	onDragOver(callback) {
		if(this._isMounted) {
			this.setState({
				isover: true
			}, callback);
		} else if(callback) {
			callback();
		}
	}
	onDragEnd(callback) {
		if(this._isMounted) {
			this.setState({
				isover: false
			}, callback);
		} else if(callback) {
			callback();
		}
	}
	render() {

		const buttons = this.props.buttons.map((button, index) => {
			if(index < this.props.buttons.length - 1) {
				return [
					<td><DropIndicator isFirst={index === 0} position={index} axetype={this.props.axetype}></DropIndicator></td>,
					<td>{ button }</td>
				];
			} else {
				return [
					<td><DropIndicator isFirst={index === 0} position={index} axetype={this.props.axetype}></DropIndicator></td>,
					<td>{ button }</td>,
					<td><DropIndicator isLast={true} position={null} axetype={this.props.axetype}></DropIndicator></td>
				];
			}
		});

		// const style = this.props.axetype === AxeType.ROWS ? { position: 'absolute', left: 0, bottom: 11 } : null;
    const style = {
      border:'dotted rgba(91, 192, 222, 0.7)',
      width: '100%',
      marginRight: '17px',
      padding: '1px 0',
      minHeight: '24px',
      minWidth: '67px',
      borderRadius: 10
    };

		return <div className={'drp-trgt' + (this.state.isover ? ' drp-trgt-over' : '') + (buttons.length === 0 ? ' drp-trgt-empty' : '')} style={style}>
			<table>
			<tbody>
				<tr>
					{buttons}
				</tr>
			</tbody>
			</table>
		</div>;
	}
}
