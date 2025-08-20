import '../../styles/study_spots_styles/StudySpots.css';
import { useNavigate } from 'react-router-dom';

function StudySpots() {
    const link = useNavigate();

    function gotoEast(){
        link("/studyspots/eastbank");
    }

    function gotoWest(){
        link("/studyspots/westbank");
    }

    function gotoPaul(){
        link("/studyspots/stpaul");
    }

    return (
        <>
            <h1 id="instruct">Select a campus to see study spots on that campus!</h1>
            <div className="buttons">
                <button className="button" onClick={gotoEast}>East Bank Study Spots</button> 
                <button className="button" onClick={gotoWest}>West Bank Study Spots</button>
                <button className="button" onClick={gotoPaul}>St.Paul Study Spots</button>
            </div>
            
        </>
    );
}

export default StudySpots;