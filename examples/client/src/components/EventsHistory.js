
const EventsHistory = ({ eventsHistory, onCleanHistoryClick }) => {
    return (
        <div>
            <h2>History</h2>
            <div>
                <button onClick={onCleanHistoryClick} >Clean History</button>
            </div>
            {eventsHistory.map((evt, idx) => {
                return (
                    <div key={idx}  >
                        <EventTitle event={evt} style={{ padding: "5px", margin: "5px" }} />
                        <pre style={{ padding: "5px", margin: "5px", backgroundColor: "#ddd" }} >{JSON.stringify(evt, ' ', ' ')}</pre>
                    </div>
                )
            })}
        </div>
    )
}


const EventTitle = ({ event, style }) => {
    let text = 'unknown'
    if (event.request && event.response) {
        text = '<- http response'
    } else if (event.request && !event.response) {
        text = '-> http request'
    } else if (event.type && event.body) {
        text = '<- ws event'
    }


    return (<h3 style={style} >{text}</h3>)
}



export default EventsHistory