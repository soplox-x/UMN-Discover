import "../../styles/study_spots_styles/SubPages.css";
import spots from "../../../../data/study_spaces_data/west_bank_spots.json";
import SpotCard from "./SpotCard";

function WestBankPage(){
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


export default WestBankPage;