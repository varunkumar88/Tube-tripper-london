class JourneyModelRequest {
    constructor(query){
        this.departure = query?.departure
        this.destination = query?.destination
        this.date = query?.date
        this.time = query?.time
        this.isArrivalTime = query?.isArrivalTime
    }
}

module.exports = JourneyModelRequest;