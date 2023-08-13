const session = require("express-session");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

module.exports = function (app, db) {
  app.use(
    session({
      secret: "abc123abc123qwe123",
      resave: false,
      saveUninitialized: false,
    })
  );
  passport.serializeUser((admin, done) => {
    done(null, admin.id);
  });

  passport.deserializeUser((id, done) => {
    global.db.get("SELECT * FROM admins WHERE id = ?", id, (err, admin) => {
      if (err) {
        console.error("Error deserializing user:", err);
        return done(err);
      }
      done(null, admin);
    });
  });

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy((username, password, done) => {
      global.db.get(
        "SELECT * FROM admins WHERE username = ?",
        username,
        (err, admin) => {
          if (err) return done(err);
          if (!admin) return done(null, false);
          bcrypt.compare(password, admin.password, (err, res) => {
            if (err) return done(err);
            if (!res) return done(null, false);
            return done(null, admin);
          });
        }
      );
    })
  );
};
