import express from 'express';

import { login, register, current } from '../controllers/authentication';
import { isAuthenticated } from '../middlewares';

export default (router: express.Router) => {
  router.get('/auth/current', isAuthenticated, current);
  router.post('/auth/register', register);
  router.post('/auth/login', login);
};
