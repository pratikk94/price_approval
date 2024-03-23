import React, { useState, useEffect } from "react";
import Select from "react-select";
import { backend_url } from "../../util";

const ProductGrade = ({ fscCode }) => {
  const [grade, setGrade] = useState([]);

  // Function to fetch grade from the API
  const fetch_plants = async () => {
    try {
      console.log(fsc);
      const response = await fetch(
        `${backend_url}api/fetch_grade_with_pc?fsc=${fsc}`
      ); // Adjust the API path as needed
      const data = await response.json();

      const gradeOptions = data.map((grade) => ({
        label: grade.name,
        value: grade.code,
        profitCenter: grade.profit_center,
      }));
      console.log(gradeOptions);
      setGrade(gradeOptions);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  };

  useEffect(() => {
    fetch_plants();
  }, []);

  const handleChange = (selectedOptions) => {
    setSelectedGrade(selectedOptions);
  };

  return (
    <Select
      style={{ margintop: "10px" }}
      name="grade"
      options={grade}
      className="basic-multi-select"
      classNamePrefix="select"
      onChange={handleChange}
      placeholder={`Select plant`}
    />
  );
};

export default ProductGrade;
