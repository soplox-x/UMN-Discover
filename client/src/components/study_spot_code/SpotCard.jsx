import "../../styles/study_spots_styles/SpotCard.css";

function SpotCard (spot){
    return(
        <div className="card">
            <h4>{spot.name}</h4>
            <h1>IMAGE WILL GO HERE</h1>
            <p>{spot.campus}</p>
        </div>
    )
}


export default SpotCard