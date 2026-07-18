import { EditorView } from "codemirror";

export const customeTheme = EditorView.theme({
    "&":{
        outline: "none !important",
        height: "100%"
    },
    ".cm-content":{
        fontFamily: "var(--font-geist-mono), monospace",
        fontSize: "14px"
    },  
    ".cm-scroller": {
        scrollbarWidth: "thin",
        scrollbarColor: "#3f3f16 transparent"
    },
    ".cm-minimap-container": {
        width: "80px !important",
    }
})