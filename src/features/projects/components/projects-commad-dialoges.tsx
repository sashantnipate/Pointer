'use client'

import { useRouter } from "next/navigation";
import { useProjects } from "../hooks/use-projects";
import { FaGithub } from "react-icons/fa";
import { AlertCircleIcon, GlobeIcon, Loader2Icon } from "lucide-react";
import { Doc } from "../../../../convex/_generated/dataModel";

// 1. ADD 'Command' to this local shadcn import
import { 
    Command,
    CommandDialog, 
    CommandEmpty, 
    CommandGroup, 
    CommandInput, 
    CommandItem, 
    CommandList 
} from "@/components/ui/command";

const getProjectIcon = (project: Doc<"projects">) => {
    if (project.importStatus === "completed") return <FaGithub className="mr-2 size-4" />
    if (project.importStatus === "failed") return <AlertCircleIcon className="mr-2 size-4 text-destructive" />
    if (project.importStatus === "importing") return <Loader2Icon className="mr-2 size-4 animate-spin" />
    return <GlobeIcon className="mr-2 size-4" />
}

interface ProjectCommadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ProjectCommadDialog = ({
    open, 
    onOpenChange,
}: ProjectCommadDialogProps) => {
    const router = useRouter();
    const projects = useProjects();

    const handleSelect = (projectId: string) => {
        router.push(`/projects/${projectId}`); 
        onOpenChange(false);
    };

    return (
        <CommandDialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <Command className="rounded-none">
                <CommandInput placeholder="Search for the Project"/>
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Projects">
                        {projects?.map((project) => (
                            <CommandItem
                                key={project._id}
                                value={`${project.name}-${project._id}`}
                                onSelect={() => handleSelect(project._id)}
                                className="cursor-pointer"
                            >   
                                {getProjectIcon(project)}
                                <span>{project.name}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </Command>
        </CommandDialog>
    )
}