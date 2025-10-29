export const maxDuration =60;
import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1' ,
    apiKey: process.env.DEEPSEEK_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        // "HTTP-Referer": "https://deepseek-nine-chi.vercel.app/",
        "X-Title": "My Dev Chat App"
        
    }
    
});

export async function POST(req) {

    try {
        const {userId} = getAuth(req)

        //extract chatid and prompt from the request body
        const { chatId, prompt } = await req.json();
        if(!userId){
            return NextResponse.json({ success: false, message: "Unauthorized" });
        }

        //find the chat document in the database
        await connectDB();
        const data = await Chat.findOne({userId, _id: chatId});
        //create a user message object
        const userPrompt = {
            role: "user",
            content: prompt,
            timestamp:Date.now()
        };

        data.messages.push(userPrompt);
        //call the deepseek api
        const completion = await openai.chat.completions.create({
            messages:[{role: "user", content:prompt}],
            model:  "deepseek/deepseek-r1-0528:free"
,
            store:true,
        });

        const message = completion.choices[0].message;
        message.timestamp = Date.now();
        //push the message to the chat document
        data.messages.push(message);
        data.save();

        return NextResponse.json({
            success: true,
            data: message,
        });


    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message,
        });
    }



}