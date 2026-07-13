"use client"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { GamepadDirectional, SparkleIcon } from "lucide-react"
import { FaGithub } from "react-icons/fa"
import { ProjectsList } from "./projects-list"
import { useCreateProject } from "../hooks/use-projects"
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'
import { useState, useEffect } from "react"
import { ProjectCommadDialog } from "./projects-commad-dialoges"

export const ProjectsView = () => {
    const createProject = useCreateProject();
    const [CommandDialogOpen, setCommandDialogOpen] = useState(false);

    const handleCreateRandomProject = () => {
        const randomName: string = uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals],
            separator: "_",
        });
        createProject({ name: randomName });
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "/") {
                e.preventDefault();
                handleCreateRandomProject();
            }
            if (e.ctrlKey && (e.key === "a" || e.key === "A")) {
                e.preventDefault();
                setCommandDialogOpen(true);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [createProject]);

    return (
        <>
            <ProjectCommadDialog 
                open={CommandDialogOpen} 
                onOpenChange={setCommandDialogOpen}
            />
            
            <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-lg mx-auto flex flex-col gap-6 items-center">
                    
                    <div className="flex gap-2 items-center text-3xl font-bold text-foreground">
                        <GamepadDirectional size={32} className="text-primary" />
                        <span>Pointer</span>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        <div className="grid grid-cols-2 gap-3 w-full">
                            
                            <Button
                                variant="outline"
                                onClick={handleCreateRandomProject}
                                className="h-auto p-4 bg-background border rounded-none flex flex-col items-start gap-6 text-left w-full hover:bg-accent/40 group transition-all"
                            >
                                <div className="flex items-center justify-between w-full">
                                    <SparkleIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <Kbd >
                                        Ctrl + /
                                    </Kbd>
                                </div>
                                <span className="font-semibold text-sm">New Project</span>
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setCommandDialogOpen(true)}
                                className="h-auto p-4 bg-background border rounded-none flex flex-col items-start gap-6 text-left w-full hover:bg-accent/40 group transition-all"
                            >
                                <div className="flex items-center justify-between w-full">
                                    <FaGithub className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    <Kbd >
                                        Ctrl + A
                                    </Kbd>
                                </div>
                                <span className="font-semibold text-sm">Import Project</span>
                            </Button>

                        </div>

                        <ProjectsList onViewAll={() => setCommandDialogOpen(true)}/>
                    </div>
                </div>
            </div>
        </>
    )
}