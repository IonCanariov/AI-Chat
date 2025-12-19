// example: src/services/chatService.js
import { pool } from '../db/index.js'; // your pool export

export async function saveMessageAndTokens({ 
  projectId, 
  userId, 
  role, 
  content, 
  tokensInput = 0, 
  tokensOutput = 0, 
  model, 
  cost = 0 
}) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Insert message record
    const insertMsgSql = `
      INSERT INTO messages (project_id, user_id, role, content, tokens_input, tokens_output, model_used)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at;
    `;
    const { rows } = await client.query(insertMsgSql, [
      projectId, 
      userId, 
      role, 
      content, 
      tokensInput, 
      tokensOutput, 
      model
    ]);
    const messageId = rows[0].id;

    // Insert token log record
    const insertTokenSql = `
      INSERT INTO tokens_log (project_id, message_id, user_id, model, tokens_input, tokens_output, cost)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await client.query(insertTokenSql, [
      projectId, 
      messageId, 
      userId, 
      model, 
      tokensInput, 
      tokensOutput, 
      cost
    ]);

    // Update project total tokens
    const updateProjectSql = `
      UPDATE projects
      SET total_tokens = total_tokens + $1
      WHERE id = $2
    `;
    await client.query(updateProjectSql, [
      tokensInput + tokensOutput, 
      projectId
    ]);

    // Commit transaction
    await client.query('COMMIT');

    return { 
      messageId, 
      createdAt: rows[0].created_at 
    };

  } catch (err) {
    // Rollback on any error
    await client.query('ROLLBACK');
    console.error('Transaction failed in saveMessageAndTokens:', err.message);
    throw err;

  } finally {
    // Always release the client back to the pool
    client.release();
  }
}