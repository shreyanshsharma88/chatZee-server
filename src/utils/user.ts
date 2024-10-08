import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const checkUserExist = async (userName: string) => {
  try {
    console.log({userName});
    const user = await prisma.users.findFirst({
      where: {
        username: userName,
      },
    });
    if (!!user?.id) return { exist: true, user: user };
    return { exist: false, user: null };
  } catch (e) {
    return { exist: null, user: null };
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: id,
      },
    });

    if (!!user?.id) return { exist: true, user: user };
    return { exist: false, user: null };
  } catch (e) {
    return { exist: null, user: null };
  }
};

export const dmAlreadyExists = async ({
  id,
  userId,
}: {
  userId: string;
  id: string;
}) => {
  try {
    const group = await prisma.groups.findFirst({
      where: {
        type: "INDIVIDUAL",
        group_users: {
          some: {
            user_id: userId,
          },
        },
      },
      include: {
        group_users: {
          where: {
            user_id: id,
          },
        },
      },
    });

    if (Number(group?.group_users?.length) > 0) {
      return { exist: true, groupId: group?.id };
    }

    return { exist: false, groupId: null };
  } catch (e) {
    return null;
  }
};
