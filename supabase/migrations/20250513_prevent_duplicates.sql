-- Add unique constraint to referrals table to prevent duplicate referrals
ALTER TABLE referrals
ADD CONSTRAINT unique_referral_pair UNIQUE (referrer_id, referred_id);

-- Add unique constraint to tasks table to prevent duplicate tasks for a user
ALTER TABLE tasks
ADD CONSTRAINT unique_user_task UNIQUE (user_id, task_type);

-- Create function to check if a task already exists before creating a new one
CREATE OR REPLACE FUNCTION check_duplicate_task()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a task of the same type already exists for this user
  IF EXISTS (
    SELECT 1 FROM tasks 
    WHERE user_id = NEW.user_id 
    AND task_type = NEW.task_type 
    AND is_completed = false
  ) THEN
    RAISE EXCEPTION 'Task of type % already exists for user', NEW.task_type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent duplicate active tasks
CREATE TRIGGER prevent_duplicate_tasks
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION check_duplicate_task();

-- Create function to check if a referral already exists
CREATE OR REPLACE FUNCTION check_duplicate_referral()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a referral already exists between these users
  IF EXISTS (
    SELECT 1 FROM referrals 
    WHERE referrer_id = NEW.referrer_id 
    AND referred_id = NEW.referred_id
  ) THEN
    RAISE EXCEPTION 'Referral already exists between these users';
  END IF;
  
  -- Check if the referred user has already been referred by someone else
  IF EXISTS (
    SELECT 1 FROM referrals 
    WHERE referred_id = NEW.referred_id
  ) THEN
    RAISE EXCEPTION 'User has already been referred by someone else';
  END IF;
  
  -- Prevent self-referrals
  IF NEW.referrer_id = NEW.referred_id THEN
    RAISE EXCEPTION 'Cannot refer yourself';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent duplicate referrals
CREATE TRIGGER prevent_duplicate_referrals
  BEFORE INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION check_duplicate_referral();
