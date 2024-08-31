/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 */
// @ts-ignore
import {WebsocketProvider} from 'y-websocket';
import * as Y from 'yjs';

export function createWebsocketProvider(
  id: string,
  doc: Y.Doc,
): WebsocketProvider {
  return new WebsocketProvider('ws://localhost:1234', id, doc, {
    connect: false,
  });
}

export function getDocFromMap(id: string, yjsDocMap: Map<string, Y.Doc>): Y.Doc {
  let doc = yjsDocMap.get(id);

  if (doc === undefined) {
    doc = new Y.Doc();
    yjsDocMap.set(id, doc);
  } else {
    doc.load();
  }

  return doc;
}
