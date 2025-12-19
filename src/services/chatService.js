// src/services/chatService.js
import { pool } from '../db/index.js';

/**
 * Save user message and token logs with idempotency support
 * 
 * IMPORTANT: userId must come from authentication context (session/JWT/middleware),
 * NOT from request body. The caller is responsible for extracting userId from auth.
 * 
 * Idempotency: If a message with the same (client_message_id, project_id, user_id) 
 * already exists, the database will raise a unique constraint violation (23505).
 * In that case, we fetch and return the existing message instead of failing.
 * 
 * @param {Object} params
 * @param {string} params.projectId - Project ID
 * @param {string} params.userId - User ID from auth context (NOT from request body)
 * @param {string} params.role - Message role ('user' | 'assistant' | 'system' | 'agent')
 * @param {string} params.content - Message content
 * @param {number} params.tokensInput - Input tokens used
 * @param {number} params.tokensOutput - Output tokens used
 * @param {string} params.model - Model used (e.g., 'gpt-4')
 * @param {number} params.cost - Cost in USD
 * @param {string} [params.clientMessageId] - Client-generated UUID for idempotency (required for user messages)
 * @param {Object} [params.metadata] - Additional metadata
 * 
 * @returns {Promise<{messageId: string, createdAt: Date, isDuplicate: boolean}>}
 */
export async function saveMessageAndTokens({ 
  projectId, 
  userId, 
  role, 
  content, 
  tokensInput = 0, 
  tokensOutput = 0, 
  model, 
  cost = 0,
  clientMessageId = null,
  metadata = {}
}) {
  const client = await pool.connect();
  let clientReleased = false; // Track if we already released the client
  
  try {
    await client.query('BEGIN');

    // Build complete metadata
    const completeMetadata = {
      ...metadata,
      ...(clientMessageId && { client_message_id: clientMessageId }),
      model_used: model
    };

    // Insert message record
    const insertMsgSql = `
      INSERT INTO messages (project_id, user_id, role, content, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at;
    `;
    const { rows } = await client.query(insertMsgSql, [
      projectId, 
      role === 'user' ? userId : null, // Enforce: user messages have user_id, others don't
      role, 
      content, 
      JSON.stringify(completeMetadata)
    ]);
    const messageId = rows[0].id;

    // Insert token log record
    const insertTokenSql = `
      INSERT INTO tokens_log (project_id, message_id, user_id, model, tokens_input, tokens_output, total_tokens)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await client.query(insertTokenSql, [
      projectId, 
      messageId, 
      userId, 
      model, 
      tokensInput, 
      tokensOutput, 
      tokensInput + tokensOutput
    ]);

    // Update project total tokens
    const updateProjectSql = `
      UPDATE projects
      SET total_tokens_used = total_tokens_used + $1
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
      createdAt: rows[0].created_at,
      isDuplicate: false
    };

  } catch (err) {
    // Rollback on any error
    await client.query('ROLLBACK');
    
    // IDEMPOTENCY HANDLING:
    // PostgreSQL error 23505 = unique constraint violation
    // If it's from our idempotency index, this is a duplicate request (not an error!)
    // We treat this as success and return the existing message.
    if (err.code === '23505' && err.constraint === 'idx_messages_client_id_idempotency') {
      console.info('Duplicate message detected via constraint - returning existing message', {
        clientMessageId,
        projectId,
        userId
      });
      
      // Release the failed transaction's client immediately
      // Do NOT reuse a client that has just failed a transaction
      client.release();
      clientReleased = true;
      
      // Fetch the existing message using a fresh connection (pool.query)
      // This is a non-transactional query outside the failed transaction
      const fetchSql = `
        SELECT id, created_at 
        FROM messages 
        WHERE metadata->>'client_message_id' = $1 
          AND project_id = $2 
          AND user_id = $3
        LIMIT 1;
      `;
      const fetchResult = await pool.query(fetchSql, [clientMessageId, projectId, userId]);
      
      if (fetchResult.rows.length === 0) {
        // This should never happen, but handle gracefully
        console.error('Constraint violation but message not found - possible race condition');
        throw new Error('Duplicate detection failed - message not found');
      }
      
      // Return the existing message as a successful response
      return {
        messageId: fetchResult.rows[0].id,
        createdAt: fetchResult.rows[0].created_at,
        isDuplicate: true
      };
    }
    
    // For all other errors, log and re-throw
    console.error('Transaction failed in saveMessageAndTokens:', err.message);
    throw err;

  } finally {
    // Always release the client back to the pool (unless already released)
    if (!clientReleased) {
      client.release();
    }
  }
}