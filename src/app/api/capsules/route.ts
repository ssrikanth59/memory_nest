import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/lib/authOptions';
import { connectToDB } from '@/lib/mongodb';
import Capsule from '@/lib/models/Capsule';

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

    await connectToDB();

    const capsule = await Capsule.create({
      content,
      unlockDate: new Date(unlockDate),
      pin,
      name,
      userId: (session.user as any).id,
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

    await connectToDB();

    const capsules = await Capsule.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });

    return NextResponse.json({ capsules }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
