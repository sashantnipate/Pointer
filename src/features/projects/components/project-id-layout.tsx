"use client"

import { Id } from "../../../../convex/_generated/dataModel"
import { Navbar } from "./navbar"
import { Allotment } from "allotment";
import "allotment/dist/style.css";

export const ProjectIdLayout = ({
    children,
    projectId
}:{
    children:React.ReactNode,
    projectId: Id<"projects">
}) => {
    return(
        <div className="w-full h-screen flex flex-col">
            <Navbar projectId ={projectId}/>
            <Allotment
                defaultSizes={[100,350]} 
            >
            <Allotment.Pane
                snap 
            >
                Component A
            </Allotment.Pane>
            <Allotment.Pane snap>
            {children}
            </Allotment.Pane>
            </Allotment>
        </div>
    )
}