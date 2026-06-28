// Supabase Vault helpers — all credential storage goes through here.
// Credentials are encrypted with pgsodium (AES-256-GCM) inside the database;
// they never travel through the application layer as plaintext.

import { supabaseService } from './supabase/service';

/**
 * Stores integration credentials in Supabase Vault.
 * Returns the vault secret UUID — store this in dealer_integrations.vault_secret_id.
 */
export async function storeCredential(
  dealerId:    string,
  partnerId:   string,
  credentials: Record<string, string>,
): Promise<string> {
  const secretName = `cred_${dealerId}_${partnerId}`;

  const { data, error } = await supabaseService.rpc('upsert_vault_secret', {
    p_name:    secretName,
    p_secret:  JSON.stringify(credentials),
    p_description: `Integration credentials for dealer ${dealerId}, partner ${partnerId}`,
  });

  if (error) throw new Error(`Vault write failed: ${error.message}`);
  return data as string; // returns the vault secret UUID
}

/**
 * Deletes an integration credential from Vault.
 */
export async function deleteCredential(vaultSecretId: string): Promise<void> {
  const { error } = await supabaseService.rpc('delete_vault_secret', {
    p_secret_id: vaultSecretId,
  });
  if (error) throw new Error(`Vault delete failed: ${error.message}`);
}

/**
 * Reads integration credentials from Vault (server-side only, never sent to browser).
 */
export async function readCredential(
  vaultSecretId: string,
): Promise<Record<string, string>> {
  const { data, error } = await supabaseService.rpc('read_vault_secret', {
    p_secret_id: vaultSecretId,
  });
  if (error) throw new Error(`Vault read failed: ${error.message}`);
  return JSON.parse(data as string) as Record<string, string>;
}
