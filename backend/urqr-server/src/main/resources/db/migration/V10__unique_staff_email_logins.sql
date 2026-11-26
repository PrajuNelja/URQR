-- New staff accounts use email addresses as login usernames. Existing legacy usernames
-- without an @ sign remain valid for backward compatibility, but new API-created accounts
-- are validated as email addresses and this index enforces global, case-insensitive uniqueness.
ALTER TABLE staff_user ALTER COLUMN username TYPE VARCHAR(254);

CREATE UNIQUE INDEX uq_staff_user_email_login_global
    ON staff_user (lower(username))
    WHERE position('@' IN username) > 0;
