import React from "react";
import CreateRuleModel from "../Components/CreateRuleModel";
import DataTable from "../../components/common/DataTable";
import { backend_url } from "../../util";
export default function RuleAssignment() {
  return (
    <div style={{ width: "80vw", height: "80vh" }}>
      <CreateRuleModel />
      <DataTable url={`${backend_url}api/fetch_rules`} />
    </div>
  );
}
