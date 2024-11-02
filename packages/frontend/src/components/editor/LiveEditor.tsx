import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";

export default function LiveEditor({
  key
}: {
  key: string;
}) {
  return (
    <LexicalComposer
      key={key}
      initialConfig={{
        editorState: null,
        namespace: "test",
        onError: (error) => { console.error(error); }
      }}
    >
      <PlainTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={<div>Enter some text...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <CollaborationPlugin
        id={key}
        providerFactory={createWebsocketProvider}
        shouldBootstrap={true}
      />
    </LexicalComposer>
);
}

function createWebsocketProvider(
  id: string,
  yjsDocMap: Map<string, Y.Doc>
) {
  const doc = new Y.Doc();
  yjsDocMap.set(id, doc);

// @TODO: REPLACE APP ID
// @TODO: PUT PROPER TOKEN
// @TODO: OR USE `HocuspocusProvider` with Hocuspocus URL
  const hocuspocusProvider = new HocuspocusProvider({
    url: "ws://localhost:3000/api/ws/collaboration",
    name: "example-document",
  });

  return hocuspocusProvider;
}
