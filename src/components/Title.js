import React from "react";
import titleImage from "../Icons/logo.png"; // Update path as needed

const Title = () => {
  return (
    <div style={{ textAlign: "center", marginBottom: "40px", marginTop: "25px" }}>
      <img src={titleImage} alt="IDENT" style={{ maxWidth: "35%" }} />
    </div>
  );
};

export default Title;
