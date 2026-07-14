import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const useProjects = () => {
    return useQuery(api.projects.get);
};

export const useProject = (projectId:Id<"projects">) => {
    return useQuery(api.projects.getById, {Id: projectId});
}

export const useProjectsPartial = (limit: number) => {
    return useQuery(api.projects.getPartial, {limit, });
};

export const useCreateProject = () => {
    return useMutation(api.projects.create).withOptimisticUpdate(
        (localStorage, args) => {
            const existingProjects = localStorage.getQuery(api.projects.get);

            if (existingProjects !== undefined) {
                const now = Date.now();
                const newProject = {
                    _id: crypto.randomUUID() as Id<"projects">,
                    _creationTime: now,
                    name: args.name,
                    ownerId: "anonymous",
                    updatedAt: now,
                };

                localStorage.setQuery(api.projects.get, {}, [
                    newProject,
                    ...existingProjects
                ])
            }
        }
    );
}

export const useRenameProject = () => {
    return useMutation(api.projects.rename);
}

export const useDeleteProject = () => {
    return useMutation(api.projects.deleteProject);
}