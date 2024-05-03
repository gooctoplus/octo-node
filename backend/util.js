import jwt from 'jsonwebtoken';
import config from './config';

/**
 * @description It is for genrating the jwt token with the use of orgId and it expires
 * after 10 days.
 * @param {*} org 
 * @returns jwt token
 */
const getToken = (org) => {
  return jwt.sign(
    {
      orgId: org.orgId
    },
    config.JWT_SECRET,
    {
      expiresIn: '10d',
    }
  );
};

const isAuth = (req, res, next) => {
  const token = req.headers['authorization'];

  if (token) {
    const onlyToken = token.slice(7, token.length);
    jwt.verify(onlyToken, config.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(401).send({ message: 'Invalid Token' });
      }
      req.org = decode;
      next();
      return;
    });
  } else {
    return res.status(401).send({ message: 'Token is not supplied.' });
  }
};

const isAdmin = (req, res, next) => {
  console.log(req.user);
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(401).send({ message: 'Admin Token is not valid.' });
};

export { getToken, isAuth, isAdmin };
