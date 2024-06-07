import React from "react";
import { data } from "../restApi.json"; // Ensure the path is correct

const Team = () => {
  return (
    <section className="team" id="team">
      <div className="container">
        <div className="heading_section">
          <h1 className="heading">OUR TEAM</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae
            fugit dicta, ipsum impedit quam laboriosam quas doloremque quia
            perferendis laborum.
          </p>
        </div>
        <div className="team_container">
          {data[0].team.slice(0, 3).map((member) => (
            <div className="card" key={member.id}>
              <img src={member.image} alt={member.name} />
              <h3>{member.name}</h3>
              <p>{member.designation}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
