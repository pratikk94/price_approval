import DataTable from "../../components/common/DataTable";
import { backend_url } from "../../util";
export default function PriceRequest() {
  const viewClicked = (data) => {
    console.log(data);
  };

  console.log(employee_id);
  return (
    <div style={{ width: "80vw", height: "80vh" }}>
      PriceRequest
      <DataTable
        url={`${backend_url}api/fetch_request_rm?employeeId=${employee_id}`}
        action_id={"AP_RM"}
      />
    </div>
  );
}
