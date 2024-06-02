import React, { useState, useEffect } from "react";
import Select from "react-select";
import { backend_mvc } from "../../util";

const PaymentTerms = ({
  setSelection,
  disabled,
  customers,
  consignees,
  endUses,
}) => {
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState(null);
  const [manualOverride, setManualOverride] = useState(false);
  const [paymentTermOptions, setPaymentTermOptions] = useState([
    { value: 5, label: "C030 - Payment within 30 days" },
    { value: 6, label: "C045 - Payment within 45 days" },
    { value: 7, label: "C060 - Payment within 60 days" },
    { value: 4, label: "D021 - Payment within 21 days" },
    { value: 8, label: "U90 - LC 90 days" },
    { value: 3, label: "C017 - Payment within 17 days" },
    { value: 2, label: "AD00 - Advance payment (100)" },
    { value: 1, label: "ADV - Advance" },
  ]);

  // Function to fetch the lowest payment term from the backend API
  const fetchLowestPaymentTerm = async () => {
    try {
      const response = await fetch(`${backend_mvc}api/lowest-payment-term`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customers: customers.map((c) => c.value),
          consignees: consignees.map((c) => c.value),
          endUses: endUses.map((e) => e.value),
        }),
      });
      const result = await response.json();
      if (result.lowestPaymentTerm && !manualOverride) {
        const termDetails = {
          label: result.lowestPaymentTerm.terms,
          value: result.lowestPaymentTerm.LowestPaymentTerm,
        };
        setSelectedPaymentTerm(termDetails);
        setSelection(termDetails);
      }
    } catch (error) {
      console.error("Error fetching the lowest payment term:", error);
      // Optionally handle state or alert the user in the UI
    }
  };

  useEffect(() => {
    fetchLowestPaymentTerm();
  }, [customers, consignees, endUses, manualOverride]);

  const handleOverride = () => {
    // This could be triggered by a button to enable manual override
    setManualOverride(true);
    // Resetting to default selection when manual override is enabled
    setSelectedPaymentTerm(paymentTermOptions[0]);
    setSelection(paymentTermOptions[0]);
  };

  const handleChange = (selectedOption) => {
    setSelectedPaymentTerm(selectedOption);
    setSelection(selectedOption);
  };

  return (
    <div>
      <Select
        isDisabled={disabled}
        value={selectedPaymentTerm}
        options={
          manualOverride
            ? paymentTermOptions
            : selectedPaymentTerm
            ? [selectedPaymentTerm]
            : []
        }
        onChange={handleChange}
        placeholder="Select Payment Terms"
      />
      {!manualOverride && (
        <button onClick={handleOverride} style={{ marginTop: "10px" }}>
          Override Automatic Selection
        </button>
      )}
    </div>
  );
};

export default PaymentTerms;
