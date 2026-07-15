"use client";

import { useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import { motion } from "framer-motion";

import { toast } from "sonner";

import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  email: z.string().email("Invalid email"),

  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,

    handleSubmit,

    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await login(data);
    } catch (error: any) {
      // Error is handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <AuthCard title="Welcome Back" description="Login to manage your tasks">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <AuthInput
            label="Email"
            type="email"
            placeholder="Enter email"
            {...register("email")}
          />

          <p className="text-sm text-red-500">{errors.email?.message}</p>

          <AuthInput
            label="Password"
            type="password"
            placeholder="Enter password"
            {...register("password")}
          />

          <p className="text-sm text-red-500">{errors.password?.message}</p>

          <motion.button
            whileTap={{
              scale: 0.97,
            }}
            disabled={loading}
            className="

w-full

rounded-xl

bg-purple-600

py-3

text-white

font-semibold

hover:bg-purple-700

transition

"
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>

          <p className="text-center text-sm text-zinc-500">
            Don't have an account?
            <Link href="/register" className="ml-1 text-purple-600 font-medium">
              Create account
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
}
