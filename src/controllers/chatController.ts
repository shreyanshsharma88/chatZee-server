import { Response, Request } from "express";
import { pool } from "../db/dbConnection";
import { paginateData } from "../utils/paginator";
export const getChats = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;
    const { group_id } = req.params;

    const groupChats = await pool.query(
      "select * from chats where group_id = $1",
      [group_id]
    );
    const paginatedData = paginateData({
      data: groupChats.rows,
      limit: Number(limit),
      page: Number(page),
    });

    // TODO: FORMAT THIS DATA IN A MORE READABLE WAY
    return res.status(200).send({
      status: 200,
      chats: paginatedData,
    });
  } catch (e) {
    return res.status(500).send({
      status: 500,
      message: "Internal server error",
      e,
    });
  }
};
