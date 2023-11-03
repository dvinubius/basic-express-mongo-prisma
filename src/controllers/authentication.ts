import express from 'express';

import { authentication, random } from '../helpers';
import { Request } from '../middlewares';
import { prisma } from '../db/prisma';

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.sendStatus(400);
    }

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        authentication: true
      }
    });

    if (!user) {
      return res.sendStatus(400);
    }

    const expectedHash = authentication(user.authentication.salt, password);
    
    if (user.authentication.password != expectedHash) {
      return res.sendStatus(403);
    }

    const salt = random();
    const sessionToken = authentication(salt, user.id.toString());

    await prisma.auth.update({
      where: { id: user.authentication.id },
      data: { sessionToken }
    })

    res.cookie('ANTONIO-AUTH', sessionToken, { domain: 'localhost', path: '/' });

    delete user.authentication;
    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const current = (async (req: Request, res: express.Response) => {
  return res.status(200).json(req.identity).end() satisfies express.Response<any, Record<string, any>>; 
});

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.sendStatus(400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
  
    if (existingUser) {
      return res.sendStatus(400);
    }

    const salt = random();
    const passwordHash = authentication(salt, password);

    const user = await prisma.user.create({
      data: {
        email,
        username, 
        authentication: {
          create: {
            salt,
            password: passwordHash
          }
        }
      }, 
      include: {
        authentication: true,
      }
    });

    const userWithoutAuth = await prisma.user.findUnique({ where: { id: user.id } });
    return res.status(200).json(userWithoutAuth).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}