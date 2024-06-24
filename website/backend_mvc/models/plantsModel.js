const db = require("../config/db");

async function fetchPlants() {
  try {
  
    // const result = await request.query(query);
    let result = await db.executeQuery(`EXEC GetPlants`);
     // Send the results as a response
     return result;
  } catch (error) {
    console.error("An error occurred while fetching plants", error);
    throw error;
  }
}

module.exports = {
    fetchPlants,
};