import React from "react";

import DataTable from "../../components/common/DataTable";
import { backend_url } from "../../util";
import SelectModal from "../Components/AddEmployeeManagementModal";
export default function EmployeeManagement() {
  return (
    <div style={{ width: "80vw", height: "100vh" }}>
      <SelectModal />
      <DataTable
        url={`${backend_url}api/fetch_roles_data`}
        action_id={"B2"}
        isEmployeeManagement={true}
      />
    </div>
  );
}
