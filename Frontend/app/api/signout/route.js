import { NextResponse } from "next/server";

export const POST = async (req) => {
    try {
        const res = NextResponse.json({message: 'User Logged Out Successfully!'}, {status: 200});
        res.cookies.set('token', '', {httpOnly: true, expires: new Date(0)});
        return res
    } catch (err) {
        console.log(err);
        return NextResponse.error();
    }
}