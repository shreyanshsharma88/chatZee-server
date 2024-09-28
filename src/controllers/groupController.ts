import { Request, Response } from "express";
import { getUserById } from "./profileController";
import { paginateData } from "../utils/paginator";
import Group from "../models/groups";
import GroupUser from "../models/groupUsers";

export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    const { all, page, limit } = req.query;
    let responseData;
    const [alreadyAddedGroups, groups] = await Promise.all([
      // pool.query("select * from group_users where user_id = $1", [user_id]),
      GroupUser.findAll({
        where: {
          user_id: user_id,
        },
      }),
      allGroupsAndDMs("GROUP"),
    ]);

    const userGroupData = groups.reduce((acc: any, group: any) => {
      const isAlreadyAdded = alreadyAddedGroups.find(
        (g: any) => g.group_id === group.id
      );
      return [...acc, { ...group, isAlreadyAdded: !!isAlreadyAdded }];
    }, []);

    if (all === "true") {
      const paginatedData = paginateData({
        data: userGroupData,
        limit: Number(limit),
        page: Number(page),
      });
      responseData = paginatedData;
    }
    if (!all) {
      responseData = userGroupData;
    }
    return res.status(200).send({
      status: 200,
      groups: responseData,
      total: userGroupData.length,
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
    const group = await getGroupById(groupId);
    if (group.exist === null) {
      throw new Error("Error");
    }
    if (group.exist === false) {
      return res.status(401).send({
        status: 401,
        message: "Group not found",
      });
    }
    // const users = await pool.query(
      // "select * from group_users where group_id = $1",
      // [groupId]
    // );
    const users = await GroupUser.findAll({
      where: {
        group_id: groupId,
      },
    });
    const userDetails = await Promise.all(
      users.map(async (user: any) => {
        const { exist, user: userData } = await getUserById(user.user_id);
        if (exist === false || !userData) return;
        return {
          id: userData.id,
          userName: userData.username,
        };
      })
    );
    return res.status(200).send({
      status: 200,
      group: {
        id: group.group?.id,
        groupName: group.group?.groupname,
        type: group.group?.type,
        users: userDetails,
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
    // await pool.query(
    //   "insert into group_users( group_id, user_id ) values($1, $2)",
    //   [group_id, user_id]
    // );
    await GroupUser.create({
      group_id: group_id,
      user_id: user_id,
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
    const { groupName, type, user_id } = req.body;
    if (!groupName || !type) {
      return res.status(401).send({
        message: "Groupname and type required",
        status: 401,
      });
    }

    // const group = await pool.query(
    // "insert into groups(groupname, type) values($1, $2) returning *",
    // [groupName, type]
    // );

    // await pool.query(
    // "insert into group_users (group_id, user_id) values($1, $2)",
    // [group.rows[0].id, user_id]
    // );
    const group = await Group.create({
      groupname: groupName,
      type: type,
    });

    await GroupUser.create({
      group_id: group.id,
      user_id: user_id,
    });

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

export const allGroupsAndDMs = async (type: "GROUP" | "INDIVIDUAL") => {
  try {
    // const groups = await pool.query("select * from groups where type = $1", [
    // type,
    // ]);
    const groups = await Group.findAll({
      where: {
        type: type,
      },
    });
    return groups;
  } catch (e) {
    return [];
  }
};

export const getGroupById = async (id: string) => {
  try {
    // const group = await pool.query("select * from groups where id = $1", [id]);
    const group = await Group.findOne({
      where: {
        id: id,
      },
    });
    if (!!group?.id) return { exist: true, group: group };
    return { exist: false, group: null };
  } catch (e) {
    return { exist: null, group: null };
  }
};

const alreadyAddedInGroup = async (userId: string, groupId: string) => {
  try {
    // const group = await pool.query(
    // "select * from group_users where user_id = $1 and group_id = $2",
    // [userId, groupId]
    // );
    const group = await GroupUser.findOne({
      where: {
        user_id: userId,
        group_id: groupId,
      },
    });
    return !!group?.id;
  } catch (e) {
    return false;
  }
};
