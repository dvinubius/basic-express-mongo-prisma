import express from 'express';
import { merge, get } from 'lodash';

import { prisma } from '../db/prisma';

export type Identity = {
  _id: string;
  email: string;
  username: string;
  authentication: {
    sessionToken: string;
  }
}

export type Request = express.Request & {
  identity: Identity;
}

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const sessionToken = req.cookies['ANTONIO-AUTH'];

    if (!sessionToken) {
      return res.sendStatus(403);
    }

    const existingUser = await prisma.user.findFirst({ 
      where: { authentication : { sessionToken: sessionToken } },
    });

    if (!existingUser) {
      return res.sendStatus(403);
    }

    console.log(existingUser)

    merge(req, { identity: existingUser });

    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}

export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { id } = req.params;
    const currentUserId = get(req, 'identity.id') as string;

    if (!currentUserId) {
      return res.sendStatus(400);
    }

    if (currentUserId.toString() !== id) {
      return res.sendStatus(403);
    }

    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}