"use client";

import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { ProjectsView } from "@/features/projects/components/projects-view";

export default function Home() {
  return <ProjectsView/>
}