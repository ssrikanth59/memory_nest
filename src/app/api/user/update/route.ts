import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { connectToDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let name, email, phone, currentPassword, newPassword, profileImage, language, baby, settings;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      name = formData.get('name') as string;
      email = formData.get('email') as string;
      phone = formData.get('phone') as string;
      language = formData.get('language') as string;
      profileImage = formData.get('profileImage') as string;
      currentPassword = formData.get('currentPassword') as string;
      newPassword = formData.get('newPassword') as string;
    } else {
      const body = await req.json();
      name = body.name;
      email = body.email;
      phone = body.phone;
      language = body.language;
      profileImage = body.profileImage;
      currentPassword = body.currentPassword;
      newPassword = body.newPassword;
      baby = body.baby;
      settings = body.settings;
    }
    
    const userId = (session.user as any).id;

    await connectToDB();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update basic info
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (language) user.language = language;
    if (profileImage) user.image = profileImage;
    if (baby) user.baby = baby;
    if (settings) {
      user.settings = { ...user.settings, ...settings };
      user.markModified('settings');
    }

    // Password update logic
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to change it' }, { status: 400 });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password you entered is incorrect' }, { status: 400 });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return NextResponse.json({ 
      success: true, 
      user: { name: user.name, email: user.email } 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
