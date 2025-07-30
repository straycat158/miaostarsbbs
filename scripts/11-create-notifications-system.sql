-- 创建通知表
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('reply', 'mention', 'thread_update')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  related_id UUID, -- 可以是 post_id 或其他相关ID
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_thread_id ON notifications(thread_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 创建标记通知为已读的函数
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications 
  SET is_read = TRUE, updated_at = NOW()
  WHERE id = notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建批量标记通知为已读的函数
CREATE OR REPLACE FUNCTION mark_notifications_as_read(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications 
  SET is_read = TRUE, updated_at = NOW()
  WHERE notifications.user_id = mark_notifications_as_read.user_id AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建通知函数
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_sender_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_thread_id UUID DEFAULT NULL,
  p_related_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- 不要给自己发通知
  IF p_user_id = p_sender_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO notifications (user_id, sender_id, type, title, message, thread_id, related_id)
  VALUES (p_user_id, p_sender_id, p_type, p_title, p_message, p_thread_id, p_related_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建回复通知触发器函数
CREATE OR REPLACE FUNCTION notify_thread_reply()
RETURNS TRIGGER AS $$
DECLARE
  thread_author_id UUID;
  thread_title TEXT;
  sender_username TEXT;
BEGIN
  -- 获取主题作者ID和标题
  SELECT created_by, title INTO thread_author_id, thread_title
  FROM threads WHERE id = NEW.thread_id;
  
  -- 获取发送者用户名
  SELECT username INTO sender_username
  FROM profiles WHERE id = NEW.created_by;
  
  -- 给主题作者发送回复通知
  IF thread_author_id IS NOT NULL AND thread_author_id != NEW.created_by THEN
    PERFORM create_notification(
      thread_author_id,
      NEW.created_by,
      'reply',
      '您的主题有新回复',
      sender_username || ' 回复了您的主题: ' || thread_title,
      NEW.thread_id,
      NEW.id
    );
  END IF;
  
  -- 给参与讨论的其他用户发送主题更新通知
  INSERT INTO notifications (user_id, sender_id, type, title, message, thread_id, related_id)
  SELECT DISTINCT 
    p.created_by,
    NEW.created_by,
    'thread_update',
    '讨论有新动态',
    sender_username || ' 在 "' || thread_title || '" 中发表了新回复',
    NEW.thread_id,
    NEW.id
  FROM posts p
  WHERE p.thread_id = NEW.thread_id 
    AND p.created_by != NEW.created_by 
    AND p.created_by != thread_author_id
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.user_id = p.created_by 
        AND n.thread_id = NEW.thread_id 
        AND n.type = 'thread_update'
        AND n.created_at > NOW() - INTERVAL '1 hour'
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建提及通知触发器函数
CREATE OR REPLACE FUNCTION notify_mentions()
RETURNS TRIGGER AS $$
DECLARE
  mentioned_user_id UUID;
  mentioned_username TEXT;
  sender_username TEXT;
  thread_title TEXT;
  mention_pattern TEXT;
  mentions TEXT[];
BEGIN
  -- 获取发送者用户名和主题标题
  SELECT username INTO sender_username FROM profiles WHERE id = NEW.created_by;
  SELECT title INTO thread_title FROM threads WHERE id = NEW.thread_id;
  
  -- 提取所有@提及的用户名
  SELECT ARRAY(
    SELECT DISTINCT substring(m[1] FROM 2)
    FROM regexp_matches(NEW.content, '@([a-zA-Z0-9_]+)', 'g') AS m
  ) INTO mentions;
  
  -- 为每个被提及的用户创建通知
  FOREACH mentioned_username IN ARRAY mentions
  LOOP
    -- 查找被提及的用户ID
    SELECT id INTO mentioned_user_id 
    FROM profiles 
    WHERE username = mentioned_username;
    
    -- 如果用户存在且不是自己，创建提及通知
    IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.created_by THEN
      PERFORM create_notification(
        mentioned_user_id,
        NEW.created_by,
        'mention',
        '有人提到了您',
        sender_username || ' 在 "' || thread_title || '" 中提到了您',
        NEW.thread_id,
        NEW.id
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS trigger_notify_thread_reply ON posts;
CREATE TRIGGER trigger_notify_thread_reply
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_thread_reply();

DROP TRIGGER IF EXISTS trigger_notify_mentions ON posts;
CREATE TRIGGER trigger_notify_mentions
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_mentions();

-- 启用RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
