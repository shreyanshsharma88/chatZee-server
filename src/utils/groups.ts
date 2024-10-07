import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const allGroupsAndDMs = async (type: "GROUP" | "INDIVIDUAL") => {
    try {
      // const groups = await pool.query("select * from groups where type = $1", [
      // type,
      // ]);
      const groups = await prisma.groups.findMany({
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
      const group = await prisma.groups.findFirst({
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
  
  export const alreadyAddedInGroup = async (userId: string, groupId: string) => {
    try {
      // const group = await pool.query(
      // "select * from group_users where user_id = $1 and group_id = $2",
      // [userId, groupId]
      // );
     
      const group = await prisma.group_users.findFirst({
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