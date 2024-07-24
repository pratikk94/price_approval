import { useState } from "react";
import { backend_mvc } from "../util";

const LeaveForm = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e) => {
    setEmployeeId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backend_mvc}api/transaction/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employee_id: employeeId }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setTransactions(result.transactions);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to process the transaction");
    }
  };

  return (
    <div>
      <h2>Process Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="employee_id">Employee ID:</label>
          <input
            type="text"
            id="employee_id"
            name="employee_id"
            value={employeeId}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      {transactions.length > 0 && (
        <div>
          <h3>Transactions</h3>
          <ul>
            {transactions.map((transaction) => (
              <li key={transaction.id}>
                Request ID: {transaction.request_id}, Status:{" "}
                {transaction.status}, Updated By: {transaction.updated_by}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LeaveForm;
