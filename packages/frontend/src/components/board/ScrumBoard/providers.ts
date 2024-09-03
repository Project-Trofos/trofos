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
  const authToken = 'eyJhbGciOiJFUzM4NCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJteS1leHByZXNzLWFwcCIsImV4cCI6MTcyNTI2NDk4ODI4OCwieXVzZXJpZCI6InVzZXIxIn0.bNie2ZZehp30nFqG0tscK5DgkwKiF2WRB80fcBuqKI5mo3ssolr3gzGk5wgvcfvBHZlwyBMiLRfwnUm1S12w_YZAgzxwoCqsCwUQCYpe5Cgsz2vq9nu2IT7OXLT1k-9r';
  return new WebsocketProvider('ws://localhost:3002', 'y-redis-demo-app-1', doc, { params: { yauth: authToken } });
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
