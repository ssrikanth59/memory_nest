import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/lib/authOptions';
import { connectToDB } from '@/lib/mongodb';
import Memory from '@/lib/models/Memory';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Memory ID is required' }, { status: 400 });
    }

    await connectToDB();

    const memory = await Memory.findOne({ _id: id, userId: (session.user as any).id });
    if (!memory) {
      return NextResponse.json({ error: 'Memory not found or unauthorized' }, { status: 404 });
    }

    // Try to delete physical file if exists
    if (memory.mediaUrl && memory.mediaUrl.startsWith('/uploads/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', memory.mediaUrl);
        await unlink(filePath);
      } catch (e) {
        console.error('Failed to delete physical file:', e);
      }
    }

    await Memory.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Memory deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
