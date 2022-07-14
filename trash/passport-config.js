const passport = require('passport');
const jwt = require("jsonwebtoken");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const keys = require('./keys');
const db = require("../Model");
const Users = db.users;
const UsersDetail = db.usersdetail;
const Permissions = db.permissions;
const roles = db.roles;
const Op = db.Sequelize.Op;

const {
    userPermission
} = require("../Controller/extras/Permission");

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((userObj, done) => {
    Users.findByPk(userObj.id)
        .then((user) => {
            done(null, user.id);
        }).catch((err) => {
            done(err, false, err.message);
        });
});

passport.use(
    new GoogleStrategy({
        // Options for the google strategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: keys.google.callbackURL
    }, async (accessToken, refreshToken, profile, done) => {
        // Passport callback function
        // check if user already exists in our db
        const split = profile.displayName.split(' ');
        const first = split[0];
        const last = split[1];
        Users.findOne({ where: { email: profile.emails[0].value } })
            .then((currentUser) => {
                if (currentUser) {
                    // already have the user
                    done(null, currentUser);
                } else {
                    // if user does not exist, create new user 
                    roles
                        .findAll({
                            where: {
                                roleName: "User"
                            }
                        })
                        .then((result) => {
                            Users.create({
                                userName: profile.displayName,
                                email: profile.emails[0].value,
                                emailVerified: true,
                                accessToken
                            })
                                .then((newUser) => {
                                    let roleId = result[0].dataValues.id;
                                    let userId = newUser.dataValues.id;
                                    let permissionobj = userPermission
                                    permissionobj.userId = userId
                                    permissionobj.roleId = roleId
                                    Permissions
                                        .create(permissionobj)
                                        .then((result) => {
                                            done(null, result)
                                        })
                                        .catch((err) => {
                                            done(err, false, err.message);
                                        });
                                    const userdetails = UsersDetail.create({
                                        firstName: first,
                                        lastName: last,
                                        imagePath: profile.photos[0].value
                                    });
                                    done(null, newUser);
                                }).catch((err) => {
                                    done(err, false, err.message);
                                });
                        }).catch(err => {
                            done(err, false, err.message);
                        });
                }
            }).catch((err) => {
                done(err, false, err.message);
            });
    })
);

passport.use(
    new FacebookStrategy({
        clientID: keys.facebook.clientID,
        clientSecret: keys.facebook.clientSecret,
        callbackURL: keys.facebook.callbackURL,
        profileFields: ['id', 'displayName', 'photos', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        process.nextTick(function () {
            // Passport callback function
            // check if user already exists in our db
            const split = profile.displayName.split(' ');
            const first = split[0];
            const last = split[1];
            Users.findOne({ where: { email: profile.emails[0].value } })
                .then((currentUser) => {
                    if (currentUser) {
                        // already have the user
                        done(null, currentUser);
                    } else {
                        // if user does not exist, create new user 
                        roles
                            .findAll({
                                where: {
                                    roleName: "User"
                                }
                            })
                            .then((result) => {
                                Users.create({
                                    userName: profile.displayName,
                                    email: profile.emails[0].value,
                                    emailVerified: true,
                                    accessToken
                                })
                                    .then((newUser) => {
                                        let roleId = result[0].dataValues.id;
                                        let userId = newUser.dataValues.id;
                                        let permissionobj = userPermission
                                        permissionobj.userId = userId
                                        permissionobj.roleId = roleId
                                        Permissions
                                            .create(permissionobj)
                                            .then((result) => {
                                                done(null, result)
                                            })
                                            .catch((err) => {
                                                done(err, false, err.message);
                                            });
                                        const userdetails = UsersDetail.create({
                                            firstName: first,
                                            lastName: last,
                                            imagePath: profile.photos[0].value
                                        });
                                        done(null, newUser);
                                    }).catch((err) => {
                                        done(err, false, err.message);
                                    });
                            }).catch(err => {
                                done(err, false, err.message);
                            });
                    }
                }).catch((err) => {
                    done(err, false, err.message);
                });
        });
    })
);

