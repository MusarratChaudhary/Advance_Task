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
  name: z.string().min(3, "Name is required"),

  email: z.string().email("Invalid email"),

  password: z.string().min(6, "Password minimum 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerAction } = useAuth();
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
      await registerAction(data);
    } catch (error: any) {
      // Error is handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <AuthCard title="Create Account" description="Join TaskPilot today">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <AuthInput
            label="Name"
            placeholder="Full name"
            {...register("name")}
          />

          <p className="text-red-500 text-sm">{errors.name?.message}</p>

          <AuthInput
            label="Email"
            type="email"
            placeholder="Email address"
            {...register("email")}
          />

          <p className="text-red-500 text-sm">{errors.email?.message}</p>

          <AuthInput
            label="Password"
            type="password"
            placeholder="Password"
            {...register("password")}
          />

          <p className="text-red-500 text-sm">{errors.password?.message}</p>

          <motion.button
            whileTap={{
              scale: 0.97,
            }}
            disabled={loading}
            className="

w-full

bg-purple-600

text-white

py-3

rounded-xl

font-semibold

hover:bg-purple-700

transition

"
          >
            {loading ? "Creating..." : "Register"}
          </motion.button>

          <p className="text-center text-sm text-zinc-500">
            Already have account?
            <Link href="/login" className="ml-1 text-purple-600">
              Login
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  );
}
