import express from 'express';

import { prisma } from '../db/prisma';

export const getAllUsers = async (req: express.Request, res: express.Response) => {
  try {
    const users = (await prisma.user.findMany());

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const deleteUser = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    const deletedUser = await prisma.user.delete({ where : { id } });

    return res.json(deletedUser);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}

export const updateUser = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.sendStatus(400);
    }

    const updatedUser = await prisma.user.update({ 
      where: { id },
      data: { username }
    });

    return res.status(200).json(updatedUser).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
}