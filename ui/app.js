import React from 'react';
import { connect } from 'react-redux';

const header = (currentLocation) => {
  return currentLocation ? <h1 className="css-planet-monitor">Obi-Wan currently on {currentLocation.name}</h1> : '';
};

class App extends React.Component {
  render() {
    const { currentLocation } = this.props;
    return(
        <div className="app-container">
        <div className="css-root">
            {header(currentLocation)}
            <section className="css-scrollable-list">
              <ul className="css-slots">
                <li className="css-slot">
                  <h3>Darth Sidious</h3>
                  <h6>Homeworld: Naboo</h6>
                </li>
              </ul>

              <div className="css-scroll-buttons">
                <button className="css-button-up"></button>
                <button className="css-button-down"></button>
              </div>
            </section>
      </div>
    </div>
    );

  }
}

App.propTypes = {
  currentLocation: React.PropTypes.object
};

function mapStateToProps(state) {
  const { currentLocation } = state;
  return {
    currentLocation
  };
}

export default connect(mapStateToProps)(App);
