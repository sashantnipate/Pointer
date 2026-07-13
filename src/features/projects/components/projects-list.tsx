import { Spinner } from "@/components/ui/spinner";
import { useDeleteProject, useProjects, useProjectsPartial } from "../hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Doc } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AlertCircleIcon, ArrowRightIcon, DeleteIcon, GlobeIcon, Loader2Icon, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FaGithub } from "react-icons/fa";
import { ProjectCommadDialog } from "./projects-commad-dialoges";

const formatTimestamp = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), {addSuffix: true})
}

const getProjectIcon = (project: Doc<"projects">) => {
    if(project.importStatus == "completed"){
        return <FaGithub />
    }
    if(project.importStatus == "failed"){
        return <AlertCircleIcon/>
    }
    if(project.importStatus == "importing"){
        return <Loader2Icon/>
    }
    return <GlobeIcon/>
}
interface ProjectsListProps {
    onViewAll : () => void;
}

const ContinueCard = ({ data }: { data: Doc<"projects"> }) => {
    return(
        <div className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">
                Last Updated
            </span>
            <Button
                variant="outline"
                className="h-auto p-4 bg-background border rounded-none w-full"
            >
                <Link href={`projects/${data._id}`} className="group flex flex-col gap-4 w-full text-left items-start">
                    <div className="flex items-center gap-2 w-full">
                        {getProjectIcon(data)}
                        <span className="font-medium truncate">
                            {data.name}
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        last updated  
                        {"   "}{formatDistanceToNow(data.updatedAt)}
                    </span>
                </Link>
                    <ArrowRightIcon className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0 items-end"/>
            </Button>
        </div>
    )
}


const ProjectItem = ({ data }: { data: Doc<"projects"> }) => {
    const deleteProject = useDeleteProject();

    const handleDelete = async (e: MouseEvent) => {
        e.preventDefault();  
        e.stopPropagation(); 
        
        try {
            await deleteProject({ projectId: data._id }); 
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Link href={`/projects/${data._id}`}>
            <div className="p-1 relative flex items-center group">
                <Button
                    variant="outline" 
                    className="w-full rounded-none p-6 gap-3 justify-start pr-12" 
                >
                    {getProjectIcon(data)}
                    <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{data.name}</span>
                        <span className="text-xs text-muted-foreground ml-4">
                            {formatTimestamp(data.updatedAt)}
                        </span> 
                    </div>     
                </Button>
                <Trash 
                    className="absolute right-4 cursor-pointer hover:text-destructive transition text-muted-foreground size-5"
                    onClick={handleDelete}
                />
            </div>
        </Link>
    );
};

export const ProjectsList = ({
    onViewAll
}: ProjectsListProps) => {

    const projects = useProjectsPartial(6);
    if (projects === undefined ){
        return <Spinner className="size-4 text-ring"/>
    }
    const [mostRecent, ...rest] = projects;
    return (
        <div className="flex flex-col gap-4">
            {mostRecent ? <ContinueCard data={mostRecent}/>: null}
            {rest.length > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                            Recent Projects
                        </span>

                        <Button variant="outline" className="text-xs text-muted-foreground rounded-none"
                        onClick={onViewAll}
                        >
                                View All                      
                        </Button>
                    </div>
                    <div className="flex flex-col">
                        {rest.map((project)=> (
                            <ProjectItem
                                key = {project._id}
                                data = {project}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}