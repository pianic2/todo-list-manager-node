CREATE TABLE IF NOT EXISTS lists (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	description TEXT,
	deleted INTEGER NOT NULL DEFAULT 0,
	deleted_at DATETIME,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS items (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	text TEXT NOT NULL,
	status TEXT CHECK(status IN ('todo', 'done')) DEFAULT 'todo',
	list_id INTEGER NOT NULL,
	deleted INTEGER NOT NULL DEFAULT 0,
	deleted_at DATETIME,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME,
	FOREIGN KEY(list_id) REFERENCES lists(id)
);

INSERT OR IGNORE INTO lists (id, title, description, created_at)
VALUES
	(1, 'Client Work', 'Demo workflow for a small freelance project.', '2026-04-10 09:00:00'),
	(2, 'Learning Roadmap', 'Practical steps for improving the Node.js todo app.', '2026-04-11 10:30:00'),
	(3, 'Portfolio Launch', 'Release checklist for sharing the app publicly.', '2026-04-12 14:15:00');

INSERT OR IGNORE INTO items (id, text, status, list_id, created_at)
VALUES
	(1, 'Review copy for the public demo', 'done', 1, '2026-04-10 09:30:00'),
	(2, 'Prepare read-only production settings', 'done', 1, '2026-04-10 10:10:00'),
	(3, 'Write handoff notes for the next iteration', 'todo', 1, '2026-04-10 11:40:00'),
	(4, 'Add CI coverage for API contracts', 'done', 2, '2026-04-11 11:00:00'),
	(5, 'Document environment variables clearly', 'done', 2, '2026-04-11 12:20:00'),
	(6, 'Sketch a small accessibility pass for the frontend', 'todo', 2, '2026-04-11 15:45:00'),
	(7, 'Seed realistic data for reviewers', 'done', 3, '2026-04-12 14:40:00'),
	(8, 'Deploy the read-only demo on Render', 'todo', 3, '2026-04-12 15:30:00'),
	(9, 'Add project screenshots after the first live deploy', 'todo', 3, '2026-04-12 16:05:00');
