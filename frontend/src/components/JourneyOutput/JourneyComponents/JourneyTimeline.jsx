import React, { Component } from 'react'
import { SiTransportforlondon } from "react-icons/si";
import { FaArrowRight } from "react-icons/fa";
import { FaWalking, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoWarning } from "react-icons/io5";

export default class JourneyTimeline extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
        return (
            <div className="mt-5">
                <div className="mx-8">
                    <div className="row d-flex justify-content-around ml-4 text-xl">
                        <div className="col d-flex grid gap-5">
                            <div>Start</div>
                            <div>Destination</div>
                        </div>
                        <div className="col">{this.props.minutesToTime(this.props.journeyView?.duration)}</div>
                    </div>
                    <div className="row mt-4 ml-4 text-lg">
                        <div className="col d-flex justify-content-start">
                            <div>{this.props.extractTime(this.props.journeyView?.startDateTime)}</div>
                            <FaArrowRight className="h5 ml-2 mr-2 mt-1" />
                            <div>{this.props.extractTime(this.props.journeyView?.arrivalDateTime)}</div>
                        </div>
                    </div>
                </div>
                {/* We iterate through the legs of the journey in order to display them on the timeline.*/}
                {this.props?.journeyView?.legs?.map((journeyLeg, index) => {
                    return (
                        <div key={index}>
                            <div className="my-4 d-flex flex-row">
                                <div className="timeline">{this.props.extractTime(journeyLeg?.departureTime)}</div>
                                {journeyLeg?.mode?.id === "walking" ? <FaWalking className="h3 ml-5 mr-5" /> : <SiTransportforlondon className="h3 ml-5 mr-5" />}<div>
                                    <div className="ml-5">{journeyLeg?.departurePoint?.commonName}</div>
                                    <div className="ml-5">{journeyLeg?.instruction?.detailed}</div>
                                </div>
                            </div>
                            <div className="d-flex flex-row">
                                <div className="ml-2 timeline-custom-div"></div>
                                <div className="ml-7 mr-5 border custom-divider bg-black"></div>
                                <div className="ml-9 custom-height align-self-center">{journeyLeg?.duration} min</div>
                                {/*This div toggles the station based on the value of viewStop${index}. If viewStop${index} is true, it shows the stop; otherwise, it remains hidden.
                                 The variable viewStop${index} is used to name the legs according to the iteration  */}
                                {journeyLeg?.mode?.id === "walking" ? <div className="ml-9 custom-height align-self-center underline">Walking</div> :
                                    <div className="ml-9 custom-height align-self-center underline"
                                        onClick={() => this.setState(prevState => ({ [`viewStop${index}`]: !prevState[`viewStop${index}`] }))}>
                                        <div className='custom-div-stop'>{this.state[`viewStop${index}`] ? "Hide stops" : "View stops"}</div>
                                    </div>}
                            </div>
                            {this.state[`viewStop${index}`] === true ? journeyLeg?.path?.stopPoints.map((stopName, index) => {
                                if (index !== (journeyLeg?.path?.stopPoints?.length - 1)) {
                                    return (
                                        <div key={index} className="d-flex flex-row">
                                            <div className="ml-2 timeline-custom-div"> </div>
                                            <div className="ml-7 mr-5 border custom-divider bg-black"></div>
                                            <div className="ml-9 custom-height align-self-center">{stopName?.name}</div>
                                        </div>)
                                }
                            }) : <></>
                            }
                            {/* disruption */}
                            {journeyLeg?.disruptions && journeyLeg.disruptions.length > 0 && (
                                <div className="d-flex flex-row">
                                    <div className="ml-2 timeline-custom-div"></div>
                                    <IoWarning className="ml-4 mr-5 text-warning h3" />
                                    <div className="ml-9 custom-height align-self-center underline">
                                        <div onClick={() => this.setState((prevState) => ({ [`viewDisruptions${index}`]: !prevState[`viewDisruptions${index}`] }))} className="pointer">
                                            {this.state[`viewDisruptions${index}`] ? 'Hide disruptions' : 'View disruptions'}
                                            {this.state[`viewDisruptions${index}`] ? (<FaChevronUp className="custom-div-stop-icon ml-5" />) : (<FaChevronDown className="custom-div-stop-icon ml-5" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {this.state[`viewDisruptions${index}`] === true &&
                                journeyLeg?.disruptions.map((disruption, index) => (
                                    <div className="d-flex flex-row bg-warning my-2" key={`disruption-${index}`}>
                                        <div className="ml-9 custom-height align-self-center">{disruption?.description}</div>
                                    </div>
                                ))}
                            <div className="my-4 d-flex flex-row">
                                <div className="timeline customdiv">{this.props.extractTime(journeyLeg?.arrivalTime)}</div>
                                {journeyLeg?.mode?.id === "walking" ? <FaWalking className="h3 ml-5 mr-5" /> : <SiTransportforlondon className="h3 ml-5 mr-5" />}
                                <div className="ml-5">{journeyLeg?.arrivalPoint?.commonName}</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
}
