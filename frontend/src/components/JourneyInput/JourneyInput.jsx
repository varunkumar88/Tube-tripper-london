import React, { Component } from "react"
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import Select from "react-select"
import Toggle from "./Toggle"
import axios from "axios";
import dayjs from "dayjs";
import "./JourneyInput.css"

class JourneyInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stations: [],
            departure: null,
            destination: null,
            date: dayjs(Date.now()).format("YYYY-MM-DD"),
            time: dayjs(Date.now()).format("HH:mm"),
            // note that this directly relates to the toggle. By default, the toggle is not "checked" so then time is
            // departure time.
            isArrivalTime: false,
            validated: false,
            errorMsg: "",
            isLoading: false
        }

        this.departureSameAsDestinationRef = React.createRef()
    }

    /**
     * Fetches the station options that populate the autocompletes immediately after the component is mounted
     */
    async componentDidMount() {
        try {
            const response = await axios({
                method: "GET",
                url: `${process.env.REACT_APP_API_URL}/stations`,
                config: { headers: { 'Content-Type': 'multipart/form-data' } },
            })

            this.setState({ stations: response.data })
        } catch (error) {
            this.setState({ errorMsg: "Could not fetch stations." })
        }
    }

    /**
     * Sets the departure station to the new value
     * @param selectedOption {object} the newly selected option
     */
    handleDepartureChange = (selectedOption) => {
        this.setState({ departure: selectedOption })
    }

    /**
     * Sets the destination station to the new value
     * @param selectedOption {object} the newly selected option
     */
    handleDestinationChange = (selectedOption) => {
        this.setState({ destination: selectedOption })
    }

    /**
     * Swaps the departure selection with the destination selection
     */
    swapDepartureAndDestination = () => {
        let departure = this.state.departure;
        let destination = this.state.destination;
        [departure, destination] = [destination, departure]
        this.setState({ departure, destination })
    }

    /**
     * Sets the date to the new value
     * @param event {object} the change event
     */
    handleDateChange = (event) => {
        let date = event.target.value
        // date can be invalid if "clear" button is pressed in date picker or when invalid date is typed (e.g. 30-02-2023)
        if (!this.isValidDate(date)) {
            date = dayjs(Date.now()).format("YYYY-MM-DD")
        }
        this.setState({ date })
    }

    /**
     * Checks if a given date is valid
     * @param date {string} the date in "YYYY-MM-DD" format
     * @returns {boolean}
     */
    isValidDate = (date) => {
        return !isNaN(Date.parse(date))
    }

    /**
     * Sets the time to the new value
     * @param event {object} the change event
     */
    handleTimeChange = (event) => {
        // it is not necessary to check for valid times because the hours and minutes automatically snap back to valid values
        this.setState({ time: event.target.value })
    }

    /**
     * Toggles if the specified time is departure or arrival time
     * @param event
     */
    handleDepartureArrivalTimeSwitch = (event) => {
        this.setState({ isArrivalTime: event.target.checked })
    }

    /**
     * Handles the submit event
     * @param event {object} the submit event
     */
    handleSubmit = (event) => {
        // prevent the form from being submitted. Instead, an API request will be made to the back-end if the form is valid.
        event.preventDefault();
        event.stopPropagation();

        const departure = this.state.departure
        const destination = this.state.destination

        if (departure !== null && destination !== null) {
            if (departure.value === destination.value) {
                this.departureSameAsDestinationRef.current.classList.add("d-flex")
            } else {
                // departure and destination are not the same; form is valid
                this.departureSameAsDestinationRef.current.classList.remove("d-flex")
                this.fetchJourneys()
            }
        }

        // the form shows the error messages as soon as validated = true
        this.setState({ validated: true })
    }

    /**
     * Makes an API request to the back-end to fetch journey options and passes the result onto the parent
     */
    fetchJourneys = async () => {
        this.setState({ isLoading: true })

        try {
            const response = await axios({
                method: "GET",
                url: `${process.env.REACT_APP_API_URL}/journeys/journey-results`,
                config: { headers: { 'Content-Type': 'multipart/form-data' } },
                params: {
                    departure: this.state.departure.value,
                    destination: this.state.destination.value,
                    date: this.state.date,
                    time: this.state.time,
                    isArrivalTime: this.state.isArrivalTime
                }
            })

            this.props.setJourneys(response.data)
            this.setState({ errorMsg: "" })
        } catch (error) {
            this.props.setJourneys(null)
            const msg = error?.response?.data?.message ? `Could not get journeys: ${error.response.data.message}` : "Could not get journeys."
            this.setState({ errorMsg: msg })
        } finally {
            this.setState({ isLoading: false })
        }
    }

    render() {
        return (
            <div className={`wrapper ${this.props.journeysData ? "results-active" : "results-inactive"}`}>
                <div className="main-container">
                    <Alert variant="danger"
                        show={!!this.state.errorMsg}
                        className="d-flex align-items-center"
                    >
                        <span className="material-symbols-outlined pe-2">warning</span>
                        {this.state.errorMsg}
                    </Alert>
                    <Container className="p-3 bg-white rounded-4">
                        <h5>Journey Planner</h5>
                        <Form
                            noValidate // to prevent default browser validation
                            validated={this.state.validated}
                            onSubmit={this.handleSubmit}
                        >
                            <Row className="mb-3 align-items-start">
                                <Form.Group as={Col}>
                                    <Form.Label htmlFor="departure">From</Form.Label>
                                    <Select
                                        required
                                        name="departure"
                                        inputId="departure"
                                        placeholder="Select station..."
                                        options={this.state.stations}
                                        onChange={this.handleDepartureChange}
                                        value={this.state.departure}
                                    />
                                    {/* The <Select /> component above is not from react-bootstrap. Because of this, the
                                    form validation does not work with this component. To still be able to display an error
                                    message, I use a hidden react-bootstrap input field to reflect what is happening in the
                                    <Select /> component.*/}
                                    <Form.Control type="text"
                                        className="d-none"
                                        value={this.state.departure ? "optionSelected" : ""} // input field can't take null without warning so use empty string instead
                                        onChange={this.handleDepartureChange}
                                        required />
                                    <Form.Control.Feedback type="invalid">
                                        Please select a departure location
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group
                                    as={Col}
                                    xs="auto"
                                    className="px-0 swap-arrow"
                                >
                                    <span
                                        className="material-symbols-outlined pointer"
                                        onClick={this.swapDepartureAndDestination}
                                    >swap_horiz</span>
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label htmlFor="destination">To</Form.Label>
                                    <Select
                                        required
                                        name="destination"
                                        inputId="destination"
                                        placeholder="Select station..."
                                        options={this.state.stations}
                                        onChange={this.handleDestinationChange}
                                        value={this.state.destination}
                                    />
                                    {/*See the comment above at the departure <Select /> component for why this is here*/}
                                    <Form.Control type="text"
                                        className="d-none"
                                        value={this.state.destination ? "optionSelected" : ""}
                                        onChange={this.handleDestinationChange}
                                        required />
                                    <Form.Control.Feedback type="invalid">
                                        Please select a destination location
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Row>
                            {/* this visibility of this Feedback message is determined in the handleSubmit method */}
                            <Form.Control.Feedback
                                type="invalid"
                                ref={this.departureSameAsDestinationRef}
                                className="mb-3 mt-0 justify-content-center"
                            >
                                Departure and destination cannot be the same
                            </Form.Control.Feedback>
                            <Row className="mb-3 align-items-end">
                                <Form.Group as={Col} xs="auto" controlId="date-picker">
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control
                                        name="date"
                                        type="date"
                                        value={this.state.date}
                                        onChange={this.handleDateChange}
                                    ></Form.Control>
                                </Form.Group>
                                <Form.Group as={Col} xs="auto" controlId="time-picker">
                                    <Form.Label>Time</Form.Label>
                                    <Form.Control
                                        name="time"
                                        type="time"
                                        value={this.state.time}
                                        onChange={this.handleTimeChange}
                                    ></Form.Control>
                                </Form.Group>
                                <Form.Group as={Col} xs="auto" className="pb-2">
                                    <Toggle
                                        name="isArrivalTime"
                                        leftLabel="Departure"
                                        rightLabel="Arrival"
                                        checked={this.state.isArrivalTime}
                                        onChange={this.handleDepartureArrivalTimeSwitch}
                                    />
                                </Form.Group>
                            </Row>
                            <Row>
                                <Col>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100"
                                        disabled={this.state.isLoading}
                                    >
                                        {!this.state.isLoading
                                            ? "Plan Journey"
                                            : (
                                                <>
                                                    Loading journeys...
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                    />
                                                </>
                                            )
                                        }
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Container>
                </div>
            </div>
        );
    }
}

export default JourneyInput
