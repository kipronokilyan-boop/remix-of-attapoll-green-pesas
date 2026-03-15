import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LIPWA_API_KEY = Deno.env.get("LIPWA_API_KEY")?.trim();
    if (!LIPWA_API_KEY) throw new Error("LIPWA_API_KEY is not configured");

    const LIPWA_CHANNEL_ID = Deno.env.get("LIPWA_CHANNEL_ID")?.trim();
    if (!LIPWA_CHANNEL_ID || ["null", "undefined"].includes(LIPWA_CHANNEL_ID.toLowerCase())) {
      throw new Error("LIPWA_CHANNEL_ID is missing or invalid");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { amount, phone_number, package_name, user_id } = await req.json();

    if (!amount || !phone_number || !package_name) {
      return jsonResponse(400, { error: "Missing required fields: amount, phone_number, package_name" });
    }

    const cleanPhone = phone_number.replace(/\s/g, "");
    const phoneRegex = /^(\+254|254|0)[17]\d{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return jsonResponse(400, { error: "Invalid phone number format" });
    }

    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith("0")) formattedPhone = "+254" + formattedPhone.slice(1);
    else if (formattedPhone.startsWith("254")) formattedPhone = "+" + formattedPhone;

    const apiRef = `UPGRADE-${package_name}-${Date.now()}`;
    const callbackUrl = `${SUPABASE_URL}/functions/v1/lipwa-callback`;
    const metaRef = user_id ? `${apiRef}|uid:${user_id}` : apiRef;

    const { data: paymentRecord, error: dbError } = await supabase
      .from("payments")
      .insert({
        phone_number: formattedPhone,
        amount: Number(amount),
        package_name,
        status: "pending",
        api_ref: metaRef,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      throw new Error("Failed to create payment record");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    let response: Response;
    try {
      response = await fetch("https://pay.lipwa.app/api/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LIPWA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          callback_url: callbackUrl,
          channel_id: LIPWA_CHANNEL_ID,
          phone_number: formattedPhone,
          api_ref: metaRef,
        }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        await supabase.from("payments").update({ status: "failed" }).eq("id", paymentRecord.id);
        return jsonResponse(504, { success: false, error: "Payment request timed out. Please try again." });
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    const responseText = await response.text();
    let data: any = null;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      data = { raw: responseText };
    }

    if (!response.ok) {
      await supabase.from("payments").update({ status: "failed" }).eq("id", paymentRecord.id);

      const lipwaMessage = typeof data?.message === "string"
        ? data.message
        : typeof data?.error === "string"
          ? data.error
          : "";

      const isChannelError =
        response.status === 401 && lipwaMessage.toLowerCase().includes("channel id");

      const errorMessage = isChannelError
        ? "Payment channel is misconfigured. Update LIPWA_CHANNEL_ID with the exact channel id from your Lipwa dashboard."
        : `Lipwa API error [${response.status}]: ${JSON.stringify(data ?? { message: response.statusText })}`;

      console.error("Lipwa API error response:", {
        status: response.status,
        body: data,
      });

      return jsonResponse(response.status, { success: false, error: errorMessage });
    }

    return jsonResponse(200, { success: true, payment_id: paymentRecord.id, api_ref: metaRef });
  } catch (error: unknown) {
    console.error("Lipwa STK Push error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(500, { success: false, error: errorMessage });
  }
});
