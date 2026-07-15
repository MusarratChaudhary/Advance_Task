import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main
      className="

min-h-screen

flex

items-center

justify-center

px-5

relative

overflow-hidden

bg-gradient-to-br

from-purple-100

via-[#FFF8F0]

to-purple-200

dark:from-black

dark:via-zinc-950

dark:to-purple-950

"
    >
      <div
        className="

absolute

w-72

h-72

bg-purple-500/20

rounded-full

blur-3xl

top-10

left-10

"
      />

      <div
        className="

absolute

w-72

h-72

bg-purple-600/20

rounded-full

blur-3xl

bottom-10

right-10

"
      />

      {children}
    </main>
  );
}
