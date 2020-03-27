import React from "react";
import "./styles.css";

import IssueDemo from "./IssueDemo";
import FixtureDemo from "./FixtureDemo";

export default function App() {
  return (
    <>
      <h1>Issue</h1>
      <IssueDemo />
      <h1>Fixture</h1>
      <FixtureDemo />
    </>
  );
}
