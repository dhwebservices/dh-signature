import type { RenderedSignature, SignatureAssignment, SocialLink } from '@dh-signature/shared-types'

export const SIGNATURE_MARKER = 'DH_SIGNATURE_V1'

function socialBadge(link: SocialLink) {
  return `
    <a href="${link.href}" aria-label="${link.label}" style="display:inline-block;padding:0 10px;height:24px;line-height:24px;border:1px solid #d7dfef;border-radius:12px;background:#f7f9fc;color:#243047;text-decoration:none;font-size:11px;font-weight:600;">
      ${link.label}
    </a>
  `
}

function safeUrl(value: string, fallback = '') {
  if (!value) return fallback
  try {
    const url = new URL(value)
    return url.toString()
  } catch {
    return fallback
  }
}

function safeText(value: string, fallback = '') {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  return trimmed || fallback
}

function normalizeHref(value: string, fallback = '') {
  const trimmed = safeText(value)
  if (!trimmed) return fallback
  if (/^https?:\/\//i.test(trimmed)) return safeUrl(trimmed, fallback)
  if (/^[a-z0-9.-]+\.[a-z]{2,}([/?#]|$)/i.test(trimmed)) return safeUrl(`https://${trimmed}`, fallback)
  return fallback
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function renderSignature({ profile, template, branding, banner }: SignatureAssignment): RenderedSignature {
  const fullName = safeText(profile.fullName, profile.email)
  const title = safeText(profile.title, 'Staff member')
  const department = safeText(profile.department)
  const businessLandline = safeText(profile.businessLandline, safeText(profile.workPhone))
  const websiteUrl = safeUrl(profile.websiteUrl, 'https://dhwebsiteservices.co.uk')
  const workplaceUrl = safeUrl(profile.workplaceUrl)
  const bookingUrl = safeUrl(profile.bookingUrl)
  const logoUrl = safeUrl(branding.logoUrl, 'https://sig.dhwebsiteservices.co.uk/icons/dh-logo-icon.png')
  const companyName = safeText(branding.companyName, 'DH Website Services')
  const companyWebsiteLabel = safeText(branding.companyWebsiteLabel, 'dhwebsiteservices.co.uk')
  const workplaceLabel = safeText(branding.workplaceLabel, 'DH Workplace')
  const bookingLabel = safeText(branding.bookingLabel, 'Book a call')
  const privacyPolicyLabel = safeText(branding.privacyPolicyLabel, 'Privacy Policy')
  const privacyPolicyUrl = safeUrl(branding.privacyPolicyUrl, 'https://dhwebsiteservices.co.uk/privacy-policy')
  const validSocialLinks = profile.socialLinks
    .map((link) => ({ ...link, href: normalizeHref(link.href) }))
    .filter((link) => link.href)
  const departmentChip = template.showDepartmentChip
    ? department
      ? `
        <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:8px;">
          <tr>
            <td style="padding:5px 10px;border-radius:12px;background:#eef3ff;color:${template.accentColor};font-size:11px;font-weight:700;">
              ${escapeHtml(department)}
            </td>
          </tr>
        </table>
      `
      : ''
    : ''

  const bookingCta = template.showBookingCta
    ? bookingUrl
      ? `<a href="${bookingUrl}" style="display:inline-block;padding:9px 16px;border-radius:14px;background:${template.accentColor};color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;line-height:1;">${escapeHtml(bookingLabel)}</a>`
      : ''
    : ''

  const workplaceLink = template.showWorkplaceLink
    ? workplaceUrl
      ? `<a href="${workplaceUrl}" style="color:${template.secondaryColor};text-decoration:none;">${escapeHtml(workplaceLabel)}</a>`
      : ''
    : ''

  const bannerHtml = bannerBlock(profile.bookingUrl, template.accentColor, banner)
  const socialRow = validSocialLinks.length
    ? `
      <tr>
        <td style="padding-top:10px;font-size:11px;line-height:1.6;color:#5b6475;">
          ${validSocialLinks.map(socialBadge).join('&nbsp;')}
        </td>
      </tr>
    `
    : ''

  const disclaimerHtml = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin-top:18px;border-top:1px solid #d9e1f0;">
      <tr>
        <td style="padding-top:14px;font-size:11px;line-height:1.55;color:#5b6475;">
          <div style="margin-bottom:8px;">
        <strong style="color:#243047;">CONFIDENTIALITY NOTICE:</strong> This email (and any attachments) is intended only for the named recipient(s) and may contain confidential and/or legally privileged information. If you are not the intended recipient, please notify the sender immediately, delete this email from your system, and do not copy, disclose, or use its contents.
          </div>
          <div style="margin-bottom:8px;">
        <strong style="color:#243047;">SECURITY:</strong> Please do not open attachments or click links unless you recognise the sender and were expecting the message.
          </div>
          <div>
        <strong style="color:#243047;">PRIVACY:</strong> ${companyName} processes personal data in accordance with its <a href="${privacyPolicyUrl}" style="color:${template.secondaryColor};text-decoration:none;">${privacyPolicyLabel}</a>.
          </div>
        </td>
      </tr>
    </table>
  `.trim()

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1f2430;max-width:620px;">
      <!-- ${SIGNATURE_MARKER} -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:620px;">
        <tr>
          <td style="vertical-align:top;padding-right:16px;width:72px;">
            <img src="${logoUrl}" alt="${escapeHtml(companyName)}" width="56" height="56" style="display:block;width:56px;height:56px;border:0;" />
          </td>
          <td style="vertical-align:top;">
            <div style="font-size:28px;line-height:1.05;font-weight:700;color:#1f2430;">${escapeHtml(fullName)}</div>
            <div style="font-size:14px;line-height:1.4;color:#4c5568;padding-top:4px;">${escapeHtml(title)}</div>
            ${departmentChip}
            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:12px;">
              <tr>
                <td style="font-size:13px;line-height:1.8;color:#334155;">
                  <strong style="font-weight:700;">P</strong> <a href="tel:${businessLandline}" style="color:${template.secondaryColor};text-decoration:none;">${escapeHtml(businessLandline)}</a><br />
                  <strong style="font-weight:700;">W</strong> <a href="${websiteUrl}" style="color:${template.secondaryColor};text-decoration:none;">${escapeHtml(companyWebsiteLabel)}</a><br />
                  ${workplaceLink ? `<strong style="font-weight:700;">D</strong> ${workplaceLink}<br />` : ''}
                </td>
              </tr>
              ${bookingCta ? `<tr><td style="padding-top:12px;">${bookingCta}</td></tr>` : ''}
              ${socialRow}
            </table>
            ${bannerHtml}
            ${disclaimerHtml}
          </td>
        </tr>
      </table>
    </div>
  `.trim()

  const plainText = [
    `[${SIGNATURE_MARKER}]`,
    fullName,
    title,
    department,
    businessLandline ? `P ${businessLandline}` : '',
    companyWebsiteLabel,
    template.showWorkplaceLink && workplaceUrl ? workplaceLabel : '',
    template.showBookingCta && bookingUrl ? bookingLabel : '',
    ...validSocialLinks.map((link) => `${link.label}: ${link.href}`),
    banner?.headline || '',
    banner?.body || '',
    banner ? `${banner.ctaLabel}: ${banner.ctaHref || bookingUrl}` : '',
    '',
    'CONFIDENTIALITY NOTICE: This email (and any attachments) is intended only for the named recipient(s) and may contain confidential and/or legally privileged information. If you are not the intended recipient, please notify the sender immediately, delete this email from your system, and do not copy, disclose, or use its contents.',
    'SECURITY: Please do not open attachments or click links unless you recognise the sender and were expecting the message.',
    `PRIVACY: ${companyName} processes personal data in accordance with its ${privacyPolicyLabel}: ${privacyPolicyUrl}`,
  ].filter(Boolean).join('\n')

  return { html, plainText }
}

function bannerBlock(defaultHref: string, accentColor: string, banner?: SignatureAssignment['banner']) {
  if (!banner) return ''
  const headline = safeText(banner.headline)
  const body = safeText(banner.body)
  if (!headline || !body) return ''
  const ctaLabel = safeText(banner.ctaLabel, 'Learn more')
  const ctaHref = safeUrl(banner.ctaHref, safeUrl(defaultHref))

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin-top:16px;background:#eef5fb;border:1px solid #d7e3f2;border-radius:16px;">
      <tr>
        <td style="padding:16px 18px;">
          <div style="font-size:14px;line-height:1.35;font-weight:700;color:#1f2430;">${escapeHtml(headline)}</div>
          <div style="font-size:12px;line-height:1.55;color:#526079;padding-top:6px;">${escapeHtml(body)}</div>
          <div style="padding-top:12px;">
            <a href="${ctaHref}" style="display:inline-block;padding:9px 14px;border-radius:14px;background:${accentColor};color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;line-height:1;">${escapeHtml(ctaLabel)}</a>
          </div>
        </td>
      </tr>
    </table>
  `.trim()
}
