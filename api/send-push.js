import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  const token = authHeader.split(' ')[1];

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Supabase environment variables are missing on the server' });
  }
  if (!vapidPublicKey || !vapidPrivateKey) {
    // Push isn't configured yet - fail quietly, this must never break chat sending.
    return res.status(200).json({ skipped: true, reason: 'VAPID keys not configured' });
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid user token: ' + (userError?.message || 'User not found') });
  }

  const { receiverId, senderName, messageText } = req.body || {};
  if (!receiverId || !messageText) {
    return res.status(400).json({ error: 'receiverId and messageText are required' });
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  webpush.setVapidDetails('mailto:support@foundaxia.com', vapidPublicKey, vapidPrivateKey);

  try {
    const { data: subs, error: subsError } = await adminClient
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', receiverId);

    if (subsError) throw subsError;
    if (!subs || subs.length === 0) {
      return res.status(200).json({ sent: 0 });
    }

    const payload = JSON.stringify({
      title: senderName || 'New message',
      body: messageText.length > 120 ? messageText.slice(0, 117) + '...' : messageText,
      url: '/'
    });

    const results = await Promise.allSettled(
      subs.map(sub =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        ).catch(err => {
          // 404/410 = the push service says this subscription is dead; clean it up.
          if (err.statusCode === 404 || err.statusCode === 410) {
            return adminClient.from('push_subscriptions').delete().eq('id', sub.id);
          }
          throw err;
        })
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    return res.status(200).json({ sent, total: subs.length });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to send push notification' });
  }
}
