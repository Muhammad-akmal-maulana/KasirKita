const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect("/auth/login");
    }

    const userRole = req.session.user.role;
    // Convert the allowedRoles string to an array and remove any whitespace
    const roles = allowedRoles.split(",").map((role) => role.trim());

    if (roles.includes(userRole)) {
      return next();
    } else {
      console.log(
        "Access denied. User role: ${userRole}, Required roles: ${allowedRoles}"
      );
      return res.redirect("/auth/login");
    }
  };
};

module.exports = checkRole;