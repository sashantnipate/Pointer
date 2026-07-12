"use client";

import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  const projects = useQuery(api.projects.get);
  const createProjects = useMutation(api.projects.create);
  return (
    <div className="flex flex-col gap-2 p-4">
      <Button onClick={()=> createProjects({
        name : "New Project"
      })}
      className="w-[200px] h-10"
      >
        Add New Project
      </Button>
      {projects?.map((projects) => (
        <div className="border rounded p-2 flex flex-col w-2xl " key = {projects._id}>
          <p>{projects.name}</p>
          <p>Owner Id {`${projects.ownerId}`}</p>
        </div>
      ))}
      <UserButton/>
    </div>
  );
}