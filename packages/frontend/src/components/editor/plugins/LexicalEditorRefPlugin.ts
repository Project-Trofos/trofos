import React, { useEffect } from 'react';
import { LexicalEditor } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

/**
 * Set the ref to the current editor instance.
 */
const LexicalEditorRefPlugin = React.forwardRef<LexicalEditor>((props, ref) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (typeof ref === 'function') {
      ref(editor);
    } else if (ref) {
      // eslint-disable-next-line no-param-reassign
      ref.current = editor;
    }
    return () => {
      if (typeof ref !== 'function' && ref) {
        // eslint-disable-next-line no-param-reassign
        ref.current = null;
      }
    };
  }, [editor, ref]);

  return null;
});

export default LexicalEditorRefPlugin;
