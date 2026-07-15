"use client";

import { Users, Plus } from "lucide-react";

import { Team } from "@/types";

interface Props {
  teams: Team[];
}

export default function TeamOverview({ teams }: Props) {
  return (
    <div
      className="
rounded-3xl
border
border-border
bg-card
p-6
shadow-sm
"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Teams</h2>

          <p className="text-sm text-zinc-500">Collaborate with your team</p>
        </div>

        <div
          className="

h-10

w-10

rounded-xl

bg-purple-100

dark:bg-purple-950

text-purple-600

flex

items-center

justify-center

"
        >
          <Users size={20} />
        </div>
      </div>

      {teams.length === 0 ? (
        <div
          className="

text-center

py-8

"
        >
          <div
            className="

mx-auto

h-14

w-14

rounded-full

bg-purple-100

dark:bg-purple-950

flex

items-center

justify-center

text-purple-600

mb-4

"
          >
            <Plus />
          </div>

          <h3 className="font-semibold">No Teams Yet</h3>

          <p className="text-sm text-zinc-500 mt-2">
            Create a team and start collaboration
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map((team) => (
            <div
              key={team._id}
              className="

rounded-2xl

bg-purple-50

dark:bg-zinc-800

p-4

"
            >
              <h3 className="font-semibold">{team.name}</h3>

              <p className="text-sm text-zinc-500">{team.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
