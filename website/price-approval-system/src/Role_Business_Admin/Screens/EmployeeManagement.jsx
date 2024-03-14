import React from "react";
import SelectModal from "../Components/EmployeeManagementModal";
import DataTable from "../../components/common/DataTable";
import { backend_url } from "../../util";
export default function EmployeeManagement() {
  return (
    <div style={{ width: "80vw", height: "100vh" }}>
      <SelectModal />
      <DataTable url={`${backend_url}api/fetch_roles_data`} />
    </div>
  );
}
