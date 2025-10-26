import { Request, Response } from "express";
import {
  createOneToOneChannel,
  createOrUpdateUser,
  createUserToken,
} from "../services/stream.service";
import User from "../models/users.model";

export const getToken = async (req: Request, res: Response) => {
  try {
    const { userId, name, image } = req.body;
    console.log(userId, name, image);

    await createOrUpdateUser({ id: userId, name, image });

    const token = createUserToken(userId);
    console.log(token);

    res.json({
      token,
      apiKey: process.env.STREAM_API_KEY,
      user: { id: userId, name, image },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const openChat = async (req: Request, res: Response) => {
  try {
    const { adminId, userId } = req.body;

    const channel = await createOneToOneChannel(adminId, userId);

    res.json({ channelId: channel.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const openChatWithStaff = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    // Tìm staff online đầu tiên
    const staff = await User.findOne({ role: 'staff', status: 'active' });
    
    if (!staff) {
      return res.status(404).json({ error: 'Không có staff online' });
    }

    const channel = await createOneToOneChannel(staff._id, userId);

    res.json({ channelId: channel.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
