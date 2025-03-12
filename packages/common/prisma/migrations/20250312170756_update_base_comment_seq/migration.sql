-- Update Auto-Increment for BaseComment.comment_id
DO $$ 
DECLARE 
    max_comment_id INT;
BEGIN
    -- Get the maximum comment_id from BaseComment
    SELECT MAX(comment_id) INTO max_comment_id FROM "BaseComment";
    
    -- Set the auto-increment sequence to max_comment_id + 1
    IF max_comment_id IS NOT NULL THEN
        PERFORM setval(pg_get_serial_sequence('"BaseComment"', 'comment_id'), max_comment_id);
    END IF;
END $$;
