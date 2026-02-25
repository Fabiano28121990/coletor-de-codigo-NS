import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface UploadRequest {
  filename: string;
  content: string;
  access_token: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { filename, content, access_token } = (await req.json()) as UploadRequest;

    if (!filename || !content || !access_token) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const metadata = {
      name: filename,
      mimeType: "text/plain",
    };

    const multipartBody = new FormData();
    multipartBody.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    multipartBody.append(
      "file",
      new Blob([content], { type: "text/plain" }),
      filename
    );

    const uploadResponse = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        body: multipartBody,
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error("Google Drive upload error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to upload to Google Drive" }),
        {
          status: uploadResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await uploadResponse.json();

    return new Response(JSON.stringify({ file_id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
