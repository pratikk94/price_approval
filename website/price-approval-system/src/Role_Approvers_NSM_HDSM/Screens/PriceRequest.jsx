import DataTable from "../../components/common/DataTable";
import { backend_url } from "../../util";
export default function PriceRequest() {
  const viewClicked = (data) => {
    console.log(data);
  };

  return (
    <div style={{ width: "80vw", height: "80vh" }}>
      PriceRequest
      <DataTable
        url={`${backend_url}api/fetch_price_requests?status=1`}
        action_id={"AP_RM"}
      />
    </div>
  );
}
