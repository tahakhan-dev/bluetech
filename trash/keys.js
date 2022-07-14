// add this file to gitignore

module.exports = {
    google: {
        clientID: '606246448727-fe1s6r8ra3s195os6af9t97it0ek6f15.apps.googleusercontent.com',
        clientSecret: 'Gq7fflAd1CUpr9eLZjTB31C-',
        callbackURL: '/api/auth/google/redirect'
    },
    facebook: {
        clientID: '980582999097764',
        clientSecret: '957a6152427918e8299a9b375adf8719',
        callbackURL: '/api/auth/facebook/callback'
    },
    session: {
        cookieKey: "xyzcookiekey12345"
    }
};