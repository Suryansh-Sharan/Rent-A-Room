import asyncio
import logging
import threading
from app.config import settings

logger = logging.getLogger(__name__)


def _send_email_sync(to_email: str, subject: str, html_body: str):
    """
    Synchronous Resend email sending. Intended to be called from a background thread.
    If RESEND_API_KEY is not configured, logs a warning and returns without error.
    """
    if not settings.RESEND_API_KEY:
        logger.warning(
            f"[EmailService] RESEND_API_KEY not configured — skipping email to {to_email}: {subject}"
        )
        return

    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY

        resend.Emails.send({
            "from": settings.EMAIL_FROM,
            "to": [to_email],
            "subject": subject,
            "html": html_body
        })
        logger.info(f"[EmailService] Email sent via Resend to {to_email}: {subject}")
    except Exception as e:
        logger.error(f"[EmailService] Resend failed for {to_email}: {str(e)}")


def _run_in_thread(to_email: str, subject: str, html_body: str):
    """Dispatch email in a daemon thread so it never blocks the request lifecycle."""
    thread = threading.Thread(
        target=_send_email_sync,
        args=(to_email, subject, html_body),
        daemon=True
    )
    thread.start()


async def send_owner_interest_notification(
    owner_email: str,
    owner_name: str,
    tenant_name: str,
    room_title: str,
    compatibility_score: int,
    message: str
):
    """
    Sends an email to the owner when a high-compatibility tenant expresses interest.
    """
    subject = f"🔔 High-Match Interest in Your Listing: {room_title}"
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background: #0f1117; color: #e8e8e8; padding: 32px; margin:0;">
      <div style="max-width: 560px; margin: 0 auto; background: #1a1d27; border-radius: 16px; padding: 32px; border: 1px solid #2a2d3e;">
        <h1 style="color: #d4af37; margin: 0 0 8px; font-size: 22px;">New Tenant Interest 🏠</h1>
        <p style="color: #9ca3af; margin: 0 0 24px; font-size: 14px;">
          Hi {owner_name}, a highly compatible tenant has expressed interest in your listing.
        </p>

        <div style="background: #12151f; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #d4af37;">
          <p style="margin: 0 0 10px; font-size: 14px;"><strong style="color:#d4af37;">Tenant:</strong> {tenant_name}</p>
          <p style="margin: 0 0 10px; font-size: 14px;"><strong style="color:#d4af37;">Room:</strong> {room_title}</p>
          <p style="margin: 0 0 10px; font-size: 14px;"><strong style="color:#d4af37;">Compatibility Score:</strong>
            <span style="background: #d4af37; color: #0f1117; padding: 2px 10px; border-radius: 20px; font-weight: bold; font-size: 13px;">
              {compatibility_score}/100 ✨
            </span>
          </p>
          {f'<p style="margin: 10px 0 0; font-size: 14px;"><strong style="color:#d4af37;">Message:</strong> {message}</p>' if message else ''}
        </div>

        <p style="color: #9ca3af; font-size: 13px;">
          Log in to <strong style="color:#d4af37;">Rent-A-Room</strong> to review and respond to this request.
        </p>
        <p style="color: #4b5563; font-size: 11px; margin-top: 32px; border-top: 1px solid #2a2d3e; padding-top: 16px;">
          This is an automated notification from Rent-A-Room AI. Do not reply to this email.
        </p>
      </div>
    </body>
    </html>
    """
    _run_in_thread(owner_email, subject, html_body)


async def send_tenant_status_notification(
    tenant_email: str,
    tenant_name: str,
    room_title: str,
    new_status: str,
    owner_note: str
):
    """
    Sends an email to the tenant when the owner accepts or rejects their interest request.
    """
    is_accepted = new_status == "accepted"
    subject = (
        f"✅ Your interest in '{room_title}' was accepted!"
        if is_accepted
        else f"ℹ️ Update on your interest in '{room_title}'"
    )
    status_label = "Accepted ✅" if is_accepted else "Declined ❌"
    status_color = "#22c55e" if is_accepted else "#ef4444"
    next_step = (
        "You can now chat directly with the owner to discuss move-in details!"
        if is_accepted
        else "Don't worry — keep exploring other listings on Rent-A-Room."
    )

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background: #0f1117; color: #e8e8e8; padding: 32px; margin:0;">
      <div style="max-width: 560px; margin: 0 auto; background: #1a1d27; border-radius: 16px; padding: 32px; border: 1px solid #2a2d3e;">
        <h1 style="color: #d4af37; margin: 0 0 8px; font-size: 22px;">Interest Request Update</h1>
        <p style="color: #9ca3af; margin: 0 0 24px; font-size: 14px;">
          Hi {tenant_name}, here's an update on your interest request.
        </p>

        <div style="background: #12151f; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid {status_color};">
          <p style="margin: 0 0 10px; font-size: 14px;"><strong style="color:#d4af37;">Room:</strong> {room_title}</p>
          <p style="margin: 0 0 10px; font-size: 14px;"><strong style="color:#d4af37;">Status:</strong>
            <span style="color: {status_color}; font-weight: bold;">{status_label}</span>
          </p>
          {f'<p style="margin: 10px 0 0; font-size: 14px;"><strong style="color:#d4af37;">Owner Note:</strong> {owner_note}</p>' if owner_note else ''}
        </div>

        <p style="color: #9ca3af; font-size: 13px;">{next_step}</p>
        <p style="color: #4b5563; font-size: 11px; margin-top: 32px; border-top: 1px solid #2a2d3e; padding-top: 16px;">
          This is an automated notification from Rent-A-Room AI. Do not reply to this email.
        </p>
      </div>
    </body>
    </html>
    """
    _run_in_thread(tenant_email, subject, html_body)
