const User = require("../models/userModel");
const logger = require("../utils/logger");

exports.login = async (req, res) => {
  const employee_id = req.params.employee_id;
  try {
    logger.info(`Attempting login for employee_id: ${employee_id}`);
    const user = await User.findUserByEmployeeId(employee_id);

    if (user && req.session) {
      req.session.employee_id = employee_id;
      req.session.role = user.role;
      req.session.region = user.region;
      logger.info(`user loggedin  ${JSON.stringify(user)}`);
      res.json({
        loggedIn: true,
        role: user.role,
        region: user.region,
      });
    } else {
      logger.warn(`Login failed for employee_id: ${employee_id} - Employee is inactive.`);
      res.status(401).json({
        loggedIn: false,
        message: "Employee is inactive. Contact business admin",
      });
    }
  } catch (err) {
    logger.error(`error during login for employee_id: ${employee_id} - ${err.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.checkSession = (req, res) => {
  if (req.session.employee_id && req.session.role) {
    logger.info(`Session check successful for employee_id: ${req.session.employee_id}`);
    res.json({
      loggedIn: true,
      role: req.session.role,
      region: req.session.region,
      employee_id: req.session.employee_id,
    });
  } else {
    logger.warn(`Session check failed - No active session found`);
    res.json({ loggedIn: false });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error(`Error during logout for employee_id: ${employee_id} - ${err.message}`);
      throw err;
    }
    logger.info(`User logged out: employee_id: ${employee_id}`);
    res.json({ loggedOut: true });
  });
};
