/* eslint-disable @typescript-eslint/no-unused-vars */
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { CollaborationPlugin } from "@lexical/react/LexicalCollaborationPlugin";
import * as Y from "yjs";
import { type Provider } from "@lexical/yjs";
import { HocuspocusProvider, HocuspocusProviderWebsocket } from "@hocuspocus/provider";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

export default function Editor({ docId }: { docId: string }) {
  return (
    <LexicalComposer
      initialConfig={{
        editorState: null,
        namespace: "test",
        onError: (error: Error) => console.log(error),
      }}
    >
      <PlainTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={<div>Enter some text...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <ListenerPlugin />
      <CollaborationPlugin
        id={docId}
        providerFactory={createWebsocketProvider}
        shouldBootstrap={false}
      />
    </LexicalComposer>
  );
}

function ListenerPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerTextContentListener(() =>
      console.log("content changed")
    );
  }, [editor]);

  return null;
}

const socket = new HocuspocusProviderWebsocket({
  url: `ws://localhost:3000/api/ws/collaboration`,
  connect: false,
});

function createWebsocketProvider(
  id: string,
  yjsDocMap: Map<string, Y.Doc>
): Provider {
  const doc = new Y.Doc();
  yjsDocMap.set(id, doc);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new HocuspocusProvider({
    websocketProvider: socket,
    name: `test-${id}`,
    document: doc,
    onSynced: () => {
      console.log("synced");
    },
  });
}
