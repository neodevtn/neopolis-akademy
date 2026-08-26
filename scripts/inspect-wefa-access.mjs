import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
try {
  const [rows] = await connection.execute(
    `SELECT u.id AS user_id, u.name, u.email, u.role, u.blocked,
      g.id AS group_id, g.name AS group_name, g.active AS group_active,
      gc.courseId AS course_id, gc.certificationId AS certification_id
     FROM users u
     LEFT JOIN learner_group_memberships gm ON gm.userId = u.id
     LEFT JOIN learner_groups g ON g.id = gm.groupId
     LEFT JOIN learner_group_courses gc ON gc.groupId = g.id
     WHERE LOWER(COALESCE(u.name, '')) LIKE ?
        OR LOWER(COALESCE(u.name, '')) LIKE ?
        OR LOWER(COALESCE(u.name, '')) LIKE ?
        OR LOWER(COALESCE(u.email, '')) LIKE ?
     ORDER BY g.name, gc.courseId`,
    ["%wefa%", "%naou%", "%we%", "%wefa%"],
  );
  console.table(rows);
  const [summary] = await connection.execute(
    `SELECT COUNT(*) AS active_users_without_group
     FROM users u
     LEFT JOIN learner_group_memberships gm ON gm.userId = u.id
     WHERE u.blocked = 0 AND gm.id IS NULL`,
  );
  console.table(summary);
  const [fullAccessSummary] = await connection.execute(
    `SELECT COUNT(*) AS active_users_without_full_access
     FROM users u
     JOIN learner_groups g ON g.isSystem = 1 AND g.active = 1
     LEFT JOIN learner_group_memberships gm ON gm.userId = u.id AND gm.groupId = g.id
     WHERE u.blocked = 0 AND gm.id IS NULL`,
  );
  console.table(fullAccessSummary);
  const [activity] = await connection.execute(
    `SELECT l.actionType, l.metadata, l.createdAt
     FROM learner_activity_log l
     JOIN users u ON u.id = l.userId
     WHERE u.email = ? AND l.actionType = 'learner_group_full_access_assigned'
     ORDER BY l.createdAt DESC
     LIMIT 5`,
    ["wafa.nawech@gmail.com"],
  );
  console.table(activity);
} finally {
  await connection.end();
}
