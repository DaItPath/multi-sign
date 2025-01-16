const express = require("express");
const route = require("./src/routes/index.js");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const OAuth2Strategy = require("passport-oauth2");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Use `secure: true` in production
  })
);
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      // Here you can handle user info and save to database
      return done(null, profile);
    }
  )
);

// Configure Passport-GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/github/callback",
      scope: "user:email",
    },
    (accessToken, refreshToken, profile, done) => {
      console.log("profile: ", profile);
      return done(null, profile);
    }
  )
);

// Webex OAuth 2.0 Strategy Configuration
passport.use(
  "webex",
  new OAuth2Strategy(
    {
      authorizationURL: "https://webexapis.com/v1/authorize",
      tokenURL: "https://webexapis.com/v1/access_token",
      clientID: process.env.WEBEX_CLIENT_ID,
      clientSecret: process.env.WEBEX_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/cisco/callback",
      scope: [
        "spark:people_read",
        "spark:kms",
        "spark:rooms_read",
        "spark:messages_write",
      ],
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        // Fetch Webex user information using the access token
        const userResponse = await axios.get(
          "https://webexapis.com/v1/people/me",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const user = {
          id: userResponse.data.id,
          email: userResponse.data.emails[0], // Webex returns an array of emails
          displayName: userResponse.data.displayName,
          firstName: userResponse.data.firstName,
          lastName: userResponse.data.lastName,
          avatar: userResponse.data.avatar,
          accessToken,
          refreshToken,
        };

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize and deserialize user for session
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(route);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// app.get("/auth/github-signup", (req, res) => {
//   res.redirect(
//     `https://github.com/login/oauth/authorize?client_id=Ov23liXAuiBD8fzebBcm`
//   );
// });

// app.get("/auth/github-callback", (req, res) => {
//   //github secret:  3b278239ede685b50d7bdc22a8495e272c773d89
//   console.log(req);
//   axios
//     .post(
//       "https://github.com/login/oauth/access_token",
//       {
//         client_id: "Ov23liXAuiBD8fzebBcm",
//         client_secret: "3b278239ede685b50d7bdc22a8495e272c773d89",
//         code: req.query.code,
//       },
//       {
//         headers: {
//           Accept: "application/json",
//         },
//       }
//     )
//     .then((result) => {
//       console.log(result.data.access_token);
//       console.log("result.data: ", result.data);
//       res.send("you are authorized " + result.data.access_token);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   (req, res) => {
//     // Successful login
//     console.log("req.user: ", req.user);
//     res.send("Authentication successful! Welcome, " + req.user.displayName);
//   }
// );
