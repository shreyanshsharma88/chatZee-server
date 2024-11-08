import { Request, Response } from "express";
import { paginateData } from "../utils/paginator";
import { PrismaClient } from "@prisma/client";
import { getUserById } from "../utils/user";
import {
  allGroupsAndDMs,
  alreadyAddedInGroup,
  getGroupById,
} from "../utils/groups";

const prisma = new PrismaClient();

export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    const { all, page, limit, search } = req.query;
    let responseData = [];

    const myGroups = await prisma.groups.findMany({
      where: {
        groupname: {
          contains: search?.toString(),
        },
        type: 'GROUP'
      },
      include: {
        group_users: {
          select: {
            user_id: true,
          },
        },
      },
    });
    const userGroupData = myGroups.reduce((acc: any[], group) => {

      const isAlreadyAdded = group.group_users.find((item) => item.user_id === user_id);
      return [...acc, { ...group, isAlreadyAdded: !!isAlreadyAdded }];
    },[])

    if (all === "true") {
      const paginatedData = paginateData({
        data: userGroupData,
        limit: Number(limit),
        page: Number(page),
      });
      responseData = paginatedData;
    }
    if (!all) {
      responseData = userGroupData.filter((group) => group.isAlreadyAdded);
    }
    return res.status(200).send({
      status: 200,
      groups: responseData,
      total: responseData?.length,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      message: "Error",
      status: 500,
      error: e,
    });
  }
};

export const getGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const group = await prisma.groups.findUnique({
      where:{
        id: groupId
      },
      include:{
        group_users:{
          include:{
            users:{
              select:{
                id: true,
                username: true
              }
            }
          }
        }
      }
    })
    return res.status(200).send({
      status: 200,
      group: {
        id: group?.id,
        groupName: group?.groupname,
        type: group?.type,
        users: group?.group_users.map((user) => ({
          id: user.users.id,
          username: user.users.username,
        })),
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      message: "Error",
      status: 500,
    });
  }
};

export const addUserToGroup = async (req: Request, res: Response) => {
  try {
    const { group_id } = req.params;
    const user_id = req.body.user_id;
    const group = await getGroupById(group_id);
    if (!group.exist) {
      return res.status(400).send({
        message: "Group not found",
        status: 400,
      });
    }
    const alreadyAdded = await alreadyAddedInGroup(user_id, group_id);
    if (alreadyAdded) {
      return res.status(400).send({
        message: "User already added",
        status: 400,
      });
    }
    await prisma.group_users.create({
      data: {
        group_id: group_id,
        user_id: user_id,
      },
    });
    return res.status(200).send({
      status: 200,
      message: "User added to group",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      message: "Error",
      status: 500,
      e,
    });
  }
};

export const addGroup = async (req: Request, res: Response) => {
  try {
    const { groupName, type, user_id, users } = req.body;
    if (!groupName || !type) {
      return res.status(401).send({
        message: "Groupname and type required",
        status: 401,
      });
    }
    const group = await prisma.groups.create({
      data: {
        groupname: groupName,
        type: type,
      },
    });

    await Promise.all([
      prisma.group_users.create({
        data: {
          group_id: group.id,
          user_id: user_id,
        },
      }),
      users &&
        users.length > 0 &&
        Promise.all(
          users.map(async (user: any) => {
            await prisma.group_users.create({
              data: {
                group_id: group.id,
                user_id: user,
              },
            });
          })
        ),
    ]);

    return res.status(200).send({
      status: 200,
      message: "Group added",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      message: "Error",
      status: 500,
      e,
    });
  }
};
