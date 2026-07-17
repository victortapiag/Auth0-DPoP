const crypto = require('crypto');

var router = require('express').Router();


const generateNonce = () => crypto.randomBytes(16).toString('hex');

const requiresAuthWithNonce = (req, res, next) => { 
  if (!req.oidc.isAuthenticated()) {
    return res.oidc.login({
      authorizationParams: { 'ext-my-lexisNexisID': generateNonce() }
    });
  }
  next();
};

router.get('/login', (req, res) => {
  if (req.oidc.isAuthenticated()) return res.redirect('/');
  return res.oidc.login({
    returnTo: '/',
    authorizationParams: { 'ext-my-lexisNexisID': generateNonce() }
 });
});

router.get('/logout', (req, res) => res.oidc.logout());

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Auth0 Webapp',
    isAuthenticated: req.oidc.isAuthenticated()
  });
});

router.get('/profile', requiresAuthWithNonce, function (req, res, next) {
  res.render('profile', {
    userProfile: JSON.stringify(req.oidc.user, null, 2),
    title: 'Profile page'
  });
});

module.exports = router;


