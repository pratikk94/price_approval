// controllers/authController.js
const User = require("../models/userModel");

exports.login = async (req, res) => {
  //   console.log(req);
  const employee_id = req.params.employee_id;
  console.log("Employee ID:", employee_id);
  try {
    const user = await User.findUserByEmployeeId(employee_id);

    if (user && req.session) {
      console.log("Employee ID:", employee_id);
      console.log(user);
      req.session.employee_id = employee_id;
      req.session.role = user.role;
      req.session.region = user.region;
      res.json({
        loggedIn: true,
        role: user.role,
        region: user.region,
      });
    } else {
      res.status(401).json({
        loggedIn: false,
        message: "Employee is inactive. Contact business admin",
      });
    }
  } catch (err) {
    console.error("SQL error", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.checkSession = (req, res) => {
  if (req.session.employee_id && req.session.role) {
    res.json({
      loggedIn: true,
      role: req.session.role,
      region: req.session.region,
      employee_id: req.session.employee_id,
    });
  } else {
    res.json({ loggedIn: false });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.json({ loggedOut: true });
  });
};
