import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
         const {userId} = getAuth(req);
          const {chatId} = await req.json();

        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized User",
            });
        }

        //connect to the database
        await connectDB();
        //find the chat by id and userId and delete it
        await Chat.deleteOne({_id: chatId, userId})
        return NextResponse.json({
            success: true,
            message: "Chat deleted successfully",
        });


    } catch (error) {
        return NextResponse.json({ success: false, error: error.message });
    }

}