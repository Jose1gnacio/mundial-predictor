import { buildGroupStandings } from "../utils/groupStandingsUtils";

function MatchesPage({ matches, loading }) {
  if (loading) {
    return <p>Cargando grupos...</p>;
  }

  const groups = buildGroupStandings(matches);

  return (
    <>
      <h1 className="page-title">Grupos</h1>

      <div className="groups-container">
        {Object.entries(groups).map(([groupName, teams]) => (
          <div key={groupName} className="group-card">
            <h2 className="group-title">{groupName}</h2>

            <div className="group-header">
              <span>#</span>
              <span>Equipo</span>
              <span>PJ</span>
              <span>G</span>
              <span>E</span>
              <span>P</span>
              <span>GF</span>
              <span>GC</span>
              <span>DG</span>
              <span>Pts</span>
            </div>

            {teams.map((team, index) => (
              <div key={team.team} className="group-row">
                <span>{index + 1}</span>

                <span className="group-team-name">{team.team}</span>

                <span>{team.pj}</span>

                <span>{team.g}</span>

                <span>{team.e}</span>

                <span>{team.p}</span>

                <span>{team.gf}</span>

                <span>{team.gc}</span>

                <span>{team.dg > 0 ? `+${team.dg}` : team.dg}</span>

                <span className="group-points">{team.pts}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default MatchesPage;
