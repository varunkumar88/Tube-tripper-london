import React, { Component } from "react"
import { FaTrainSubway } from "react-icons/fa6";
import { FaPersonWalking } from "react-icons/fa6";
import "./JourneyOutput.css"
import { FaArrowRight } from "react-icons/fa";
import JourneyTimeline from "./JourneyComponents/JourneyTimeline";

export default class JourneyOutput extends Component {
    constructor(props) {
        super(props)
        this.state = {
            journeyIndex: 0
        }
    }

    /**
     * Takes a dateTimeString and extracts the time.
     * @param {string} dateTimeString - A string representing a date and time.
     * @returns {string} - A formatted time string in the format 'HH:mm'.
     */
    extractTime = (dateTimeString) => {
        const dateTime = new Date(dateTimeString);
        const hours = dateTime.getHours().toString().padStart(2, '0');
        const minutes = dateTime.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    /**
    * Converts a duration in minutes to a formatted time string.
    * @param {number} minutes - The duration in minutes to be converted.
    * @returns {string} - A formatted time string in the 'HH:mm' format.
    */
    minutesToTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = remainingMinutes.toString().padStart(2, '0');
        return `${formattedHours}:${formattedMinutes}`;
    }

    /**
    * Converts a given date string to the format "DayOfMonth MonthName Year".
    *
    * @param {string} inputDate - The input date string in ISO format (e.g., "2023-11-15T21:56:00").
    * @returns {string} The formatted date string (e.g., "Thursday 15 November 2023").
    */
    formatDate = (inputDate) => {
        const date = new Date(inputDate);
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        const dayOfWeek = daysOfWeek[date.getDay()];
        const dayOfMonth = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const formattedDate = `${dayOfWeek} ${dayOfMonth} ${month} ${year}`;
        return formattedDate;
    }

    render() {
        return (
            <div className="container p-4">
                <div className="container">
                    <div className="row">
                        {/* The div below the timetable displaying journeyView's time, date, and price. We are running the loop*/}
                        <div className="col-xs-12 col-lg-5 text-center bg-light rounded">
                            <h5 className="m-4">{this.formatDate(this.props?.journeysData?.journeys[this.state?.journeyIndex]?.startDateTime)}</h5>
                            {this.props?.journeysData?.journeys?.map((journeyLoop, index) => {
                                return (
                                    <div key={index} className={this.state.journeyIndex === index ? "p-2 bg-white m-2 my-4 border border-primary pointer rounded" : "p-2 bg-white m-2 my-4 border pointer rounded"}
                                        onClick={() => this.setState({ journeyIndex: index })} >
                                        <div className="row mb-1">
                                            <div className="col text-lg text-nowrap ml-6">
                                                {this.extractTime(journeyLoop?.startDateTime)}
                                                <FaArrowRight className="mx-2 mb-1" />  {this.extractTime(journeyLoop?.arrivalDateTime)}</div>
                                            <div className="col text-lg"></div>
                                            <div className="col text-lg">{this.minutesToTime(journeyLoop?.duration)}</div>
                                        </div>
                                        <div className="row mt-1">
                                            <div className="col text-lg">
                                                <FaTrainSubway className="text-primary text-xl" /><FaPersonWalking /> {journeyLoop?.legs?.length}X</div>
                                            <div className="col text-lg"></div>
                                            <div className="col text-lg">£{((journeyLoop?.fare?.totalCost ? journeyLoop?.fare?.totalCost : 0) / 100).toFixed(2)}</div>
                                        </div>
                                    </div>)
                            })}
                        </div>
                        <div className="col-xs-12 col-lg-7 my-4 px-4" >
                            <JourneyTimeline journeyView={this.props?.journeysData?.journeys[this.state.journeyIndex]}
                                extractTime={this.extractTime}
                                minutesToTime={this.minutesToTime}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
