import React from 'react';
import { connect } from 'react-redux';

import { initBoard, scrollUp, scrollDown } from './actions';

const renderHeader = (currentLocation) => {
  return currentLocation ? <h1 className="css-planet-monitor">Obi-Wan currently on {currentLocation.name}</h1> : '';
};

const renderSlot = (slot, index, currentLocation) => {

    if (slot === null || currentLocation === null) {
      return (
        <li key={index} className="css-slot"></li>
      );
    }

    const style = slot.homeworld.id === currentLocation.id ? { color: 'red' } : undefined;

    return (
      <li key={index} className="css-slot" style={style}>
          <h3>{slot.name}</h3>
          <h6>Homeworld: {slot.homeworld.name}</h6>
      </li>
    );

};

class App extends React.Component {

  constructor(props) {
    super(props);

  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(initBoard());
  }

  handleScrollUp(event) {
    event.preventDefault();
    const { dispatch, canScrollUp } = this.props;
    if (canScrollUp) {
      dispatch(scrollUp());
    }
  }

  handleScrollDown(event) {
    event.preventDefault();
    const { dispatch, canScrollDown } = this.props;
    if (canScrollDown) {
      dispatch(scrollDown());
    }
  }

  render() {

    const { currentLocation, slots, canScrollUp, canScrollDown } = this.props;

    const buttonUpClass = 'css-button-up' + (canScrollUp ? '' : ' css-button-disabled');

    const buttonDownClass = 'css-button-down' + (canScrollDown ? '' : ' css-button-disabled');

    return(
      <div className="app-container">
        <div className="css-root">
            {renderHeader(currentLocation)}
            <section className="css-scrollable-list">
              <ul className="css-slots">
                {slots.map((slot, index) => renderSlot(slot, index, currentLocation))}
              </ul>

              <div className="css-scroll-buttons">
                <button onClick={this.handleScrollUp.bind(this)} className={buttonUpClass}></button>
                <button onClick={this.handleScrollDown.bind(this)} className={buttonDownClass}></button>
              </div>
            </section>
      </div>
    </div>
    );

  }
}

App.propTypes = {
  currentLocation: React.PropTypes.object,
  canScrollUp: React.PropTypes.bool,
  canScrollDown: React.PropTypes.bool,
  dispatch: React.PropTypes.func.isRequired

};

function mapStateToProps(state) {
  const {
    slots,
    canScrollUp,
    canScrollDown,
    currentLocation } = state;

  return {
    currentLocation,
    slots,
    canScrollUp,
    canScrollDown
  };
}

export default connect(mapStateToProps)(App);
