class AuthController {
  async googleSignup(req, res) {
    console.log("req.user: ", req.user);
    res.send("Authentication successful! Welcome, " + req.user.displayName);
  }

  async githubSignup(req, res) {
    console.log("req: ", req);
    console.log("req.user: ", req.user);
    res.send("<h1>Authorized</h1>")
  }
}

const authController = new AuthController();

module.exports = authController;
