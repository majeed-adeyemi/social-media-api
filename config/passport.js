const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const dotenv = require("dotenv");

dotenv.config();
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, CALLBACK_URL } = process.env; // From .env file

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const firstName = profile.name.givenName || "";
        const lastName = profile.name.familyName || "";
        const middleName =
          profile.displayName.split(" ").slice(1, -1).join(" ") || "";

        let user = await User.findOne({ email });

        if (user) {
          if (!user.googleId) {
            user.googleId = profile.id;
            user.firstName = user.firstName || firstName;
            user.middleName = user.middleName || middleName;
            user.lastName = user.lastName || lastName;
            user.avatar = user.profilePicture || profile.photos[0]?.value;
            await user.save();
          }
        } else {
          user = new User({
            googleId: profile.id,
            email: email,
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            avatar: profile.photos[0]?.value || null,
          });
          await user.save();
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});