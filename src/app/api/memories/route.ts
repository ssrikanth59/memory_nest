import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/lib/authOptions';
import { connectToDB } from '@/lib/mongodb';
import Memory from '@/lib/models/Memory';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

    await connectToDB();

    let mediaUrl = '';
    
    if (file && file.size > 0) {
      // Create local upload mechanism
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (e) {
        // Directory might already exist
      }
      
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      
      mediaUrl = `/uploads/${fileName}`;
    }

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

    await connectToDB();

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');
    
    let query: any = { userId: (session.user as any).id };
    if (type === 'favorite') {
      query.isFavorite = true;
    } else if (type) {
      query.type = type;
    }

    const memories = await Memory.find(query).sort({ date: -1 });

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

    await connectToDB();

    const memory = await Memory.findOneAndUpdate(
      { _id: id, userId: (session.user as any).id },
      { isFavorite },
      { new: true }
    );

    if (!memory) return NextResponse.json({ error: 'Memory not found' }, { status: 404 });

    return NextResponse.json({ success: true, memory }, { status: 200 });
  } catch (error: any) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
