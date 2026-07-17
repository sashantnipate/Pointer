import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CloudCheckIcon, GamepadDirectional, LoaderIcon } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useProject, useRenameProject } from "../hooks/use-projects";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

export const Navbar = (
    {
        projectId
    }:
    {
        projectId: Id<"projects">;
    }
) => {
    const getProject = useProject(projectId);
    const renameProject = useRenameProject();
    const [isRenaming, setIsRenaming] = useState(false);
    const [name, setName] = useState("")

    const handleStartRename = () =>{
        if (!getProject) return;
        setName(getProject.name);
        setIsRenaming(true);
    }

    const handleSubmit = () => {
        if(!getProject) return;
        setIsRenaming(false);

        const trimmedName = name.trim();
        if(!trimmedName || trimmedName === getProject?.name) return

        renameProject({Id: projectId, name:trimmedName});
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if(e.key === "Enter"){
            handleSubmit();
        }
    }
    return(
        <nav className="flex justify-between items-center gap-x-2 p-3 bg-sidebar border-b">
            <div className="flex items-center gap-x-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <div className="flex items-center gap-1.5 transition-colors text-muted-foreground hover:text-foreground text-sm font-medium">
                                <Link 
                                    href='/'
                                    className="flex gap-1.5 justify-between items-center"
                                >
                                    <GamepadDirectional className="size-5"/>
                                    <span className="text-lg">
                                        Pointer
                                    </span>
                                </Link>
                            </div>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator/>
                        <BreadcrumbItem>
                            {isRenaming ? (
                                <input
                                    autoFocus
                                    type= "text"
                                    value={name}
                                    onChange={(e)=> setName(e.target.value)}
                                    onFocus={(e) => e.currentTarget.select()}
                                    onBlur= {handleSubmit}
                                    onKeyDown={handleKeyDown}
                                    className="text-sm bg-transparent text-foreground outline-none focus:ring-1 focus:ring-inset focus:ring-ring font-medium max-w-40 truncate "
                                />
                            ) : (
                                <BreadcrumbPage 
                                    className="text-sm cursor-pointer hover:text-primary font-medium max-w-40 truncate"
                                    onClick={handleStartRename}
                                >
                                    {getProject?.name ?? "Loading..."}
                                </BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                {getProject?.importStatus == "importing" ? (
                    <Tooltip>
                        <TooltipTrigger >
                            <LoaderIcon className="size-4 text-muted-foreground animate-spin"/>
                            <TooltipContent>
                                Importing....
                            </TooltipContent>
                        </TooltipTrigger>
                    </Tooltip>
                ) : (
                    getProject?.updatedAt && (
                        <Tooltip>
                            <TooltipTrigger >
                                <CloudCheckIcon/>
                                <TooltipContent>
                                    Saved{" "}
                                    {formatDistanceToNow(
                                        getProject.updatedAt,
                                        {addSuffix: true}
                                    )}
                                </TooltipContent>
                            </TooltipTrigger>
                        </Tooltip>
                    )
                )}
            </div>
            <div>
                <UserButton />
            </div>
        </nav>
    )
}