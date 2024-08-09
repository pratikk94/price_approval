import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { backend_mvc } from "../util";
import BAPopup from "./BAPopUp";

const RuleAddPage = () => {
  const [regions, setRegions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [roleList, setRoleList] = useState([
    { roles: [], level: 1, isActive: 1 },
  ]);
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [ruleSuccess, setRuleSuccess] = useState(false);
  useEffect(() => {
    // Fetch sales regions
    axios
      .get(`${backend_mvc}api/fetch_sales_regions`)
      .then((response) => {
        setRegions(response.data[0]);
      })
      .catch((error) => {
        console.error("Error fetching sales regions:", error);
      });

    // Fetch roles
    axios
      .post(`${backend_mvc}api/roles/roles`)
      .then((response) => {
        setRoles(response.data);
      })
      .catch((error) => {
        console.error("Error fetching roles:", error);
      });
  }, []);

  const handleAddRole = () => {
    setRoleList([
      ...roleList,
      { roles: [], level: roleList.length + 1, isActive: 1 },
    ]);
  };

  const handleRoleChange = (index, value) => {
    const updatedRoles = roleList.map((roleItem, i) =>
      i === index ? { ...roleItem, roles: value } : roleItem
    );
    setRoleList(updatedRoles);
  };

  const formatDate = (date) => {
    return `${date}T00:00:00.000`;
  };

  const getCurrentTimestamp = () => {
    const now = new Date();
    return now.toISOString();
  };

  const onClose = () => {
    setRuleSuccess(false);
  };

  const handleSubmit = async () => {
    const createdAt = getCurrentTimestamp();

    const dataArray = roleList.flatMap((roleItem, index) =>
      roleItem.roles.map((role) => ({
        rule_id: 3,
        region: selectedRegion,
        approver: role.value,
        level: roleItem.level,
        valid_from: formatDate(validFrom),
        valid_to: formatDate(validTo),
        is_active: roleItem.isActive,
        created_at: createdAt,
      }))
    );

    console.log(JSON.stringify({ dataArray }, null, 2));

    try {
      const response = await axios.post(
        `${backend_mvc}api/approvers-by-levels`,
        { dataArray },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("API response:", response.data);
      setRuleSuccess(true);
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  const getFilteredRoles = (index) => {
    let currentHierarchy = 0;
    for (let i = index - 1; i >= 0; i--) {
      const selectedRoles = roleList[i].roles;
      if (selectedRoles.length > 0) {
        currentHierarchy = Math.max(
          ...selectedRoles.map((role) => {
            const roleDetails = roles.find((r) => r.role === role.value);
            return roleDetails ? roleDetails.hierarchy : 0;
          })
        );
        break;
      }
    }
    return roles
      .filter((role) => role.hierarchy > currentHierarchy)
      .map((role) => ({ value: role.role, label: role.role }));
  };

  const styles = {
    container: {
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    },
    section: {
      marginBottom: "20px",
    },
    label: {
      display: "block",
      marginBottom: "5px",
      fontWeight: "bold",
    },
    select: {
      padding: "10px",
      fontSize: "16px",
      width: "100%",
      marginBottom: "10px",
    },
    input: {
      padding: "10px",
      fontSize: "16px",
      width: "100%",
      marginBottom: "10px",
    },
    button: {
      padding: "10px 20px",
      fontSize: "16px",
      margin: "10px 0",
      cursor: "pointer",
    },
    roleContainer: {
      display: "flex",
      flexDirection: "column",
      marginBottom: "10px",
    },
    roleSelect: {
      flexGrow: 1,
      marginBottom: "10px",
    },
  };

  return (
    <div style={styles.container}>
      <h1>Sales Regions and Roles</h1>
      <div style={styles.section}>
        <label htmlFor="regions" style={styles.label}>
          Select Sales Region:
        </label>
        <select
          id="regions"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          style={styles.select}
        >
          <option value="">Select Region</option>
          {regions.map((region) => (
            <option key={region.id} value={region.name}>
              {region.name}
            </option>
          ))}
        </select>
      </div>
      <div style={styles.section}>
        <label htmlFor="validFrom" style={styles.label}>
          Valid From:
        </label>
        <input
          type="date"
          id="validFrom"
          value={validFrom}
          onChange={(e) => setValidFrom(e.target.value)}
          style={styles.input}
        />
      </div>
      <div style={styles.section}>
        <label htmlFor="validTo" style={styles.label}>
          Valid To:
        </label>
        <input
          type="date"
          id="validTo"
          value={validTo}
          onChange={(e) => setValidTo(e.target.value)}
          style={styles.input}
        />
      </div>
      <div style={styles.section}>
        <h2>Role List</h2>
        {roleList.map((roleItem, index) => (
          <div key={index} style={styles.roleContainer}>
            <Select
              isMulti
              value={roleItem.roles}
              onChange={(value) => handleRoleChange(index, value)}
              options={getFilteredRoles(index)}
              styles={styles.roleSelect}
            />
          </div>
        ))}
        <button onClick={handleAddRole} style={styles.button}>
          Add Role
        </button>
      </div>
      <button onClick={handleSubmit} style={styles.button}>
        Submit
      </button>
      {ruleSuccess ? (
        <BAPopup
          message="Role created succesfully"
          onClose={onClose}
          open={ruleSuccess}
        />
      ) : null}
    </div>
  );
};

export default RuleAddPage;
