import React from "react";
import DataTable from "../../components/common/DataTable";
import { backend_url } from "../../util";
export default function RequestHistory() {
  return (
    <div>
      Request History
      <DataTable url={`${backend_url}api/fetch_report_status`} />
    </div>
  );
}
