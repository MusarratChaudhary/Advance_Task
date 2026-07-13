import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";


export const metadata: Metadata = {

  title: "ChatSphere | Real-Time Messaging App",

  description:
    "ChatSphere is a modern real-time messaging platform for secure and seamless conversations.",

};




export default function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode;

}>) {


  return (

    <html lang="en">


      <body className="antialiased">


        <ThemeProvider>
          <AuthProvider>

            <Header />

            {children}

            <Footer />

          </AuthProvider>
        </ThemeProvider>


      </body>


    </html>

  );

}