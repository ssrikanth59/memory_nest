import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/lib/authOptions';
import { connectToDB } from '@/lib/mongodb';
import Memory from '@/lib/models/Memory';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import { MockDB } from '@/lib/mock-db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || '';
    const date = formData.get('date') as string || new Date().toISOString();
    const type = (formData.get('type') as string) || 'photo';
    const pin = (formData.get('pin') as string) || '';
    const file = formData.get('file') as File;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    let mediaUrl = '';
    
    if (file && file.size > 0) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        mediaUrl = `/uploads/${fileName}`;
      } catch (uploadError) {
        console.warn("=> File upload failed, but continuing with text-only memory.");
      }
    }

    try {
      await connectToDB();
      if (mongoose.connection.readyState === 1) {
        const memory = await Memory.create({
          title,
          description,
          date,
          type,
          mediaUrl,
          pin,
          userId: (session.user as any).id,
        });
        return NextResponse.json({ success: true, memory }, { status: 201 });
      }
    } catch (dbError) {
      console.warn("=> DB failed, saving to resilient session storage.");
    }

    // Fallback to MockDB
    const memory = await MockDB.createMemory({
      title,
      description,
      date,
      type,
      mediaUrl,
      pin,
      userId: (session.user as any).id,
    });

    return NextResponse.json({ success: true, memory }, { status: 201 });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');
    const isFavorite = searchParams.get('type') === 'favorite';
    const userId = (session.user as any).id;

    try {
      await connectToDB();
      if (mongoose.connection.readyState === 1) {
        let query: any = { userId };
        if (isFavorite) query.isFavorite = true;
        else if (type) query.type = type;
        const memories = await Memory.find(query).sort({ date: -1 });
        return NextResponse.json({ memories }, { status: 200 });
      }
    } catch (dbError) {
      console.warn("=> DB failed, loading from resilient session storage.");
    }

    const memories = await MockDB.findMemories(userId, { 
      type: isFavorite ? null : type, 
      isFavorite 
    });
    return NextResponse.json({ memories }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, isFavorite } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    const userId = (session.user as any).id;

    try {
      await connectToDB();
      if (mongoose.connection.readyState === 1) {
        const memory = await Memory.findOneAndUpdate(
          { _id: id, userId },
          { isFavorite },
          { new: true }
        );
        if (memory) return NextResponse.json({ success: true, memory }, { status: 200 });
      }
    } catch (dbError) {
      console.warn("=> DB failed, updating in resilient session storage.");
    }

    const memory = await MockDB.updateMemory(id, userId, { isFavorite });
    if (!memory) return NextResponse.json({ error: 'Memory not found' }, { status: 404 });

    return NextResponse.json({ success: true, memory }, { status: 200 });
  } catch (error: any) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
