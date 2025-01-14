import React, { Component } from 'react';
import { Container, Navbar } from "react-bootstrap";
import JourneyInput from "./components/JourneyInput/JourneyInput";
import JourneyOutput from './components/JourneyOutput/JourneyOutput';

class App extends Component {

  constructor() {
    super();
    this.state = {
      journeys: null,
    }
  }

  /**
   * Allows a child component to set the journeys property of this component
   * @param journeys
   */
  setJourneysFromChild = (journeys) => {
    this.setState({ journeys })
  }

  render() {
    return (
      <>
        <Navbar className="shadow-sm py-4">
          <Container className="px-4">
            <Navbar.Brand><h5 className="mb-0">TubeTripperLondon</h5></Navbar.Brand>
          </Container>
        </Navbar>
        <JourneyInput setJourneys={this.setJourneysFromChild} journeysData={this.state.journeys} />
        {this.state.journeys ? <JourneyOutput journeysData={this.state.journeys} /> : <></>}
      </>
    );
  }
}

export default App;
