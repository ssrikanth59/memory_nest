import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/lib/authOptions';
import { connectToDB } from '@/lib/mongodb';
import Memory from '@/lib/models/Memory';
import Capsule from '@/lib/models/Capsule';
import mongoose from 'mongoose';
import { MockDB } from '@/lib/mock-db';

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
        const [totalMemories, videos, favorites, capsules] = await Promise.all([
          Memory.countDocuments({ userId }),
          Memory.countDocuments({ userId, type: 'video' }),
          Memory.countDocuments({ userId, isFavorite: true }),
          Capsule.countDocuments({ userId })
        ]);

        return NextResponse.json({
          totalMemories,
          videos,
          favorites,
          capsules
        }, { status: 200 });
      }
    } catch (dbError) {
      console.warn("=> DB failed, loading stats from resilient session storage.");
    }

    // Fallback to MockDB Stats
    const stats = await MockDB.getStats(userId);
    return NextResponse.json(stats, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
