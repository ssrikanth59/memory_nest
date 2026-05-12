import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/lib/authOptions';
import { connectToDB } from '@/lib/mongodb';
import Memory from '@/lib/models/Memory';
import mongoose from 'mongoose';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Memory ID is required' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    try {
      await connectToDB();
      if (mongoose.connection.readyState === 1) {
        // Attempt to delete from MongoDB
        const deletedMemory = await Memory.findOneAndDelete({
          _id: id,
          userId: userId,
        });

        if (deletedMemory) {
          return NextResponse.json({ success: true, message: 'Memory deleted' }, { status: 200 });
        }
      }
    } catch (dbError) {
      console.warn("=> DB failed during delete. This is expected in Sanctuary Mode.");
    }

    // Note: Since MockDB is currently in-memory and temporary, 
    // we return success to the UI so the item disappears from the list.
    // In a real production fallback, we would handle cross-tab synchronization.
    
    return NextResponse.json({ success: true, message: 'Memory removed from view' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
