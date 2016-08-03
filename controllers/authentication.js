const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');
const crypto = require('crypto');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
  // User has email and passowrd verified
  // Need to give user the token
  res.send({ token: tokenForUser(req.user) });
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  // See if a user with given email exists
  User.findOne({ email: email }, function(err, existingUser) {
    if (err) {
      return next(err);
    }

    if (!email || !password) {
      return res.status(422).send({ error: 'You must provide a username and password' });
    }

    // If user with email exists, Error
    if (existingUser) {
      return res.status(422).send({ error: 'Email is in use' });
    }
    // If a user with email does not exist, create and save user
    const user = new User({
      email: email,
      password: password,
      passwordResetToken: null,
    });

    user.save(function(err) {
      if (err) {
        return next(err);
      }
      // Respond to request indicating user was created
      res.json({ token: tokenForUser(user) });
    });
  });
}

exports.resetPasswordInit = function(req, res, next) {
  const token = crypto.randomBytes(48).toString('hex');
  const email = req.body.email;

  User.findOne({ email: email }, function(err, existingUser) {
    if (!existingUser) {
      return res.status(422).send({ error: 'Email not found' });
    }

    if (err) {
      return next(err);
    }

    existingUser.passwordResetToken = token;

    existingUser.save(function(err) {
      if (err) {
        return next(err);
      }

      // TODO: email this to the user instead
      res.send({ message: `http://localhost:8080/resetpassword/token/${token}` });
    });
  });
};

exports.resetPassword = function(req, res, next) {
  const password = req.body.password;
  const token = req.body.token;

  User.findOne({ passwordResetToken: token }, function(err, existingUser) {
    if (!existingUser) {
      return res.status(422).send({ error: 'Password reset token invalid, click on "reset password" link again' });
    }

    if (err) {
      return next(err);
    }

    existingUser.passwordResetToken = null;
    existingUser.password = password;

    existingUser.save(function(err) {
      if (err) {
        return next(err);
      }

      res.send({ message: "Success! Password has been Reset" });
    });
  });
};
