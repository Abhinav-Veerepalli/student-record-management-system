
export function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
     console.log(
      "PATH:", req.path,
      "ROLE:", req.user.role
    );
    return next();
  }
  res.redirect('/role?message=not_authenticated');
}
