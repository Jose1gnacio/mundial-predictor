import { getUpcomingWeekMatches } from "../utils/matchWeekUtils";
import ReactCountryFlag from "react-country-flag";
import { countryCodes } from "../assets/countryCodes";

function UpcomingMatchesCarousel({ matches }) {
  const weekMatches = getUpcomingWeekMatches(matches);

  const duplicatedMatches = [...weekMatches, ...weekMatches];

  const formatDate = (matchDate) => {
    const date = new Date(`${matchDate}T00:00:00`);

    const days = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

    const months = [
      "ENE",
      "FEB",
      "MAR",
      "ABR",
      "MAY",
      "JUN",
      "JUL",
      "AGO",
      "SEP",
      "OCT",
      "NOV",
      "DIC",
    ];

    return `${days[date.getDay()]} ${date.getDate()} ${
      months[date.getMonth()]
    }`;
  };

  const formatTime = (time) => {
    const parts = time.split(" ");

    return parts.length > 1 ? parts[1] : time;
  };

  return (
    <section className="carousel-section">
      <h3>Próximos partidos</h3>

      <div className="carousel-wrapper">
        <div className="carousel-track">
          {duplicatedMatches.map((match, index) => (
            <div key={index} className="carousel-card">
              <div className="carousel-date">
                📅 {formatDate(match.matchDate)}
              </div>

              <div className="carousel-teams">
                <ReactCountryFlag
                  countryCode={countryCodes[match.home]}
                  svg
                  style={{
                    width: "20px",
                    height: "20px",
                    marginRight: "8px",
                  }}
                />

                <span>
                  {match.home} vs {match.away}
                </span>

                <ReactCountryFlag
                  countryCode={countryCodes[match.away]}
                  svg
                  style={{
                    width: "20px",
                    height: "20px",
                    marginLeft: "8px",
                  }}
                />
              </div>

              <div className="carousel-time">🕗 {formatTime(match.time)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default UpcomingMatchesCarousel;
