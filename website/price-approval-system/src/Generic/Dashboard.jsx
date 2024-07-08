import { backend_mvc } from "../util";
import DataTable from "./DataTable";
export default function Dashboard() {
  return (
    <DataTable
      url={`${backend_mvc}api/completed-transactions/Approved`}
      isRework={true}
    />
  );
}
