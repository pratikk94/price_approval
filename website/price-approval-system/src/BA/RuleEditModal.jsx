import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import { backend_mvc } from "../util";

const RuleEditModal = () => {
  const [salesOffices, setSalesOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState("");
  const [rules, setRules] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [editRule, setEditRule] = useState(null);

  useEffect(() => {
    axios
      .get(`${backend_mvc}api/fetch_sales_regions`)
      .then((response) => {
        if (response.data && response.data.length > 0) {
          setSalesOffices(response.data[0]);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching the sales offices!", error);
      });
  }, []);

  useEffect(() => {
    if (selectedOffice) {
      axios
        .get(`${backend_mvc}api/sales_office/${selectedOffice}`)
        .then((response) => {
          console.log("Rules fetched successfully:", response.data);
          setRules(response.data);
        })
        .catch((error) => {
          console.error("There was an error fetching the rules!", error);
        });
    } else {
      setRules([]);
    }
  }, [selectedOffice]);

  const openModal = (index = null) => {
    setModalIsOpen(true);
    axios
      .post(`${backend_mvc}api/roles`)
      .then((response) => {
        setRoles(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the roles!", error);
      });

    if (index !== null) {
      const rule = rules[index];
      setEditRule({
        ...rule,
        approvers: rule.approvers.split(", ").map((label) => ({
          label,
          value: roles.find((role) => role.role === label)?.hierarchy || "",
        })),
      });
    } else {
      setEditRule({
        rule_id: rules.length + 1,
        region: "",
        approvers: [],
        level: 1,
        valid_from: new Date().toISOString().split("T")[0],
        valid_to: new Date().toISOString().split("T")[0],
        is_active: 1,
      });
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditRule(null);
  };

  const handleRuleChange = (field, value) => {
    setEditRule((prevRule) => ({
      ...prevRule,
      [field]: value,
    }));
  };

  const handleApproverChange = (index, field, value) => {
    const newApprovers = [...editRule.approvers];
    newApprovers[index] = { ...newApprovers[index], [field]: value };
    setEditRule((prevRule) => ({
      ...prevRule,
      approvers: newApprovers,
    }));
  };

  const addApproverRow = () => {
    setEditRule((prevRule) => ({
      ...prevRule,
      approvers: [...prevRule.approvers, { label: "", value: "" }],
    }));
  };

  const handleFinalSubmit = async () => {
    try {
      const approverRows = editRule.approvers.map((approver, index) => ({
        rule_id: editRule.rule_id,
        region: editRule.region,
        approver: approver.label,
        level: index + 1,
        valid_from: editRule.valid_from,
        valid_to: editRule.valid_to,
        created_at: new Date().toISOString(),
        is_active: editRule.is_active,
      }));

      await axios.put(`${backend_mvc}api/update_rules`, {
        rules: approverRows,
      });

      const updatedRules = approverRows.map((row) => ({
        ...row,
        approvers: editRule.approvers.map((a) => a.label).join(", "),
      }));

      if (editRule.rule_id > rules.length) {
        setRules([...rules, ...updatedRules]);
      } else {
        setRules(
          rules.map((rule) =>
            rule.rule_id === editRule.rule_id
              ? updatedRules.find((r) => r.level === 1)
              : rule
          )
        );
      }

      closeModal();
    } catch (error) {
      console.error("Failed to update rule:", error);
      alert("Failed to update rule");
    }
  };

  const saveChanges = () => {
    axios
      .put(`${backend_mvc}api/update_rules`, { rules })
      .then((response) => {
        console.log("Rules updated successfully:", response.data);
      })
      .catch((error) => {
        console.error("There was an error updating the rules!", error);
      });
  };

  return (
    <div>
      <select
        value={selectedOffice}
        onChange={(e) => setSelectedOffice(e.target.value)}
      >
        <option value="">Select Sales Office</option>
        {salesOffices.map((office) => (
          <option key={office.id} value={office.name}>
            {office.name}
          </option>
        ))}
      </select>

      {rules.length > 0 ? (
        <div>
          <table>
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>Region</th>
                <th>Approvers</th>
                <th>Level</th>
                <th>Valid From</th>
                <th>Valid To</th>
                <th>Is Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule, index) => (
                <tr key={rule.rule_id}>
                  <td>{rule.rule_id}</td>
                  <td>{rule.region}</td>
                  <td>{rule.approvers}</td>
                  <td>{rule.level}</td>
                  <td>{rule.valid_from}</td>
                  <td>{rule.valid_to}</td>
                  <td>{rule.is_active ? "Yes" : "No"}</td>
                  <td>
                    <button onClick={() => openModal(index)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={saveChanges}>Save Changes</button>
        </div>
      ) : (
        <p>No rules found for the selected sales office.</p>
      )}

      <button onClick={() => openModal()}>Add Rule</button>

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
        <h2>{editRule?.rule_id <= rules.length ? "Edit Rule" : "Add Rule"}</h2>
        <div>
          <label>Region:</label>
          <select
            value={editRule?.region}
            onChange={(e) => handleRuleChange("region", e.target.value)}
          >
            <option value="">Select Sales Office</option>
            {salesOffices.map((office) => (
              <option key={office.id} value={office.name}>
                {office.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Valid From:</label>
          <input
            type="date"
            value={editRule?.valid_from}
            onChange={(e) => handleRuleChange("valid_from", e.target.value)}
          />
        </div>
        <div>
          <label>Valid To:</label>
          <input
            type="date"
            value={editRule?.valid_to}
            onChange={(e) => handleRuleChange("valid_to", e.target.value)}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>Approver</th>
            </tr>
          </thead>
          <tbody>
            {editRule?.approvers.map((approver, index) => (
              <tr key={index}>
                <td>
                  <select
                    value={approver.label}
                    onChange={(e) =>
                      handleApproverChange(index, "label", e.target.value)
                    }
                  >
                    <option value="">Select Label</option>
                    {roles
                      .filter((role) => {
                        const currentLevel = editRule.approvers
                          .slice(0, index)
                          .reduce(
                            (max, app) =>
                              Math.max(
                                max,
                                roles.find((r) => r.role === app.label)
                                  ?.hierarchy || 0
                              ),
                            0
                          );
                        return role.hierarchy > currentLevel;
                      })
                      .map((role) => (
                        <option key={role.id} value={role.role}>
                          {role.role}
                        </option>
                      ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addApproverRow}>Add Approver</button>
        <button onClick={handleFinalSubmit}>Submit</button>
        <button onClick={closeModal}>Close</button>
      </Modal>
    </div>
  );
};

export default RuleEditModal;
