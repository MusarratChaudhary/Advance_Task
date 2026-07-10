// // app/api/auth/login/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import connectDB from '@/lib/db';
// import User from '@/models/User';
// import { signToken, setAuthCookie } from '@/lib/auth';

// export async function POST(request: NextRequest) {
//   try {
//     await connectDB();

//     const { email, password } = await request.json();

//     if (!email || !password) {
//       return NextResponse.json(
//         { success: false, message: 'Email and password are required' },
//         { status: 400 }
//       );
//     }

//     // Find user
//     const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid email or password' },
//         { status: 401 }
//       );
//     }

//     // Check password
//     const isPasswordValid = await user.comparePassword(password);
    
//     if (!isPasswordValid) {
//       return NextResponse.json(
//         { success: false, message: 'Invalid email or password' },
//         { status: 401 }
//       );
//     }

//     // Generate JWT token
//     const token = signToken({
//       userId: user._id.toString(),
//       email: user.email,
//       role: user.role,
//     });

//     // Set HTTP-only cookie
//     setAuthCookie(token);

//     return NextResponse.json({
//       success: true,
//       message: 'Login successful',
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });

//   } catch (error: any) {
//     console.error('Login error:', error);
    
//     return NextResponse.json({
//       success: false,
//       message: 'Something went wrong during login',
//     }, { status: 500 });
//   }
// }

// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Login failed' }, { status: 500 });
  }
}