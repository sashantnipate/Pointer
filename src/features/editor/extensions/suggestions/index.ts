import { StateEffect, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate, WidgetType, keymap } from "@codemirror/view";
import { getAutocompleteSuggestion } from "../../actions/suggestion"; 

const setSuggestionEffect = StateEffect.define<string | null>();

const suggestionState = StateField.define<string | null>({
    create() {
        return null;
    },
    update(value, transaction) {
        // Clear suggestions automatically if the text contents change
        if (transaction.docChanged) {
            return null;
        }
        for (const effect of transaction.effects) {
            if (effect.is(setSuggestionEffect)) {
                return effect.value;
            }
        }
        return value;
    }
});

class SuggestionWidget extends WidgetType {
    constructor(readonly text: string) {
        super();
    }

    toDOM() {
        const span = document.createElement("span");
        span.textContent = this.text;
        
        // Clean VS Code light-theme styling metrics
        span.style.color = "#a0a0a0";      
        span.style.opacity = "0.8";        
        span.style.fontStyle = "normal";
        span.style.pointerEvents = "none";
        span.style.marginLeft = "2px";
        
        return span;
    }
}

const renderPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;
        constructor(view: EditorView) {
            this.decorations = this.build(view);
        }

        update(update: ViewUpdate) {
            const suggestionChanged = update.transactions.some((transaction) => {
                return transaction.effects.some((effect) => effect.is(setSuggestionEffect));
            });

            if (update.docChanged || update.selectionSet || suggestionChanged) {
                this.decorations = this.build(update.view);
            }
        }

        build(view: EditorView) {
            const suggestion = view.state.field(suggestionState);
            if (!suggestion) {
                return Decoration.none;
            }
            const cursor = view.state.selection.main.head;
            return Decoration.set([
                Decoration.widget({
                    widget: new SuggestionWidget(suggestion),
                    side: 1, 
                }).range(cursor)
            ]);
        }
    },
    { decorations: (plugin) => plugin.decorations }
);

export const acceptSuggestionKeymap = keymap.of([
    {
        key: "Tab",
        run: (view) => {
            const suggestion = view.state.field(suggestionState);
            if (!suggestion) {
                return false;
            }

            const cursor = view.state.selection.main.head;
            view.dispatch({
                changes: { from: cursor, insert: suggestion },
                selection: { anchor: cursor + suggestion.length },
                effects: setSuggestionEffect.of(null),
            });
            return true;
        }
    }
]);

// Global reference prevents multi-render context scoping leaks
let autocompleteDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_DELAY = 450; 

const createAutocompleteListener = (fileName: string) => {
    return EditorView.updateListener.of((update: ViewUpdate) => {
        if (!update.docChanged) return;

        // Correctly interrupt the previous keystroke pipeline thread
        if (autocompleteDebounceTimer) {
            clearTimeout(autocompleteDebounceTimer);
        }

        const view = update.view;
        const state = view.state;
        const selection = state.selection.main;

        if (!selection.empty) return; 

        const cursor = selection.head;
        const currentLineObj = state.doc.lineAt(cursor);
        
        // Performance Guard: Don't call backend actions for empty lines
        if (!currentLineObj.text.trim()) return;

        autocompleteDebounceTimer = setTimeout(async () => {
            const fullCode = state.doc.toString();
            const textBeforeCursor = currentLineObj.text.slice(0, cursor - currentLineObj.from);
            const textAfterCursor = currentLineObj.text.slice(cursor - currentLineObj.from);
            const currentLineNumber = currentLineObj.number;
            const totalLines = state.doc.lines;

            let previousLines = "";
            let nextLines = "";

            const startPrev = Math.max(1, currentLineNumber - 5);
            if (startPrev < currentLineNumber) {
                previousLines = state.doc.sliceString(state.doc.line(startPrev).from, currentLineObj.from - 1);
            }

            const endNext = Math.min(totalLines, currentLineNumber + 5);
            if (endNext > currentLineNumber) {
                nextLines = state.doc.sliceString(currentLineObj.to + 1, state.doc.line(endNext).to);
            }

            console.log("Autocomplete Triggering fetch for line:", currentLineNumber, "text:", textBeforeCursor);

            try {
                const suggestion = await getAutocompleteSuggestion({
                    fileName,
                    previousLines,
                    lineNumber: currentLineNumber,
                    currentLine: currentLineObj.text,
                    textBeforeCursor,
                    textAfterCursor,
                    nextLines,
                    code: fullCode
                });

                console.log("Autocomplete Server response received:", JSON.stringify(suggestion));

                if (!suggestion) {
                    console.log("Autocomplete Empty or no suggestion needed based on AI rules.");
                    return;
                }

                // Verify the user hasn't continued typing during the network trip
                if (view.state.selection.main.head !== cursor) {
                    console.log("Autocomplete Aborted dispatch: User typed over response window.");
                    return;
                }

                console.log("Autocomplete Dispatching suggestion effect to view...");
                view.dispatch({
                    effects: setSuggestionEffect.of(suggestion)
                });
                
            } catch (error) {
                console.error("Autocomplete Failed execution:", error);
            }
        }, DEBOUNCE_DELAY);
    });
};

export const suggestion = (fileName: string) => {
    return [
        suggestionState,
        renderPlugin,
        acceptSuggestionKeymap,
        createAutocompleteListener(fileName)
    ];
};