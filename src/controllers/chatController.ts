import { Response, Request } from "express";
import { paginateData } from "../utils/paginator";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()
export const getChats = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;
    const { group_id } = req.params;
    const groupChats = await prisma.chats.findMany({
      where: {
        sent_to: group_id,
      },
      include:{
        users: true
      }
    })
    const paginatedData = paginateData({
      data: groupChats,
      limit: Number(limit),
      page: Number(page),
    });

    

    // TODO: FORMAT THIS DATA IN A MORE READABLE WAY
    return res.status(200).send({
      status: 200,
      chats: paginatedData.map((item) => ({
        id: item.id,
        message: item.message,
        sentBy: item.sent_by,
        sentTo: item.sent_to,
        time: item.time_stamp,
        sentByUsername: item.users.username
      })),
    });
  } catch (e) {
    return res.status(500).send({
      status: 500,
      message: "Internal server error",
      e,
    });
  }
};
