import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDB } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    const { name, email, password, vaultPin } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    console.log(`Registering user: ${email}`);
    await connectToDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Registration Failure: User already exists: ${email}`);
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      vaultPin,
    });

    console.log(`Registration Success: User created: ${email}`);
    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: 'An error occurred while registering the user' }, { status: 500 });
  }
}
