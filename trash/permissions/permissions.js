const {AccessControl} = require('accesscontrol');
const ac = new AccessControl();

ac
    .grant('User')
    .readOwn('Account')
    .updateOwn('Account')

ac
    .grant('Admin')
    .extend('User')
    .createAny(['Role','Account'])
    .readAny(['Role','Account'])
    .updateAny(['Role','Account'])

ac
    .grant('SuperAdmin')
    .extend('Admin');

module.exports = {
    ac
}
