import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req){
    try {
         const {userId} = getAuth(req);
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized User",
            });
        }

        const {chatId , name} = await req.json();
        //connect to the database
        await connectDB();
        //find the chat by id and userId and update its name
        await Chat.findOneAndUpdate({_id: chatId, userId},{name});
        return NextResponse.json({
            success: true,
            message: "Chat renamed successfully",
        });


    } catch (error) {
        return NextResponse.json({ success: false, error: error.message });
    }


}