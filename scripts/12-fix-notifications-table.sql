-- 检查并添加缺失的列到 notifications 表
DO $$ 
BEGIN
    -- 检查 sender_id 列是否存在，如果不存在则添加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'sender_id') THEN
        ALTER TABLE notifications ADD COLUMN sender_id UUID REFERENCES profiles(id);
    END IF;
    
    -- 检查 thread_id 列是否存在，如果不存在则添加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'thread_id') THEN
        ALTER TABLE notifications ADD COLUMN thread_id UUID REFERENCES threads(id);
    END IF;
    
    -- 检查 post_id 列是否存在，如果不存在则添加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'post_id') THEN
        ALTER TABLE notifications ADD COLUMN post_id UUID REFERENCES posts(id);
    END IF;
END $$;

-- 创建通知触发器函数
CREATE OR REPLACE FUNCTION create_reply_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- 为主题作者创建回复通知（如果回复者不是作者本人）
    INSERT INTO notifications (user_id, sender_id, type, title, message, thread_id, post_id, related_id)
    SELECT 
        t.created_by,
        NEW.created_by,
        'reply',
        '您的主题有新回复',
        '用户 ' || p.username || ' 回复了您的主题: ' || t.title,
        NEW.thread_id,
        NEW.id,
        NEW.thread_id
    FROM threads t
    JOIN profiles p ON p.id = NEW.created_by
    WHERE t.id = NEW.thread_id 
    AND t.created_by != NEW.created_by;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建@提及通知函数
CREATE OR REPLACE FUNCTION create_mention_notification(
    mentioned_username TEXT,
    post_id UUID,
    thread_id UUID,
    sender_id UUID
)
RETURNS VOID AS $$
DECLARE
    mentioned_user_id UUID;
    sender_username TEXT;
    thread_title TEXT;
BEGIN
    -- 获取被提及用户的ID
    SELECT id INTO mentioned_user_id
    FROM profiles
    WHERE username = mentioned_username;
    
    -- 如果用户存在且不是发送者本人
    IF mentioned_user_id IS NOT NULL AND mentioned_user_id != sender_id THEN
        -- 获取发送者用户名和主题标题
        SELECT username INTO sender_username FROM profiles WHERE id = sender_id;
        SELECT title INTO thread_title FROM threads WHERE id = thread_id;
        
        -- 创建提及通知
        INSERT INTO notifications (user_id, sender_id, type, title, message, thread_id, post_id, related_id)
        VALUES (
            mentioned_user_id,
            sender_id,
            'mention',
            '有人提及了您',
            '用户 ' || sender_username || ' 在主题 "' || thread_title || '" 中提及了您',
            thread_id,
            post_id,
            thread_id
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 删除现有触发器（如果存在）
DROP TRIGGER IF EXISTS reply_notification_trigger ON posts;

-- 创建回复通知触发器
CREATE TRIGGER reply_notification_trigger
    AFTER INSERT ON posts
    FOR EACH ROW
    EXECUTE FUNCTION create_reply_notification();

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_thread_id ON notifications(thread_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- 启用行级安全策略
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);
