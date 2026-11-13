-- One table feature per object. The fidelity test rebuilds this schema from the generated Drizzle schema.

-- Primary key with its own name.
CREATE TABLE authors (
  id serial,
  email varchar(100) NOT NULL,
  handle text,
  CONSTRAINT authors_pk PRIMARY KEY (id),
  CONSTRAINT authors_email_key UNIQUE (email),
  CONSTRAINT authors_handle_key UNIQUE NULLS NOT DISTINCT (handle)
);

-- Foreign keys with actions, a composite unique constraint as a foreign key target.
CREATE TABLE posts (
  id serial PRIMARY KEY,
  author_id integer NOT NULL,
  editor_id integer,
  slug text NOT NULL,
  CONSTRAINT posts_author_fk FOREIGN KEY (author_id) REFERENCES authors (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT posts_editor_fk FOREIGN KEY (editor_id) REFERENCES authors (id) ON DELETE SET NULL,
  CONSTRAINT posts_author_slug_key UNIQUE (author_id, slug)
);

-- Composite foreign key.
CREATE TABLE editions (
  id serial PRIMARY KEY,
  post_author integer NOT NULL,
  post_slug text NOT NULL,
  CONSTRAINT editions_post_fk FOREIGN KEY (post_author, post_slug) REFERENCES posts (author_id, slug)
);

-- Composite primary key.
CREATE TABLE post_tags (
  post_id integer NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  name text NOT NULL,
  PRIMARY KEY (post_id, name)
);

-- Foreign key to its own table.
CREATE TABLE nodes (
  id serial PRIMARY KEY,
  parent_id integer,
  CONSTRAINT nodes_parent_fk FOREIGN KEY (parent_id) REFERENCES nodes (id) ON DELETE SET DEFAULT
);

-- No keys at all.
CREATE TABLE audit_log (
  message text NOT NULL,
  at timestamptz NOT NULL DEFAULT now()
);

-- CHECK constraints: one column, two columns, a list of values.
CREATE TABLE prices (
  id serial PRIMARY KEY,
  amount numeric(10,2) NOT NULL,
  discount numeric(10,2),
  currency text NOT NULL,
  CONSTRAINT prices_amount_positive CHECK (amount > 0),
  CONSTRAINT prices_discount_below_amount CHECK (discount IS NULL OR discount < amount),
  CONSTRAINT prices_currency_known CHECK (currency = ANY (ARRAY['EUR', 'USD', 'it''s']))
);
