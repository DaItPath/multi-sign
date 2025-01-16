const { Router } = require("express");
const passport = require("passport");
const authController = require("../auth/auth.controller.js");
const route = Router();

/**
 * Google
 */
route.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

route.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  authController.googleSignup
);

/**
 * Git hub
 */
route.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

route.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  authController.githubSignup
);

route.get(
  "/cisco",
  passport.authenticate("webex", {
    scope: [
      "spark:people_read",
      "spark:kms",
      "spark:rooms_read",
      "spark:messages_write",
    ],
  })
);

route.get(
  "/cisco/callback",
  passport.authenticate("webex", {
    failureRedirect: "/login",
  }),
  async (req, res) => {
    console.log("user: ", req.user);
    res.send("Authentication successful! Welcome, " + req.user.displayName);
  }
);

module.exports = route;
