import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Read access key from environment variables to keep it secure
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

    if (!accessKey) {
      console.error("WEB3FORMS_ACCESS_KEY is not defined in environment variables");
      return NextResponse.json(
        { success: false, error: "Mail service not configured" },
        { status: 500 }
      );
    }

    // Submit payload to Web3Forms API server-side
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        name,
        email,
        subject: subject || `Sabika Contact Form: ${name}`,
        message,
        from_name: "Sabika App Terminal",
      }),
    });

    const result = await response.json();

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      console.error("Web3Forms submission failed:", result);
      return NextResponse.json(
        { success: false, error: result.message || "Failed to deliver message" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
