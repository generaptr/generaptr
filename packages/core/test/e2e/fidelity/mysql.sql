-- One table feature per object. The fidelity test rebuilds this schema from the generated Drizzle schema.

CREATE TABLE authors (
  id int NOT NULL AUTO_INCREMENT,
  email varchar(100) NOT NULL,
  handle varchar(50),
  PRIMARY KEY (id),
  CONSTRAINT authors_email_key UNIQUE (email),
  CONSTRAINT authors_handle_key UNIQUE (handle)
);

-- Foreign keys with actions, a composite unique constraint as a foreign key target.
CREATE TABLE posts (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  author_id int NOT NULL,
  editor_id int,
  slug varchar(100) NOT NULL,
  CONSTRAINT posts_author_slug_key UNIQUE (author_id, slug),
  CONSTRAINT posts_author_fk FOREIGN KEY (author_id) REFERENCES authors (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT posts_editor_fk FOREIGN KEY (editor_id) REFERENCES authors (id) ON DELETE SET NULL
);

-- Composite foreign key.
CREATE TABLE editions (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  post_author int NOT NULL,
  post_slug varchar(100) NOT NULL,
  CONSTRAINT editions_post_fk FOREIGN KEY (post_author, post_slug) REFERENCES posts (author_id, slug)
);

-- Composite primary key.
CREATE TABLE post_tags (
  post_id int NOT NULL,
  name varchar(50) NOT NULL,
  PRIMARY KEY (post_id, name),
  CONSTRAINT post_tags_post_fk FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
);

-- Foreign key to its own table.
CREATE TABLE nodes (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  parent_id int,
  CONSTRAINT nodes_parent_fk FOREIGN KEY (parent_id) REFERENCES nodes (id) ON DELETE SET NULL
);

-- No keys at all.
CREATE TABLE audit_log (
  message text NOT NULL,
  at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CHECK constraints: one column, two columns, a list of values.
CREATE TABLE prices (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  amount decimal(10,2) NOT NULL,
  discount decimal(10,2),
  currency varchar(3) NOT NULL,
  CONSTRAINT prices_amount_positive CHECK (amount > 0),
  CONSTRAINT prices_discount_below_amount CHECK (discount IS NULL OR discount < amount),
  CONSTRAINT prices_currency_known CHECK (currency IN ('EUR', 'USD', 'it''s'))
);
