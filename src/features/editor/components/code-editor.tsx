import { useEffect, useRef } from "react"
import { basicSetup } from "codemirror"
import { EditorView, keymap } from "@codemirror/view"
import { Compartment } from "@codemirror/state"
import { languages } from "@codemirror/language-data"
import { customeTheme } from "../extensions/theme"
import { minimap } from "../extensions/minimap"
import { indentWithTab } from "@codemirror/commands"
import { indentationMarkers } from "@replit/codemirror-indentation-markers"
import { suggestion } from "../extensions/suggestions"

const languageConf = new Compartment()

interface CodeEditorProps {
    fileName: string;
    onChange?: (value: string) => void;
    initialValue?: string;
}

export const CodeEditor = ({ fileName, initialValue=" ", onChange }: CodeEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    async function loadLanguage(view: EditorView, file: string) {
        const extension = file.includes('.') 
            ? file.split('.').pop()?.toLowerCase() 
            : file.toLowerCase();

        const targetLang = languages.find(
            (l) => l.name.toLowerCase() === extension || 
                   l.extensions.includes(extension || "")
        );

        if (targetLang) {
            const support = await targetLang.load(); 
            view.dispatch({
                effects: languageConf.reconfigure(support)
            });
        } else {
            view.dispatch({
                effects: languageConf.reconfigure([])
            });
        }
    }

    useEffect(() => {
        if (!editorRef.current) return;

        const view = new EditorView({
            doc: initialValue,
            parent: editorRef.current,
            extensions: [
                customeTheme,
                basicSetup,
                languageConf.of([]),
                suggestion(fileName),
                keymap.of([indentWithTab]),
                minimap(),
                indentationMarkers(),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged && onChangeRef.current) {
                        onChangeRef.current(update.state.doc.toString());
                    }
                })
            ],
        })
        viewRef.current = view;

        loadLanguage(view, fileName);

        return () => {
            view.destroy();
        };
    }, []);

    useEffect(() => {
        if (viewRef.current) {
            loadLanguage(viewRef.current, fileName);
        }
    }, [fileName]);

    return (
        <div ref={editorRef} className="size-full bg-background"></div>
    )
}