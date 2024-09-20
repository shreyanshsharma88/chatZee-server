import { Request, Response } from "express";
import { getUserById } from "./profileController";
import { pool } from "../db/dbConnection";

// TODO: ADD AN AUTHENTICATION MIDDLEWARE

export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const id = (req.headers as any)["userid"];
    if (!id) {
      return res.status(401).send({
        message: "Unauthorized",
        status: 401,
      });
    }
    const { exist } = await getUserById(id);
    if (!exist) {
      return res.status(401).send({
        message: "User not found",
        status: 401,
      });
    }

    const [alreadyAddedGroups, groups] = await Promise.all([
      pool.query("select * from group_users where user_id = $1", [id]),
      allGroupsAndDMs("GROUP"),
    ]);

    const userGroupData = groups.reduce((acc: any, group: any) => {
      const isAlreadyAdded = alreadyAddedGroups.rows.find(
        (g: any) => g.group_id === group.id
      );
      return [...acc, { ...group, isAlreadyAdded: !!isAlreadyAdded }];
    }, []);

    return res.status(200).send({
      status: 200,
      groups: userGroupData,
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
    const users = await pool.query(
      "select * from group_users where group_id = $1",
      [groupId]
    );
    const userDetails = await Promise.all(
      users.rows.map(async (user: any) => {
        const { exist, user: userData } = await getUserById(user.user_id);
        if (exist === false) return;
        return {
          id: userData.id,
          userName: userData.username,
        };
      })
    );
    return res.status(200).send({
      status: 200,
      group: {
        id: group.group.id,
        groupName: group.group.group_name,
        type: group.group.type,
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
    const user_id = (req.headers as any)["userid"];
    const { group_id } = req.params;
    if (!user_id || !group_id) {
      return res.status(401).send({
        message: "Unauthorized",
        status: 401,
      });
    }
    const { exist } = await getUserById(user_id);

    if (exist === false) {
      return res.status(400).send({
        message: "User not found",
        status: 400,
      });
    }
    if(exist === null) {
       throw new Error("Error");
    }
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

    console.log({
        group_id,
        user_id,
    })
    await pool.query("insert into group_users( group_id, user_id ) values($1, $2)", [
      group_id,
      user_id,
    ]);
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
    const user_id = (req.headers as any)["userid"];
    const { groupName, type } = req.body;
    if (!user_id || !groupName || !type) {
      return res.status(401).send({
        message: "Unauthorized",
        status: 401,
      });
    }
    const { exist } = await getUserById(user_id);
    if (!exist) {
      return res.status(400).send({
        message: "User not found",
        status: 400,
      });
    }
    const group = await pool.query(
      "insert into groups(groupname, type) values($1, $2) returning *",
      [groupName, type]
    );
    await pool.query("insert into group_users (group_id, user_id) values($1, $2)", [
      group.rows[0].id,
      user_id,
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

export const allGroupsAndDMs = async (type: "GROUP" | "INDIVIDUAL") => {
  try {
    const groups = await pool.query("select * from groups where type = $1", [
      type,
    ]);
    return groups.rows;
  } catch (e) {
    return [];
  }
};

export const getGroupById = async (id: string) => {
  try {
    const group = await pool.query("select * from groups where id = $1", [id]);
    if (!!group.rows[0].id) return { exist: true, group: group.rows[0] };
    return { exist: false, group: null };
  } catch (e) {
    return { exist: null, group: null };
  }
};

const alreadyAddedInGroup = async (userId: string, groupId: string) => {
  try {
    const group = await pool.query(
      "select * from group_users where user_id = $1 and group_id = $2",
      [userId, groupId]
    );
    return !!group.rows[0];
  } catch (e) {
    return false;
  }
};
