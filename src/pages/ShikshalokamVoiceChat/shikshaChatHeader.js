import { MdHelpOutline} from "react-icons/md";
import "./shikshaChatStyle.css"

function Header({ name, hasInfo, isMobileFirst=false, content, logo,showCompanyLogo=false, showTheDots=false, displayNewSessionButton=true }) {
  return (
    <header className={`header-1 ${isMobileFirst ? "header-2" : "header-3"}`}>
      <div className="div59">
        <div className="div60">
          {(showCompanyLogo)&& <img
            src={logo || 'https://mohini-static.shikshalokam.org/fe-images/PNG/Shikshalokam/shikshalokam-logo.png'}
            height="2rem"
            width="auto"
            alt="shikshalokam logo"
            className="img-1"
          />}
        </div>
      </div>
      {(isMobileFirst || !showTheDots)&& displayNewSessionButton &&
        <div className="div62">
          {!!name && <div className="div63">{name}</div>}
          {!!hasInfo && <button className="button-12">
            <MdHelpOutline className="icon-3" />
          </button>}
          {!!content && content} 
        </div>
      }
    </header>
  );
}

export default Header;