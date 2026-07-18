import { create } from "zustand";
import { Id } from "../../../../convex/_generated/dataModel";

interface TabState {
    openTabs: Id<"files">[];
    activeTabId: Id<"files"> | null;
    previewTabId: Id<"files"> | null;
}

const defaultTabState: TabState = {
    openTabs: [],
    activeTabId: null,
    previewTabId: null
};

interface EditorState {
    tabs: Map<Id<"projects">, TabState>;
    getTabsState: (projectId: Id<"projects">) => TabState;
    
    openFile: (
        projectId: Id<"projects">,
        fileId: Id<"files">,
        options: { pinned: boolean }
    ) => void;

    closeTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
    closeAllTabs: (projectId: Id<"projects">) => void;
    setActiveTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
}

export const useEditorStore = create<EditorState>()((set, get) => ({
    tabs: new Map(),
    
    getTabsState: (projectId) => {
        return get().tabs.get(projectId) ?? defaultTabState;
    },

    openFile: (projectId, fileId, { pinned }) => {
        const tabs = new Map(get().tabs); 
        const state = tabs.get(projectId) ?? defaultTabState;
        const { openTabs, previewTabId } = state;
        const isOpen = openTabs.includes(fileId);

        // Case 1: File is not open, and we are opening it as a temporary preview tab
        if (!isOpen && !pinned) {
            const newTabs = previewTabId
                ? openTabs.map((id) => (id === previewTabId ? fileId : id))
                : [...openTabs, fileId];

            tabs.set(projectId, {
                openTabs: newTabs,
                activeTabId: fileId,
                previewTabId: fileId
            });
            set({ tabs });
            return;
        }

        // Case 2: File is not open, and we want to open and pin it instantly
        if (!isOpen && pinned) {
            tabs.set(projectId, {
                ...state,
                openTabs: [...openTabs, fileId],
                activeTabId: fileId,
                previewTabId: null // It's pinned, so it's not the preview tab anymore
            });

            set({ tabs });
            return;
        }

        // Case 3: File is already open, but user might be changing it from preview to pinned
        const shouldPin = pinned && previewTabId === fileId;
        tabs.set(projectId, {
            ...state,
            activeTabId: fileId,
            previewTabId: shouldPin ? null : previewTabId,
        });
        set({ tabs });
    },

    closeTab: (projectId, fileId) => {
        const tabs = new Map(get().tabs); // Fixed the dot notation syntax error here
        const state = tabs.get(projectId) ?? defaultTabState;
        const { openTabs, activeTabId, previewTabId } = state;
        const tabIndex = openTabs.indexOf(fileId);

        if (tabIndex === -1) return;

        const newTabs = openTabs.filter((id) => id !== fileId);

        let newActiveTabId = activeTabId;
        // If we closed the active tab, we need to calculate which tab to highlight next
        if (activeTabId === fileId) {
            if (newTabs.length === 0) {
                newActiveTabId = null;
            } else if (tabIndex >= newTabs.length) {
                newActiveTabId = newTabs[newTabs.length - 1]; // Fixed parenthesis to square brackets
            } else {
                newActiveTabId = newTabs[tabIndex];
            }
        } 
        
        tabs.set(projectId, {
            openTabs: newTabs,
            activeTabId: newActiveTabId,
            previewTabId: previewTabId === fileId ? null : previewTabId,
        });
        set({ tabs });
    },

    closeAllTabs: (projectId) => {
        const tabs = new Map(get().tabs);
        tabs.set(projectId, defaultTabState);
        set({ tabs }); 
    },

    setActiveTab: (projectId, fileId) => {
        const tabs = new Map(get().tabs);
        const state = tabs.get(projectId) ?? defaultTabState;
        tabs.set(projectId, { ...state, activeTabId: fileId });
        set({ tabs });
    }
}));