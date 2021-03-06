// Generated by CoffeeScript 1.9.1
var BearerStrategy, authClient, authServerUrl, cache, getIdentity, passport, restify, roleSort;
restify = require('restify');

passport = require('passport');

BearerStrategy = require('passport-http-bearer').Strategy;

var initAuthClient = function(AUTH_URL){
    authServerUrl = ("" + ( AUTH_URL || 'http://172.17.42.1')).replace("tcp:", "http:");

    console.info("Using Auth Service at: " + authServerUrl);

    authClient = restify.createJsonClient({
        url: authServerUrl,
        version: '*',
        retry: false
    });
}

cache = {};

passport.use(new BearerStrategy({}, function(token, done) {
    var info, tokenObj;
    info = cache[token];
    console.log("TOKEN",token)
    if (info != null ? info.token : void 0) {
        return done(null, info.user, info.token);
    }
    tokenObj = {
        audience: "*",
        expires_in: 999999
    };
    return authClient.get({
        path: "/api/authorization/userinfo",
        headers: {
            Authorization: "Bearer " + token,
            Host: 'spotit-auth-service.private'
        }
    }, function(err, req, res, user) {
        console.log("USER",user,err);
        if(err){
            return done(err);
        }
        cache[token] = {
            user: user,
            token: tokenObj
        };
        done(null,user,tokenObj)
    });
}));

var initFunction = function(server,AUTH_URL){
    initAuthClient(AUTH_URL);
    return server.use(passport.initialize());
}
module.exports = {
    init: initFunction,
    authenticate: passport.authenticate(['bearer'], {
        session: false
    })
};