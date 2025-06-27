import "../../styles/study_spots_styles/SubPages.css";
import spots from "../../../../data/study_spaces_data/st_paul_spots.json";
import SpotCard from "./SpotCard";

function StPaulPage(){
    return(
        <div className="spots">
            {spots.map(spot => {
                return(
                    <>
                        <SpotCard name={spot.name} campus={spot.campus}/>
                    </>
                );
            })}
        </div>
    );
}


export default StPaulPage;