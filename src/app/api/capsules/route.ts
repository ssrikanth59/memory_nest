import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/lib/authOptions';
import { connectToDB } from '@/lib/mongodb';
import Capsule from '@/lib/models/Capsule';
import mongoose from 'mongoose';
import { MockDB } from '@/lib/mock-db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, unlockDate, pin, status, name } = await req.json();

    if (!content || !unlockDate || !pin) {
      return NextResponse.json({ error: 'Content, unlock date, and PIN are required' }, { status: 400 });
    }

    if (pin.length !== 4) {
      return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    try {
      await connectToDB();
      if (mongoose.connection.readyState === 1) {
        const capsule = await Capsule.create({
          content,
          unlockDate: new Date(unlockDate),
          pin,
          name,
          userId,
          status: status || 'locked'
        });
        return NextResponse.json({ success: true, capsule }, { status: 201 });
      }
    } catch (dbError) {
      console.warn("=> DB failed, saving capsule to resilient session storage.");
    }

    // Fallback to MockDB
    const capsule = await MockDB.createCapsule({
      content,
      unlockDate: new Date(unlockDate).toISOString(),
      pin,
      name,
      userId,
      status: status || 'locked'
    });

    return NextResponse.json({ success: true, capsule }, { status: 201 });
  } catch (error: any) {
    console.error('Capsule Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    try {
      await connectToDB();
      if (mongoose.connection.readyState === 1) {
        const capsules = await Capsule.find({ userId }).sort({ createdAt: -1 });
        return NextResponse.json({ capsules }, { status: 200 });
      }
    } catch (dbError) {
      console.warn("=> DB failed, loading capsules from resilient session storage.");
    }

    const capsules = await MockDB.findCapsules(userId);
    return NextResponse.json({ capsules }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
