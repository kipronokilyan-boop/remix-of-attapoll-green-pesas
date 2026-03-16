import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const packageConfig: Record<string, { surveys_per_day: number; min_withdrawal: number }> = {
  basic: { surveys_per_day: 10, min_withdrawal: 3000 },
  premium: { surveys_per_day: 15, min_withdrawal: 2500 },
  expert: { surveys_per_day: 20, min_withdrawal: 2000 },
  platinum: { surveys_per_day: 40, min_withdrawal: 1000 },
  diamond: { surveys_per_day: 60, min_withdrawal: 500 },
  elite: { surveys_per_day: 80, min_withdrawal: 200 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    console.log('Lipwa callback received:', JSON.stringify(body));

    const apiRef = body.api_ref;
    const paymentStatus = body.payment_status || body.status;
    const lipwaReference = body.reference || body.checkout_request_id || '';

    if (!apiRef) {
      return new Response(JSON.stringify({ error: 'Missing api_ref' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Find the payment record
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('api_ref', apiRef)
      .maybeSingle();

    if (findError || !payment) {
      console.error('Payment not found:', apiRef, findError);
      return new Response(JSON.stringify({ error: 'Payment not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const statusLower = (paymentStatus || '').toString().toLowerCase();
    const isSuccess = statusLower === 'success' || statusLower === 'completed' || statusLower === 'payment.success';
    const newStatus = isSuccess ? 'completed' : 'failed';

    await supabase.from('payments').update({
      status: newStatus,
      lipwa_reference: lipwaReference,
    }).eq('id', payment.id);

    // If successful, upgrade user account
    if (isSuccess) {
      const config = packageConfig[payment.package_name] || packageConfig.basic;

      // Extract user_id from api_ref if present (format: UPGRADE-pkg-timestamp|uid:user_id)
      let userId: string | null = null;
      if (apiRef.includes('|uid:')) {
        userId = apiRef.split('|uid:')[1];
      }

      if (userId) {
        // Try to find existing account by user_id
        const { data: existingAccount } = await supabase
          .from('user_accounts')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (existingAccount) {
          await supabase.from('user_accounts').update({
            account_type: payment.package_name,
            surveys_per_day: config.surveys_per_day,
            min_withdrawal: config.min_withdrawal,
          }).eq('user_id', userId);
        } else {
          await supabase.from('user_accounts').insert({
            user_id: userId,
            phone_number: payment.phone_number,
            account_type: payment.package_name,
            surveys_per_day: config.surveys_per_day,
            min_withdrawal: config.min_withdrawal,
          });
        }
      } else {
        // Fallback: use phone_number
        const { data: existingAccount } = await supabase
          .from('user_accounts')
          .select('*')
          .eq('phone_number', payment.phone_number)
          .maybeSingle();

        if (existingAccount) {
          await supabase.from('user_accounts').update({
            account_type: payment.package_name,
            surveys_per_day: config.surveys_per_day,
            min_withdrawal: config.min_withdrawal,
          }).eq('phone_number', payment.phone_number);
        } else {
          await supabase.from('user_accounts').insert({
            phone_number: payment.phone_number,
            account_type: payment.package_name,
            surveys_per_day: config.surveys_per_day,
            min_withdrawal: config.min_withdrawal,
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    console.error('Lipwa callback error:', error);
    return new Response(JSON.stringify({ success: false }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
