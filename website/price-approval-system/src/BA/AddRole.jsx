import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  TextField,
} from "@mui/material";
import "./AddRole.css";
import { backend_mvc } from "../util";

function App() {
  const [roles, setRoles] = useState([]);
  const [editableIndex, setEditableIndex] = useState(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [addRoleIndex, setAddRoleIndex] = useState(null);
  const [addRoleType, setAddRoleType] = useState(null); // new state to track add type

  useEffect(() => {
    axios
      .post(`${backend_mvc}api/roles/roles`)
      .then((response) => setRoles(response.data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleAddSameLevel = (index) => {
    setAddRoleIndex(index);
    setAddRoleType("same");
  };

  const handleAddBelow = (index) => {
    setAddRoleIndex(index + 1);
    setAddRoleType("below");
  };

  const handleSaveNewRole = () => {
    const newRole = {
      id: roles.length + 1,
      role: newRoleName || "New Role",
      can_approve: 0,
      can_initiate: 0,
      can_rework: 0,
      can_view: 0,
      hierarchy:
        addRoleType === "same"
          ? roles[addRoleIndex].hierarchy
          : roles[addRoleIndex - 1].hierarchy + 1,
    };

    let updatedRoles = [];
    if (addRoleType === "same") {
      updatedRoles = [...roles];
      updatedRoles.splice(addRoleIndex + 1, 0, newRole);
    } else {
      updatedRoles = roles.map((role, idx) => {
        if (idx >= addRoleIndex) {
          return { ...role, hierarchy: role.hierarchy + 1 };
        }
        return role;
      });
      updatedRoles.splice(addRoleIndex, 0, newRole);
    }

    setRoles(updatedRoles);
    axios
      .post(`${backend_mvc}api/roles/add`, {
        ...newRole,
        adjustHierarchy: addRoleType === "below",
      })
      .then((response) => {
        console.log("Role added:", response.data);
        setAddRoleIndex(null);
        setNewRoleName("");
        setAddRoleType(null);
      })
      .catch((error) => console.error("Error adding role:", error));
  };

  const handleCheckboxChange = (index, field) => {
    if (index !== editableIndex) return; // Only allow changes if the row is editable
    const updatedRoles = [...roles];
    updatedRoles[index][field] = updatedRoles[index][field] === 1 ? 0 : 1;
    setRoles(updatedRoles);
  };

  const handleUpdate = (index) => {
    if (editableIndex === index) {
      // If the same row is clicked again, save the changes
      const roleToUpdate = roles[index];
      axios
        .post(`${backend_mvc}api/roles/update`, roleToUpdate)
        .then((response) => {
          console.log("Role updated:", response.data);
          setEditableIndex(null); // Exit edit mode
        })
        .catch((error) => console.error("Error updating role:", error));
    } else {
      setEditableIndex(index); // Enter edit mode
    }
  };

  return (
    <div className="App">
      <Table className="role-table">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Can Approve</TableCell>
            <TableCell>Can Initiate</TableCell>
            <TableCell>Can Rework</TableCell>
            <TableCell>Can View</TableCell>
            <TableCell>Hierarchy</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.map((role, index) => (
            <>
              {addRoleIndex === index && (
                <TableRow key={`new-${index}`}>
                  <TableCell></TableCell>
                  <TableCell>
                    <TextField
                      label="New Role Name"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                    />
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell>
                    <Button onClick={handleSaveNewRole}>Save</Button>
                  </TableCell>
                </TableRow>
              )}
              <TableRow key={role.id}>
                <TableCell>{role.id}</TableCell>
                <TableCell>{role.role}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={role.can_approve === 1}
                    onChange={() => handleCheckboxChange(index, "can_approve")}
                    disabled={editableIndex !== index}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={role.can_initiate === 1}
                    onChange={() => handleCheckboxChange(index, "can_initiate")}
                    disabled={editableIndex !== index}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={role.can_rework === 1}
                    onChange={() => handleCheckboxChange(index, "can_rework")}
                    disabled={editableIndex !== index}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={role.can_view === 1}
                    onChange={() => handleCheckboxChange(index, "can_view")}
                    disabled={editableIndex !== index}
                  />
                </TableCell>
                <TableCell>{role.hierarchy}</TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleAddSameLevel(index)}
                    className="action-button"
                  >
                    Add Same Level
                  </Button>
                  <Button
                    onClick={() => handleAddBelow(index)}
                    className="action-button"
                  >
                    Add Below
                  </Button>
                  <Button
                    onClick={() => handleUpdate(index)}
                    className="action-button"
                  >
                    {editableIndex === index ? "Save" : "Update"}
                  </Button>
                </TableCell>
              </TableRow>
            </>
          ))}
          {addRoleIndex === roles.length && (
            <TableRow key="new-last">
              <TableCell></TableCell>
              <TableCell>
                <TextField
                  label="New Role Name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell>
                <Button onClick={handleSaveNewRole}>Save</Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default App;
