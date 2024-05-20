// ParentComponent.jsx
import { useState, useEffect } from "react";

import PriceChangeRequest from "./PriceRequest";
import axios from "axios";
import { backend_mvc } from "../util";
import { useSession } from "../Login_Controller/SessionContext";

const ParentComponent = () => {
  const [rules, setRules] = useState({}); // Initialize rules as an empty object
  const { session } = useSession();
  useEffect(() => {
    axios
      .get(`${backend_mvc}api/roles/` + session.role)
      .then((response) => {
        console.log("Fetched data:", response.data);
        // Assuming the API returns the role object directly
        if (response.data) {
          setRules(response.data.data);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  console.log(rules);

  return (
    <div>
      <PriceChangeRequest rules={rules} employee_id={session.employee_id} />
    </div>
  );
};

export default ParentComponent;
